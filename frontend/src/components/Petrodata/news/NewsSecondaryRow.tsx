import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { NewsCard } from '@/api/news'
import { categoryStyle, fallbackTopicLabel, photoFor } from './categories'
import { NewsPhoto } from './NewsPhoto'
import { primaryCategory } from './meta'

/** Compact "18 JUN" stamp next to the category. */
function shortDate(iso: string | null, locale: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase()
}

/** Secondary story beside the featured card: thumb + headline + one-line deck. */
export async function NewsSecondaryRow({ card }: { card: NewsCard }) {
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
      className="grid flex-1 grid-cols-[88px_1fr_auto] items-center gap-4 overflow-hidden rounded-[10px] border border-nd-border bg-nd-surface p-3 transition-colors hover:border-nd-text-disabled sm:grid-cols-[112px_1fr_auto] sm:gap-[18px]"
    >
      <span className="relative block h-full min-h-[76px] overflow-hidden rounded-[9px] bg-[#2a2f36] sm:min-h-[92px]">
        <NewsPhoto src={card.image || photoFor(category.topic, card.docId)} sizes="112px" />
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={style.color}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0"
          >
            <path d={style.icon} />
          </svg>
          <span className="truncate text-[10.5px] uppercase tracking-[0.14em] text-nd-text-secondary font-mono">
            {label}
          </span>
          <span className="shrink-0 text-[10.5px] uppercase tracking-[0.05em] text-nd-text-disabled font-mono">
            · {shortDate(card.publishedAt, locale)}
          </span>
        </span>

        <span className="mt-2 text-pretty line-clamp-2 text-base font-medium leading-snug tracking-[-0.01em] text-nd-text-display sm:text-lg font-sans">
          {card.title}
        </span>

        {card.deck && (
          <span className="mt-1.5 line-clamp-1 text-[13px] leading-snug text-nd-text-secondary font-sans">
            {card.deck}
          </span>
        )}
      </span>

      <span aria-hidden className="text-sm text-nd-text-disabled">
        →
      </span>
    </Link>
  )
}
