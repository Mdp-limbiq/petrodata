'use client'

import { useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Facet } from '@/api/news'
import { ALL_TOPICS_ICON, categoryStyle, fallbackTopicLabel } from './categories'

/** Category row from the design: glyph + label, the active one in full contrast. */
export function NewsTopicChips({ topics }: { topics: Facet[] }) {
  const t = useTranslations('noticias')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get('topic')

  const select = useCallback(
    (topic: string | null) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      if (topic) params.set('topic', topic)
      else params.delete('topic')
      params.delete('page') // a new filter always starts on page one
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams],
  )

  const chips = [
    { topic: null as string | null, label: t('allTopics'), color: 'currentColor', icon: ALL_TOPICS_ICON },
    ...topics.map((f) => ({
      topic: f.value,
      label: t.has(`topicLabels.${f.value}`) ? t(`topicLabels.${f.value}`) : fallbackTopicLabel(f.value),
      color: categoryStyle(f.value).color,
      icon: categoryStyle(f.value).icon,
    })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {chips.map((chip) => {
        const isActive = active === chip.topic || (!active && chip.topic === null)
        return (
          <button
            key={chip.topic ?? 'all'}
            type="button"
            onClick={() => select(chip.topic)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 py-1 text-xs tracking-[0.02em] transition-colors font-mono ${
              isActive
                ? 'font-semibold text-nd-text-display'
                : 'font-medium text-nd-text-disabled hover:text-nd-text-secondary'
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={chip.color}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={chip.icon} />
            </svg>
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
