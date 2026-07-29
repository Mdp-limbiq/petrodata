import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { NothingHeader } from '@/components/Nothing/Header'
import { NothingFooter } from '@/components/Nothing/Footer'
import { FooterNewsletterForm } from '@/components/Nothing/FooterNewsletterForm'
import { buildAlternates } from '@/i18n/alternates'
import { fetchInversiones } from '@/api/inversiones'
import { api, type ApiSchemas } from '@/api/client'
import { ContributionTable } from '@/components/Petrodata/indicadores/ContributionTable'
import { KpiGrid } from '@/components/Petrodata/indicadores/KpiGrid'
import { RampChart } from '@/components/Petrodata/indicadores/RampChart'
import { OperatorLeaderboard } from '@/components/Petrodata/indicadores/OperatorLeaderboard'
import { BreakevenTrend } from '@/components/Petrodata/indicadores/BreakevenTrend'
import { ActividadChart } from '@/components/Petrodata/indicadores/ActividadChart'
import { CruceChart } from '@/components/Petrodata/indicadores/CruceChart'
import { TransportInfra } from '@/components/Petrodata/indicadores/TransportInfra'
import { WorldStage } from '@/components/Petrodata/indicadores/WorldStage'
import { SourceChip } from '@/components/Petrodata/indicadores/SourceChip'
import { SectionLabel } from '@/components/Petrodata/SectionLabel'
import { DayValueCard } from '@/components/Petrodata/indicadores/DayValueCard'
import { VmHighlightCard } from '@/components/Petrodata/indicadores/VmHighlightCard'

// ISR: investment figures update ~monthly, so a 1h revalidate makes the page
// near-instant while staying fresh (the fetch is also tagged 'inversiones' for
// on-demand purge via revalidateTag).
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('indicadores')
  return { title: t('title'), description: t('blurb'), alternates: buildAlternates('/indicadores') }
}

async function fetchContribution(): Promise<ApiSchemas['OperatorContributionDto'] | null> {
  try {
    const { data, error } = await api.GET('/api/v1/operators/contribution', {
      next: { revalidate: 3600 },
    })
    if (error || !data) return null
    return data.data
  } catch {
    return null
  }
}

export default async function IndicadoresPage() {
  const locale = await getLocale()
  const lang = locale === 'en' ? 'en' : 'es'
  const [t, data, contribution] = await Promise.all([
    getTranslations('indicadores'),
    fetchInversiones(lang),
    fetchContribution(),
  ])

  // KPI figures feed the day-value + highlight cards above the fold.
  const kpiValue = (id: string): number | null =>
    data?.kpis.find((k) => k.id === id)?.figure.value ?? null

  if (!data) {
    return (
      <>
        <NothingHeader />
        <main className="flex-1 w-full overflow-x-clip">
          <section className="container pt-12 pb-20 md:pt-20">
            <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-nd-text-secondary">
              {t('eyebrow')}
            </span>
            <h1 className="mt-4 text-balance text-4xl leading-none text-nd-text-display sm:text-5xl md:text-7xl font-display">
              {t('title')}
            </h1>
            <p className="mt-8 font-mono text-sm text-nd-text-disabled">{t('noData')}</p>
          </section>
        </main>
        <NothingFooter />
      </>
    )
  }

  return (
    <>
      <NothingHeader />
      <main className="flex-1 w-full overflow-x-clip">
        {/* Hero */}
        <section className="container border-b border-nd-border pt-8 pb-6 md:pt-12">
          <span className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-nd-text-disabled">
            <span
              className="nd-live-dot inline-block size-1.5 rounded-full"
              style={{ background: 'var(--nd-accent)' }}
              aria-hidden
            />
            {t('eyebrow')}
          </span>
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-[-0.02em] text-nd-text-display sm:text-4xl font-display break-words">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
            {t('blurb')}
          </p>
        </section>

        {/* What a day is worth + what Vaca Muerta is inside the country */}
        <section className="container pt-8 pb-12">
          <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            {contribution && data.breakeven ? (
              <DayValueCard
                inputs={{
                  oilBbl: contribution.totals.oil_bbl,
                  grossValueUsd: contribution.totals.gross_value_usd,
                  brentAvgUsd:
                    contribution.assumptions.brent_avg_usd_bbl ?? data.breakeven.brentUsd,
                  oilDiscountUsd: contribution.assumptions.oil_discount_usd_bbl,
                  months: contribution.window.months,
                  gdpUsd: contribution.totals.gdp_usd,
                  gdpYear: contribution.totals.gdp_year,
                  brentSpotUsd: data.breakeven.brentUsd,
                  breakevenUsd: data.breakeven.referenceUsd,
                }}
              />
            ) : null}
            <VmHighlightCard
              oilSharePct={kpiValue('participacion_petroleo')}
              gasSharePct={kpiValue('participacion_gas')}
              wells={kpiValue('pozos_activos')}
            />
          </div>
        </section>

        {/* Headline + integrity framing */}
        <section className="container pb-10">
          <p className="max-w-3xl text-pretty text-2xl leading-snug text-nd-text-display md:text-3xl font-display">
            {data.headline}
          </p>
          {data.note ? (
            <p className="mt-4 max-w-2xl text-pretty font-mono text-[11px] leading-relaxed text-nd-text-disabled">
              {data.note}
            </p>
          ) : null}
        </section>

        {/* Thesis in six figures — national oil production is intentionally
            hidden (VM-focused page) */}
        <section className="container pb-16">
          <SectionLabel
            title={t('thesisLabel')}
            note={data.asOf ? t('asOf', { month: data.asOf }) : null}
          />
          <KpiGrid kpis={data.kpis.filter((k) => k.id !== 'produccion_nacional')} />
        </section>

        {/* Breakeven headroom trend */}
        {data.breakeven ? (
          <section className="container pb-16">
            <SectionLabel index="01" title={t('breakevenTitle')} note="US$/BBL" />
            <div className="overflow-hidden rounded-[10px] border border-nd-border">
              <BreakevenTrend breakeven={data.breakeven} />
            </div>
          </section>
        ) : null}

        {/* Production ramp chart */}
        {data.serie && data.serie.points.length ? (
          <section className="container pb-16">
            <SectionLabel index="02" title={data.serie.title} note={data.serie.unit} />
            <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
              <RampChart points={data.serie.points} />
            </div>
            <span className="mt-3 inline-block">
              <SourceChip source={data.serie.source} />
            </span>
          </section>
        ) : null}

        {/* Activity momentum — new wells per month */}
        {data.actividad && data.actividad.points.length ? (
          <section className="container pb-16">
            <SectionLabel index="03" title={t('actividadTitle')} note={data.actividad.unit} />
            <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
              <ActividadChart actividad={data.actividad} />
            </div>
            <span className="mt-3 inline-block">
              <SourceChip source={data.actividad.source} />
            </span>
          </section>
        ) : null}

        {/* Agro vs energy export crossover */}
        {data.cruce && data.cruce.points.length ? (
          <section className="container pb-16">
            <SectionLabel index="04" title={data.cruce.title} note={data.cruce.unit} />
            <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
              {t('cruceBlurb')}
            </p>
            <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
              <CruceChart cruce={data.cruce} />
            </div>
            <span className="mt-3 inline-block">
              <SourceChip source={data.cruce.source} />
            </span>
          </section>
        ) : null}

        {/* Operator leaderboard */}
        {data.operadores.length ? (
          <section className="container pb-16">
            <SectionLabel index="05" title={t('operatorsTitle')} />
            <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
              <OperatorLeaderboard operadores={data.operadores} />
            </div>
            {data.asOf ? (
              <span className="mt-3 inline-block">
                <SourceChip source={{ asOf: data.asOf }} />
              </span>
            ) : null}
          </section>
        ) : null}

        {/* Economic contribution per operator */}
        {contribution && contribution.operators.length ? (
          <section className="container pb-16">
            <SectionLabel index="06" title={t('contribution.title')} />
            <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
              {t('contribution.blurb')}
            </p>
            <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
              <ContributionTable data={contribution} />
            </div>
          </section>
        ) : null}

        {/* Transport infrastructure — the trunk pipeline network */}
        <section className="container pb-16">
          <SectionLabel index="07" title={t('transportTitle')} />
          <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
            {t('transportBlurb')}
          </p>
          <TransportInfra />
        </section>

        {/* Argentina en el mundo — the catapult section */}
        {data.mundo && data.mundo.rankings.length ? (
          <section className="container pb-16">
            <SectionLabel index="08" title={t('worldTitle')} />
            <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
              {t('worldBlurb')}
            </p>
            <WorldStage mundo={data.mundo} />
          </section>
        ) : null}

        {/* CTA band */}
        <section className="border-t border-nd-border bg-nd-surface">
          <div className="container flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-balance text-2xl leading-snug text-nd-text-display md:text-3xl font-display">
                {t('ctaTitle')}
              </h2>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
                {t('ctaBody')}
              </p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <a
                href="mailto:info@vacamuerta.io?subject=Inversiones%20Vaca%20Muerta"
                className="inline-flex w-fit items-center gap-2 bg-nd-text-display px-5 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-nd-surface transition-opacity hover:opacity-80"
              >
                {t('ctaContact')} →
              </a>
              <div>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-disabled">
                  {t('ctaNewsletter')}
                </span>
                <FooterNewsletterForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <NothingFooter />
    </>
  )
}
