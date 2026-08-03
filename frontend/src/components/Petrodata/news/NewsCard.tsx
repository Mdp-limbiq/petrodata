import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { NewsCard as NewsCardType } from '@/api/news'
import { categoryStyle, fallbackTopicLabel, photoFor } from './categories'
import { NewsPhoto } from './NewsPhoto'
import { primaryCategory } from './meta'

/** "18 JUN 2026 · 4 MIN LECTURA" */
function metaLine(iso: string | null, locale: string, readingLabel: string | null): string {
  const parts: string[] = []
  if (iso) {
    const date = new Date(iso)
    if (!Number.isNaN(date.getTime())) {
      parts.push(
        new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' })
          .format(date)
          .replace(/\./g, '')
          .toUpperCase(),
      )
    }
  }
  if (readingLabel) parts.push(readingLabel)
  return parts.join(' · ')
}

/** Grid card: photo with the category stamped over it, headline, deck, source row. */
export async function NewsCard({ card }: { card: NewsCardType }) {
  const [t, locale] = await Promise.all([getTranslations('noticias'), getLocale()])
  const category = primaryCategory(card)
  const style = categoryStyle(category.topic)
  // Untagged documents fall back to their source family for the label.
  const labelKey = category.topic ?? card.sourceFamily
  const label = t.has(`topicLabels.${labelKey}`)
    ? t(`topicLabels.${labelKey}`)
    : category.label || fallbackTopicLabel(labelKey)

  return (
    <Link
      href={`/noticias/${card.docId}`}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-nd-border bg-nd-surface transition-colors hover:border-nd-text-disabled"
    >
      <span className="relative block h-[200px] shrink-0 overflow-hidden bg-nd-surface-raised md:h-[236px]">
        <NewsPhoto
          src={card.image || photoFor(category.topic, card.docId)}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0)_42%,rgba(0,0,0,0.6)_100%)]"
        />
        <span className="absolute inset-x-6 bottom-4 flex items-center gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={style.color}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0"
          >
            <path d={style.icon} />
          </svg>
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white font-mono">
            {label}
          </span>
          <span className="h-px flex-1 bg-white/40" aria-hidden />
        </span>
      </span>

      <span className="flex flex-1 flex-col p-6">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-nd-text-disabled font-mono">
          {metaLine(
            card.publishedAt,
            locale,
            card.readingMinutes ? t('readingTime', { minutes: card.readingMinutes }) : null,
          )}
        </span>

        <span className="mt-3 text-balance line-clamp-3 text-xl font-bold leading-snug tracking-[-0.01em] text-nd-text-display font-display">
          {card.title}
        </span>

        {card.deck && (
          <span className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-nd-text-secondary font-sans">
            {card.deck}
          </span>
        )}

        <span className="mt-auto flex items-center justify-between gap-3 border-t border-nd-border pt-[18px]">
          <span className="truncate text-xs tracking-[0.02em] text-nd-text-secondary font-mono">
            {card.sourceName}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-nd-text-display font-mono">
            {t('read')} <span aria-hidden>→</span>
          </span>
        </span>
      </span>
    </Link>
  )
}
