import type { ReactNode } from 'react'

/**
 * Pull-quote inside a news body: a rule in the category colour, a tinted panel
 * and the label underneath — the design kit's "key data" block.
 */
export function NewsHighlight({
  label,
  accent = 'var(--nd-accent)',
  children,
}: {
  label?: string
  accent?: string
  children: ReactNode
}) {
  return (
    <blockquote
      className="my-8 rounded-r-[10px] border-l-[3px] px-6 py-5"
      style={{ borderColor: accent, background: `color-mix(in srgb, ${accent} 7%, transparent)` }}
    >
      <p className="text-pretty text-[16.5px] font-medium leading-relaxed tracking-[-0.01em] text-nd-text-display font-sans">
        {children}
      </p>
      {label ? (
        <span className="mt-3.5 block text-[10.5px] uppercase tracking-[0.15em] text-nd-text-disabled font-mono">
          {label}
        </span>
      ) : null}
    </blockquote>
  )
}
