import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Pagination } from '@/api/news'

function buildHref(base: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(base)) {
    if (v && k !== 'page') params.set(k, v)
  }
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/noticias?${qs}` : '/noticias'
}

/** Document count on the left, prev · page · next on the right. */
export async function NewsPager({
  pagination,
  params,
}: {
  pagination: Pagination
  params: Record<string, string | undefined>
}) {
  const t = await getTranslations('noticias')
  const { page, limit, total } = pagination
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const hasPrev = page > 1
  const hasNext = page < totalPages
  const btn = 'inline-flex items-center gap-1.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] font-mono'
  const enabled = `${btn} text-nd-text-display transition-opacity hover:opacity-70`
  const disabled = `${btn} text-nd-text-display opacity-30`

  return (
    <nav
      className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-nd-border pt-7"
      aria-label={t('pagination')}
    >
      <span className="text-[11.5px] tracking-[0.04em] text-nd-text-disabled font-mono">
        {t('resultsCount', { count: total })}
      </span>

      <div className="flex items-center gap-6">
        {hasPrev ? (
          <Link href={buildHref(params, page - 1)} className={enabled}>
            <span aria-hidden>←</span> {t('prev')}
          </Link>
        ) : (
          <span className={disabled}>
            <span aria-hidden>←</span> {t('prev')}
          </span>
        )}

        <span className="text-[11.5px] tracking-[0.04em] text-nd-text-display font-mono">
          {t('pageOf', { page, total: totalPages })}
        </span>

        {hasNext ? (
          <Link href={buildHref(params, page + 1)} className={enabled}>
            {t('next')} <span aria-hidden>→</span>
          </Link>
        ) : (
          <span className={disabled}>
            {t('next')} <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </nav>
  )
}
