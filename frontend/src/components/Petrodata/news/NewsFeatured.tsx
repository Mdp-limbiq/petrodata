import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { NewsCard } from '@/api/news'
import { categoryStyle, fallbackTopicLabel, photoFor } from './categories'
import { NewsPhoto } from './NewsPhoto'
import { primaryCategory } from './meta'

/** "02 JUL" + "'26" — the design's oversized date stamp. */
function stampParts(iso: string | null, locale: string): { big: string; year: string } {
  if (!iso) return { big: '', year: '' }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return { big: '', year: '' }
  const big = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase()
  return { big, year: `'${String(date.getFullYear()).slice(2)}` }
}

/** DESTACADA: full-bleed dark hero card for the lead story. */
export async function NewsFeatured({ card }: { card: NewsCard }) {
  const [t, locale] = await Promise.all([getTranslations('noticias'), getLocale()])
  const category = primaryCategory(card)
  const style = categoryStyle(category.topic)
  // Untagged documents fall back to their source family for the label.
  const labelKey = category.topic ?? card.sourceFamily
  const label = t.has(`topicLabels.${labelKey}`)
    ? t(`topicLabels.${labelKey}`)
    : category.label || fallbackTopicLabel(labelKey)
  const stamp = stampParts(card.publishedAt, locale)

  return (
    <Link
      href={`/noticias/${card.docId}`}
      className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[10px] border border-white/10 bg-[#16191d] p-7 md:min-h-[562px]"
    >
      <NewsPhoto
        src={card.image || photoFor(category.topic, card.docId)}
        sizes="(min-width: 1024px) 452px, 100vw"
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,25,29,0.35)_0%,rgba(22,25,29,0)_24%,rgba(22,25,29,0)_42%,rgba(22,25,29,0.6)_62%,rgba(22,25,29,0.93)_82%,#16191d_100%)]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_0%,rgba(22,25,29,0)_55%,rgba(22,25,29,0.5)_100%)]"
      />

      {/* Corner brackets */}
      <span aria-hidden className="absolute inset-4">
        <span className="absolute left-0 top-0 size-3.5 border-l border-t border-white/30" />
        <span className="absolute right-0 top-0 size-3.5 border-r border-t border-white/30" />
        <span className="absolute bottom-0 left-0 size-3.5 border-b border-l border-white/30" />
        <span className="absolute bottom-0 right-0 size-3.5 border-b border-r border-white/30" />
      </span>

      <div className="relative flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-3.5 backdrop-blur">
          <span
            className="size-1.5 rounded-full"
            style={{ background: style.color, boxShadow: `0 0 8px 1px ${style.color}99` }}
            aria-hidden
          />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 font-mono">
            {label}
          </span>
        </span>

        {stamp.big && (
          <span className="flex flex-col items-end">
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40 font-mono">
              {t('publishedLabel')}
            </span>
            <span className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold leading-none tracking-[-0.02em] text-white font-display">
                {stamp.big}
              </span>
              <span className="text-[13px] text-white/50 font-mono">{stamp.year}</span>
            </span>
          </span>
        )}
      </div>

      <div className="relative flex flex-col">
        <h3 className="text-balance text-2xl font-bold leading-[1.12] tracking-[-0.02em] text-white md:text-[1.8rem] font-display">
          {card.title}
        </h3>
        {card.deck && (
          <p className="mt-3.5 max-w-[340px] line-clamp-3 text-[15px] leading-relaxed text-white/55 font-sans">
            {card.deck}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="truncate text-xs tracking-[0.02em] text-white/45 font-mono">
            {card.sourceName}
            {card.readingMinutes ? ` · ${t('readingTime', { minutes: card.readingMinutes })}` : ''}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-white/60 font-mono">
            {t('read')} <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
