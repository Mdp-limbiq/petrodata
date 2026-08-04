import type { Metadata } from 'next'
import nextDynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'
import { RefreshCw } from 'lucide-react'
import { NothingHeader } from '@/components/Nothing/Header'
import { NothingFooter } from '@/components/Nothing/Footer'
import { api, type ApiSchemas } from '@/api/client'
import { formatMonth } from '@/utilities/formatNumber'
import { getSocialImageURL } from '@/utilities/getSocialImageURL'
import { buildAlternates } from '@/i18n/alternates'
import { SectionLabel } from '@/components/Petrodata/SectionLabel'
import { NewsCard } from '@/components/Petrodata/news/NewsCard'
import type { NewsCard as NewsCardType } from '@/api/news'
import { AnimatedCounter } from '@/components/Petrodata/dashboard/AnimatedCounter'
import { HeroCards, type StatCardData } from '@/components/Petrodata/dashboard/HeroCards'
import { VmShareDonut } from '@/components/Petrodata/dashboard/VmShareDonut'
import { TopOperatorsMini } from '@/components/Petrodata/dashboard/TopOperatorsMini'
import type { ChartRow } from '@/components/Petrodata/dashboard/operatorPalette'

const MapPreview = nextDynamic(
  () =>
    import('@/components/Petrodata/dashboard/MapPreview').then((m) => ({ default: m.MapPreview })),
  { loading: () => <div className="h-[280px] w-full animate-pulse bg-nd-surface-raised" /> },
)

const MapBand = nextDynamic(
  () => import('@/components/Petrodata/dashboard/MapBand').then((m) => ({ default: m.MapBand })),
  {
    loading: () => (
      <div className="h-[320px] w-full animate-pulse rounded-[10px] bg-nd-surface-raised" />
    ),
  },
)

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: buildAlternates('/'),
    openGraph: {
      images: [{ url: getSocialImageURL(), width: 1200, height: 630, alt: 'Vaca Muerta dashboard' }],
    },
  }
}

type LatestSummary = ApiSchemas['LatestSummaryDto']
type OperatorListItem = ApiSchemas['OperatorListItemDto']
type OperatorPoint = ApiSchemas['OperatorTimeSeriesPointDto']
type WellFC = ApiSchemas['GeoWellFeatureCollectionDto']
type DataFreshness = ApiSchemas['DataFreshnessDto']

const EMPTY_FC: WellFC = { type: 'FeatureCollection', features: [] } as WellFC
const TOP_N_OPERATORS = 5

async function getLatest(): Promise<LatestSummary | null> {
  try {
    const { data, error } = await api.GET('/api/v1/production/latest', { next: { revalidate: 300 } })
    if (error || !data) return null
    return data.data
  } catch {
    return null
  }
}

async function getOperators(): Promise<OperatorListItem[]> {
  try {
    const { data, error } = await api.GET('/api/v1/operators', {
      params: { query: { sort: 'boe', order: 'desc' } },
      next: { revalidate: 300 },
    })
    if (error || !data) return []
    return data.data
  } catch {
    return []
  }
}

async function getTopOperatorSeries(
  topOperators: OperatorListItem[],
): Promise<{ slug: string; name: string; points: OperatorPoint[] }[]> {
  try {
    const slugs = topOperators.map((op) => op.operator_slug).join(',')
    const { data, error } = await api.GET('/api/v1/operators/production', {
      params: { query: { slugs, months: 12 } },
      next: { revalidate: 300 },
    })
    if (error || !data) return []
    const nameBy = new Map(topOperators.map((op) => [op.operator_slug, op.operator_name]))
    return data.data.map((s) => ({
      slug: s.operator_slug,
      name: nameBy.get(s.operator_slug) ?? s.operator_slug,
      points: s.points,
    }))
  } catch {
    return []
  }
}

async function getWells(): Promise<WellFC> {
  try {
    const { data, error } = await api.GET('/api/v1/geo/wells', {
      params: { query: { formation: 'vaca_muerta', limit: 1000 } },
      next: { revalidate: 300 },
    })
    if (error || !data) return EMPTY_FC
    return data
  } catch {
    return EMPTY_FC
  }
}

/** Latest 3 headlines for the homepage band — cached with the rest of the landing page. */
async function getLatestNews(): Promise<NewsCardType[]> {
  try {
    const { data, error } = await api.GET('/api/v1/news', {
      params: { query: { pageSize: 3, sort: 'recent' } as never },
      next: { revalidate: 300 },
    })
    if (error || !data) return []
    return (data as unknown as { data: NewsCardType[] }).data ?? []
  } catch {
    return []
  }
}

async function getFreshness(): Promise<DataFreshness | null> {
  try {
    const { data, error } = await api.GET('/api/v1/data-freshness', { next: { revalidate: 300 } })
    if (error || !data) return null
    return data.data
  } catch {
    return null
  }
}

/**
 * Build the union of monthly buckets across the top-N operators.
 * Returns last 12 months sorted ascending.
 */
function buildChartRows(
  series: { slug: string; points: OperatorPoint[] }[],
): ChartRow[] {
  const bucket = new Map<string, ChartRow>()
  for (const { slug, points } of series) {
    for (const p of points) {
      const row = bucket.get(p.date_month) ?? ({ date_month: p.date_month } as ChartRow)
      row[slug] = (row[slug] ?? 0) + p.boe
      bucket.set(p.date_month, row)
    }
  }
  return [...bucket.values()]
    .sort((a, b) => a.date_month.localeCompare(b.date_month))
    .slice(-12)
}

/** national-ish monthly totals derived from the top-N series (proxy). */
function buildNationalSeries(rows: ChartRow[], slugs: string[]) {
  return rows.map((row) => {
    let boe = 0
    const oilBblD = 0
    const gasMmcfD = 0
    const wells = 0
    for (const slug of slugs) {
      boe += row[slug] ?? 0
    }
    return { date_month: row.date_month, boe, oilBblD, gasMmcfD, wells }
  })
}

function computeMoM(values: number[]): number | null {
  if (values.length < 2) return null
  const last = values[values.length - 1]
  const prev = values[values.length - 2]
  if (!Number.isFinite(prev) || prev === 0) return null
  return (last - prev) / prev
}

export default async function DashboardPage() {
  const [t, tCommon, latest, operators, wells, freshness, news] = await Promise.all([
    getTranslations('dashboard'),
    getTranslations('common'),
    getLatest(),
    getOperators(),
    getWells(),
    getFreshness(),
    getLatestNews(),
  ])

  const topOperators = operators.slice(0, TOP_N_OPERATORS)
  const series = await getTopOperatorSeries(topOperators)

  const chartRows = buildChartRows(series)
  const slugs = topOperators.map((op) => op.operator_slug)
  const nationalSeries = buildNationalSeries(chartRows, slugs)

  if (!latest) {
    return (
      <>
        <NothingHeader />
        <main className="flex-1 flex items-center justify-center text-nd-text-disabled text-sm font-mono">
          {tCommon('backendOffline', {
            url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
          })}
        </main>
      </>
    )
  }

  // For oil/gas/wells MoM we need per-operator oil/gas time series too. The
  // /operators/{slug}/production endpoint returns those fields. Re-aggregate:
  const oilSeries = chartRows.map((row) => {
    let v = 0
    for (const { points } of series) {
      const p = points.find((pp) => pp.date_month === row.date_month)
      if (p) v += p.oil_bbl_d
    }
    return v
  })
  const gasSeries = chartRows.map((row) => {
    let v = 0
    for (const { points } of series) {
      const p = points.find((pp) => pp.date_month === row.date_month)
      if (p) v += p.gas_mmcf_d
    }
    return v
  })
  const wellsSeries = chartRows.map((row) => {
    let v = 0
    for (const { points } of series) {
      const p = points.find((pp) => pp.date_month === row.date_month)
      if (p) v += p.active_wells
    }
    return v
  })
  const oilMoM = computeMoM(oilSeries)
  const gasMoM = computeMoM(gasSeries)
  const wellsMoM = computeMoM(wellsSeries)

  const monthLabel = formatMonth(latest.date_month as string | null | undefined)
  const momFootnote = `${monthLabel.toUpperCase()} · ${t('kpi.momSuffix')}`

  const heroCards: StatCardData[] = [
    {
      label: t('kpi.oilLatest'),
      value: latest.oil_bbl_d,
      format: 'compact',
      unit: 'bbl/d',
      mom: oilMoM,
      footnote: momFootnote,
      icon: 'line',
      accent: 'var(--nd-success)',
    },
    {
      label: t('kpi.gasLatest'),
      value: latest.gas_mmcf_d,
      format: 'compact',
      gas: true,
      mom: gasMoM,
      footnote: momFootnote,
      icon: 'droplet',
      accent: 'var(--nd-text-secondary)',
    },
    {
      label: t('kpi.vmShare'),
      value: latest.vm_share.boe * 100,
      format: 'percent',
      mom: null,
      footnote: t('boeSuffix'),
      icon: 'bars',
      accent: 'var(--nd-success)',
    },
    {
      label: t('kpi.activeWells'),
      value: latest.active_wells,
      format: 'integer',
      mom: wellsMoM,
      footnote: momFootnote,
      icon: 'doc',
      accent: 'var(--nd-text-secondary)',
    },
  ]

  const totalWellsCount = freshness?.tables.dim_well?.rows ?? null
  const headlineBoe = nationalSeries.length > 0 ? nationalSeries[nationalSeries.length - 1].boe : latest.boe

  return (
    <>
      <NothingHeader />
      <main className="flex-1 w-full overflow-x-clip">
        {/* HERO */}
        <section className="container pt-12 md:pt-20 pb-8 md:pb-10">
          <div className="flex flex-col gap-2">
            <span
              className="text-nd-text-secondary text-[11px] tracking-[0.08em] uppercase font-mono"
            >
              {t('eyebrow', { month: monthLabel.toUpperCase() })}
            </span>
            <h1
              className="mt-2 text-balance text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl leading-none tabular-nums font-display break-words"
              style={{
                color: 'var(--nd-text-display)',
              }}
            >
              <AnimatedCounter to={headlineBoe} kind="integer" duration={1600} />{' '}
              <span
                className="text-nd-text-disabled text-lg sm:text-2xl md:text-3xl font-mono"
              >
                {t('boeSuffix')}
              </span>
            </h1>
            <p
              className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-nd-text-secondary font-sans"
            >
              {t('tagline')}
            </p>
          </div>

          <div className="mt-10">
            <HeroCards cards={heroCards} />
          </div>
        </section>

        {/* THREE-PANEL */}
        <section className="container pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <VmShareDonut shareBoe={latest.vm_share.boe} />
            <TopOperatorsMini
              rows={topOperators.map((op) => ({
                slug: op.operator_slug,
                name: op.operator_name,
                boe: op.boe,
              }))}
            />
            <MapPreview wells={wells} totalWells={totalWellsCount} />
          </div>
        </section>

        {/* PRODUCTION CHART — hidden; restore this block and `operatorMeta` above to bring it back. */}

        {/* EL MAPA */}
        <section className="container pb-10">
          <SectionLabel title={t('mapBand.label')} />
          <MapBand catalogWells={totalWellsCount} liveWells={wells.features.length} />
        </section>

        {/* ÚLTIMAS NOTICIAS */}
        {news.length > 0 && (
          <section className="container pb-10">
            <SectionLabel title={t('news.label')} note={t('news.all')} noteHref="/noticias" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {news.map((card) => (
                <NewsCard key={card.docId} card={card} />
              ))}
            </div>
          </section>
        )}

        {/* DATA FRESHNESS BAR */}
        <section className="container pb-10">
          <div
            className="border border-nd-border bg-nd-surface px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.08em] text-nd-text-disabled font-mono"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={11} />
              {t('freshness.dataThrough', { month: monthLabel })}
            </span>
          </div>
        </section>

      </main>
      <NothingFooter />
    </>
  )
}
