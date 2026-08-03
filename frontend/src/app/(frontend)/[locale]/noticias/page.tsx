import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NothingHeader } from '@/components/Nothing/Header'
import { NothingFooter } from '@/components/Nothing/Footer'
import { buildAlternates } from '@/i18n/alternates'
import { fetchNews, fetchNewsFacets, type NewsListParams } from '@/api/news'
import { SectionLabel } from '@/components/Petrodata/SectionLabel'
import { NewsCard } from '@/components/Petrodata/news/NewsCard'
import { NewsFeatured } from '@/components/Petrodata/news/NewsFeatured'
import { NewsSecondaryRow } from '@/components/Petrodata/news/NewsSecondaryRow'
import { NewsFilters } from '@/components/Petrodata/news/NewsFilters'
import { NewsTopicChips } from '@/components/Petrodata/news/NewsTopicChips'
import { NewsPager } from '@/components/Petrodata/news/NewsPager'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Stories flanking the featured card on page one. */
const SECONDARY_COUNT = 4

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('noticias')
  return { title: t('title'), description: t('blurb'), alternates: buildAlternates('/noticias') }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export default async function NoticiasPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const t = await getTranslations('noticias')

  const page = first(sp.page) ? Number(first(sp.page)) : 1
  const params: NewsListParams = {
    page,
    pageSize: 24,
    // Default to newest-first; importance only when explicitly requested.
    sort: first(sp.sort) === 'importance' ? 'importance' : 'recent',
    family: first(sp.family),
    topic: first(sp.topic),
    entity: first(sp.entity),
    region: first(sp.region),
    q: first(sp.q),
  }

  const [facets, result] = await Promise.all([fetchNewsFacets(), fetchNews(params)])
  const { items, pagination } = result

  // The lead story and its four followers only headline page one; deeper pages
  // are a plain grid.
  const lead = page === 1 ? items[0] : undefined
  const secondary = page === 1 ? items.slice(1, 1 + SECONDARY_COUNT) : []
  const grid = page === 1 ? items.slice(1 + SECONDARY_COUNT) : items

  // Flat record of the active query, for building pager links.
  const activeParams: Record<string, string | undefined> = {
    sort: first(sp.sort),
    family: params.family,
    topic: params.topic,
    entity: params.entity,
    region: params.region,
    q: params.q,
  }

  return (
    <>
      <NothingHeader />
      <main className="flex-1 w-full overflow-x-clip">
        {/* HERO */}
        <section className="container border-b border-nd-border pb-6 pt-10 md:pt-14">
          <div className="min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-nd-text-disabled font-mono">
              {t('eyebrow')}
            </span>
            <h1 className="mt-2.5 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-nd-text-display md:text-4xl font-display">
              {t('heading')}
            </h1>
            <p className="mt-2.5 max-w-[640px] text-pretty text-[13.5px] leading-relaxed text-nd-text-secondary font-sans">
              {t('blurb')}
            </p>
          </div>
          {/* Sponsor strip hidden for now — <NewsSponsors /> is ready when it
              should come back. */}
        </section>

        {/* DESTACADA */}
        {lead ? (
          <section className="container pt-8">
            <SectionLabel title={t('featuredLabel')} />
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[452px_1fr] lg:gap-9">
              <NewsFeatured card={lead} />
              {secondary.length > 0 && (
                <div className="flex flex-col gap-3">
                  {secondary.map((card) => (
                    <NewsSecondaryRow key={card.docId} card={card} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* ÚLTIMAS NOTICIAS */}
        <section className="container pb-20 pt-12">
          <SectionLabel title={t('latestLabel')} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <NewsTopicChips topics={facets.topics.slice(0, 6)} />
            <NewsFilters facets={facets} />
          </div>

          {grid.length ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {grid.map((card) => (
                <NewsCard key={card.docId} card={card} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-nd-text-disabled font-mono">{t('noResults')}</p>
          )}

          <NewsPager pagination={pagination} params={activeParams} />
        </section>
      </main>
      <NothingFooter />
    </>
  )
}
