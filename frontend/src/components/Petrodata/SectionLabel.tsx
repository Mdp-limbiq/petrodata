/** Design-system section rule: optional index, label, hairline, right-side note. */
export function SectionLabel({
  index,
  title,
  note,
}: {
  index?: string
  title: string
  note?: string | null
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
      {note && (
        <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-nd-text-disabled font-mono">
          {note}
        </span>
      )}
    </div>
  )
}
