import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NothingHeader } from '@/components/Nothing/Header'
import { NothingFooter } from '@/components/Nothing/Footer'
import { api } from '@/api/client'
import { buildAlternates } from '@/i18n/alternates'
import { CompanyList, type CompanyCard } from '@/components/Petrodata/entities/CompanyList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null)

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('companies')
  return { title: t('listTitle'), alternates: buildAlternates('/companies') }
}

async function getCompanies() {
  try {
    const { data, error } = await api.GET('/api/v2/companies', { cache: 'no-store' })
    if (error || !data) return []
    return data.data
  } catch {
    return []
  }
}

// operator_slug → share of the sector's gross production value in US$ (company
// slugs equal operator slugs for O&G companies).
async function getValueShares(): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  try {
    const { data, error } = await api.GET('/api/v1/operators/contribution', { next: { revalidate: 3600 } })
    const total = data?.data.totals.gross_value_usd
    if (error || !total) return map
    for (const o of data.data.operators) map.set(o.operator_slug, o.gross_value_usd / total)
    return map
  } catch {
    return map
  }
}

export default async function CompaniesPage() {
  const [t, companies, valueShares] = await Promise.all([
    getTranslations('companies'),
    getCompanies(),
    getValueShares(),
  ])
  // Oil & gas focus: drop pure-mining companies (keep oil_and_gas and mixed).
  const cards: CompanyCard[] = companies
    .filter((c) => c.type !== 'mining')
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      type: c.type,
      sector: c.sector,
      logoUrl: str(c.logo_url),
      ticker: str(c.stock_ticker),
      exchange: str(c.stock_exchange),
      isPublic: c.is_public,
      projectCount: c.project_count_oil_gas,
      commodities: c.commodities ?? [],
      nationalShareBoe: typeof c.national_share_boe === 'number' ? c.national_share_boe : null,
      valueShare: valueShares.get(c.slug) ?? null,
    }))

  return (
    <>
      <NothingHeader />
      <main className="flex-1 w-full overflow-x-clip">
        <section className="container pt-12 pb-8 md:pt-20">
          <span className="block text-[11px] uppercase tracking-[0.08em] text-nd-text-secondary font-mono">
            {t('listEyebrow')}
          </span>
          <h1 className="mt-4 text-balance text-4xl sm:text-5xl leading-none text-nd-text-display md:text-7xl font-display break-words">
            {t('listTitle')}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-nd-text-secondary font-sans">
            {t('listBlurb')}
          </p>
        </section>
        <section className="container pb-20">
          <CompanyList companies={cards} />
        </section>
      </main>
      <NothingFooter />
    </>
  )
}
