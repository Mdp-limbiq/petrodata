import type { InvKpi } from '../_lib/types'

/** Format a raw value with the KPI's prefix/suffix/decimals in Argentine locale
 *  (`.` thousands, `,` decimals). Values are stored raw and formatted here. */
export function formatFigure(
  value: number,
  fmt: InvKpi['format'],
  locale = 'es-AR',
): string {
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fmt.decimals,
    maximumFractionDigits: fmt.decimals,
  }).format(value)
  return `${fmt.prefix ?? ''}${n}${fmt.suffix ?? ''}`
}

/** Signed percentage for delta chips, e.g. "+31,7%". */
export function formatDeltaPct(pct: number, locale = 'es-AR'): string {
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always',
  }).format(pct)
  return `${n}%`
}

/** Color por tier. confirmado=positivo; en_marcha/proyectado=caution (estados
    no finales); referencia=neutro. Tokens Estrato, nunca hex. */
export function tierColor(tier: string): string {
  switch (tier) {
    case 'confirmado':
      return 'var(--status-positive)'
    case 'en_marcha':
      return 'var(--status-caution)'
    case 'proyectado':
      return 'var(--status-caution)'
    case 'referencia':
      return 'var(--text-secondary)'
    default:
      return 'var(--text-tertiary)'
  }
}


/** "2026-04" → "04-2026" · "2026-08-07[ …]" → "07-08-2026" · resto tal cual */
export function fmtUpdate(asOf: string): string {
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(asOf)
  if (ymd) return `${ymd[3]}-${ymd[2]}-${ymd[1]}`
  const ym = /^(\d{4})-(\d{2})$/.exec(asOf)
  return ym ? `${ym[2]}-${ym[1]}` : asOf
}
