import { Link } from '@/i18n/navigation'

/** Design-system section rule: optional index, label, hairline, right-side note. */
export function SectionLabel({
  index,
  title,
  note,
  noteHref,
}: {
  index?: string
  title: string
  note?: string | null
  /** Turns the right-side note into a link (e.g. "All news →"). */
  noteHref?: string
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {index && (
        <span className="text-[11px] font-semibold tabular-nums text-nd-text-disabled font-mono">
          {index}
        </span>
      )}
      <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-nd-text-display font-mono">
        {title}
      </h2>
      <span className="h-px flex-1 bg-nd-border" aria-hidden />
      {note &&
        (noteHref ? (
          <Link
            href={noteHref}
            className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-nd-text-secondary transition-colors hover:text-nd-text-display font-mono"
          >
            {note}
          </Link>
        ) : (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-nd-text-disabled font-mono">
            {note}
          </span>
        ))}
    </div>
  )
}
