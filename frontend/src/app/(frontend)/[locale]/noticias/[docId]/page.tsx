import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { NothingHeader } from '@/components/Nothing/Header'
import { NothingFooter } from '@/components/Nothing/Footer'
import { buildAlternates } from '@/i18n/alternates'
import { fetchNewsDoc } from '@/api/news'
import { SectionLabel } from '@/components/Petrodata/SectionLabel'
import { NewsCard } from '@/components/Petrodata/news/NewsCard'
import { NewsBody } from '@/components/Petrodata/news/NewsBody'
import { NewsPhoto } from '@/components/Petrodata/news/NewsPhoto'
import {
  categoryStyle,
  fallbackTopicLabel,
  photoFor,
} from '@/components/Petrodata/news/categories'
import {
  absoluteDate,
  entityList,
  isMetadataOnly,
  primaryCategory,
  pullQuote,
  readingMinutes,
  splitAttachments,
} from '@/components/Petrodata/news/meta'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ docId: string }>
}): Promise<Metadata> {
  const { docId } = await params
  const res = await fetchNewsDoc(docId)
  if (!res) return { title: 'Noticias' }
  return {
    title: res.document.title,
    description: res.document.deck ?? undefined,
    alternates: buildAlternates(`/noticias/${docId}`),
  }
}

export default async function NoticiaDetailPage({
  params,
}: {
  params: Promise<{ docId: string }>
}) {
  const { docId } = await params
  const [t, res] = await Promise.all([getTranslations('noticias'), fetchNewsDoc(docId)])
  if (!res) notFound()

  const { document: doc, cluster } = res
  const metadataOnly = isMetadataOnly(doc.legalMode)
  const entities = entityList(doc)
  const topics = doc.topics ?? []
  const category = primaryCategory(doc)
  const style = categoryStyle(category.topic)
  const labelKey = category.topic ?? doc.sourceFamily
  const categoryLabel = t.has(`topicLabels.${labelKey}`)
    ? t(`topicLabels.${labelKey}`)
    : category.label || fallbackTopicLabel(labelKey)

  const { images, documents } = splitAttachments(doc.attachments)
  const hasBody = !metadataOnly && !!doc.bodyText
  const minutes = hasBody ? readingMinutes(doc.bodyText) : 0
  const heroImage = !metadataOnly ? images[0] : undefined
  const bodyImages = heroImage ? images.slice(1) : []
  const highlight = hasBody ? pullQuote(doc.bodyText) : null
  const heroSrc = heroImage?.url || doc.image || photoFor(category.topic, doc.docId)
  // Only a stock fallback needs the "file photo" credit; real artwork credits the outlet.
  const heroCredit =
    heroImage?.title || (heroImage || doc.image ? doc.sourceName : t('filePhoto'))

  return (
    <>
      <NothingHeader />
      <main className="flex-1 w-full overflow-x-clip">
        <article className="container pb-16 pt-7">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.1em] text-nd-text-disabled transition-colors hover:text-nd-text-display font-mono"
          >
            <span aria-hidden>←</span> {t('backToFeed')}
          </Link>

          {/* HEADER */}
          <header className="mx-auto mt-8 max-w-[720px]">
            <div className="flex items-center gap-2.5">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={style.color}
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={style.icon} />
              </svg>
              {category.topic ? (
                <Link
                  href={`/noticias?topic=${encodeURIComponent(category.topic)}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-75 font-mono"
                  style={{ color: style.color }}
                >
                  {categoryLabel}
                </Link>
              ) : (
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] font-mono"
                  style={{ color: style.color }}
                >
                  {categoryLabel}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-nd-text-display md:text-[2.375rem] font-display">
              {doc.title}
            </h1>

            {/* With a body the deck moves down into the TL;DR card, so it isn't
                printed twice. */}
            {doc.deck && !hasBody ? (
              <p className="mt-4 text-pretty text-lg leading-relaxed text-nd-text-secondary font-sans">
                {doc.deck}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-nd-border pb-6 text-xs tracking-[0.03em] text-nd-text-disabled font-mono">
              {doc.publishedAt ? (
                <>
                  <time dateTime={doc.publishedAt}>{absoluteDate(doc.publishedAt)}</time>
                  <span className="size-[3px] rounded-full bg-nd-text-disabled" aria-hidden />
                </>
              ) : null}
              {minutes ? (
                <>
                  <span>{t('readingTime', { minutes })}</span>
                  <span className="size-[3px] rounded-full bg-nd-text-disabled" aria-hidden />
                </>
              ) : null}
              <span>{doc.sourceName}</span>
            </div>
          </header>

          {/* PHOTO */}
          <figure className="relative mt-8 h-[220px] overflow-hidden rounded-[10px] bg-[#2a2f36] md:h-[320px]">
            <NewsPhoto src={heroSrc} sizes="100vw" />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.45)_100%)]"
            />
            <figcaption className="absolute inset-x-6 bottom-4 flex items-center gap-2.5">
              <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-white/85 font-mono">
                {heroCredit}
              </span>
              <span className="h-px flex-1 bg-white/35" aria-hidden />
            </figcaption>
          </figure>

          {/* TL;DR — the outlet's own summary, when the body carries the detail. */}
          {doc.deck && hasBody ? (
            <div className="mx-auto mt-9 max-w-[720px] rounded-[10px] border border-nd-border bg-nd-surface px-6 py-5">
              <span
                className="text-[10.5px] font-semibold uppercase tracking-[0.18em] font-mono"
                style={{ color: style.color }}
              >
                TL;DR
              </span>
              <div className="mt-3 flex gap-3">
                <span
                  className="mt-[7px] size-1.5 shrink-0 rotate-45"
                  style={{ background: style.color }}
                  aria-hidden
                />
                <p className="text-[14.5px] leading-relaxed text-nd-text-secondary font-sans">
                  {doc.deck}
                </p>
              </div>
            </div>
          ) : null}

          {/* BODY */}
          <div className="mx-auto max-w-[600px]">
            {/* Documents we may not reproduce have no body — the source link is
                the whole story, so it stays a full button. */}
            {!hasBody ? (
              <a
                href={doc.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex w-fit items-center gap-2 rounded-lg bg-nd-text-display px-4 py-2.5 text-xs uppercase tracking-[0.06em] text-nd-surface transition-opacity hover:opacity-80 font-mono"
              >
                {t('readAtSource', { source: doc.sourceName })} →
              </a>
            ) : null}

            {hasBody ? (
              <NewsBody
                text={doc.bodyText as string}
                highlight={highlight}
                highlightLabel={t('keyPoint')}
                accent={style.color}
                images={bodyImages}
              />
            ) : null}

            {/* Attribution line */}
            <div className="mt-5 flex items-center gap-3.5 border-t border-nd-border pt-6">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#20242a,#2a2f36)]"
                aria-hidden
              >
                <span className="size-2.5 rotate-45" style={{ background: style.color }} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-nd-text-display font-sans">
                  {doc.sourceName}
                </span>
                <span className="mt-0.5 block text-[11px] text-nd-text-disabled font-mono">
                  {absoluteDate(doc.publishedAt)}
                </span>
              </span>
              <span className="flex-1" />
              {/* Bodiless documents already carry the source link as a button. */}
              {hasBody ? (
                <a
                  href={doc.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-right text-[10.5px] uppercase tracking-[0.15em] text-nd-text-disabled transition-colors hover:text-nd-text-display font-mono"
                >
                  {t('readAtSource', { source: doc.sourceName })} ↗
                </a>
              ) : null}
            </div>

            {/* Regulatory attachments (e.g. CNV PDFs). */}
            {!metadataOnly && documents.length ? (
              <div className="mt-6 flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-nd-text-disabled font-mono">
                  {t('attachments')}
                </span>
                {documents.map((a, i) => (
                  <a
                    key={`${a.url}-${i}`}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-nd-border px-3 py-2 text-xs text-nd-text-secondary transition-colors hover:border-nd-text-disabled hover:text-nd-text-display font-mono"
                  >
                    {a.title || a.url} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* TAGS */}
          {topics.length || entities.length ? (
            <div className="mx-auto mt-9 flex max-w-[720px] flex-wrap items-center gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-nd-text-disabled font-mono">
                {t('topicsLabel')}
              </span>
              {topics.map((topic) => (
                <Link
                  key={topic}
                  href={`/noticias?topic=${encodeURIComponent(topic)}`}
                  className="inline-flex items-center rounded-full border border-nd-border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.04em] text-nd-text-secondary transition-colors hover:border-nd-text-disabled hover:text-nd-text-display font-mono"
                >
                  {t.has(`topicLabels.${topic}`) ? t(`topicLabels.${topic}`) : fallbackTopicLabel(topic)}
                </Link>
              ))}
              {entities.map((entity) => (
                <Link
                  key={entity}
                  href={`/noticias?entity=${encodeURIComponent(entity)}`}
                  className="inline-flex items-center rounded-full border border-nd-border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.04em] text-nd-text-disabled transition-colors hover:border-nd-accent hover:text-nd-accent font-mono"
                >
                  {entity}
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        {/* RELATED */}
        {cluster.length ? (
          <section className="container pb-20">
            <SectionLabel
              title={t('relatedCoverage')}
              note={t('allNews')}
              noteHref="/noticias"
            />
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
              {cluster.slice(0, 2).map((card) => (
                <NewsCard key={card.docId} card={card} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <NothingFooter />
    </>
  )
}
