'use client'

import { Surface } from '@/ui/surface'
import { CompanyLogo } from '@/app/(shell)/companies/_client/company-logo'
import { formatCompact, formatDecimal, formatInteger } from '@/lib/format'
import { HEADLINE } from '@/fixtures/production'
import { TOP_OPERATORS } from '@/fixtures/operators'
import { COMPANIES } from '@/fixtures/companies'

/* Paneles flotantes del mapa — las piezas que tiene vacamuerta.io/map,
   adaptadas a Estrato (pedido de Mariano, 2026-08-12):

   · OverviewCard  → "Último mes": el marco de referencia del país, que en
     el prototipo faltaba. El mapa decía cuántos pozos se ven, pero no
     cuánto es eso.
   · TopOperatorsCard → el ranking clickeable que reemplaza al <select>
     "Operadora": muestra magnitud y filtra al clic, que es el atajo
     principal de exploración en producción.

   La composición del ranking sigue la receta 06 de Indicadores (rank
   numerado, valor en la línea de base del nombre, barra rounded-full),
   no el markup de producción: lo que se porta es la pieza, no su estilo. */

const OIL = 'var(--data-oil)'

/** slug de operadora → dominio/logo, reusando lo ya verificado en Empresas */
const LOGO = Object.fromEntries(
  COMPANIES.map((c) => [c.slug, { website: c.website, logoUrl: c.logoUrl }]),
) as Record<string, { website?: string; logoUrl?: string } | undefined>

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "2026-05" → "may 2026" */
function mes(periodo: string): string {
  const [y, m] = periodo.split('-')
  return `${MESES[Number(m) - 1].slice(0, 3)} ${y}`
}

/** Contexto del país: cuánto produjo el último mes y cuánto pesa VM.
    Va en la card oscura de la familia (pedido de Mariano, 2026-08-12):
    la oscuridad es jerarquía, y este es el titular del mapa. Contraste
    según la regla del proyecto: on-dark-3 sólo para metadata. */
export function OverviewPanel() {
  const h = HEADLINE
  /* Compacta a propósito: es un panel flotante sobre el mapa, no una card
     de página. Tres renglones en vez de cuatro —el desglose y la
     participación de VM comparten línea— con padding y gaps chicos. */
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border-4 border-black bg-inverse px-4 py-3">
      <span className="type-label !text-on-dark-2">Último mes · {mes(h.period)}</span>

      <span className="flex items-baseline gap-1.5">
        <span className="type-kpi text-[1.6rem] !text-white">{formatCompact(h.boeMonth)}</span>
        <abbr
          title="Barriles equivalentes de petróleo"
          className="type-label cursor-help !text-on-dark-2 no-underline"
        >
          BOE
        </abbr>
        <span
          className="type-label ml-auto rounded-full px-1.5 py-0.5 !text-oil"
          style={{ background: `color-mix(in srgb, ${OIL} 18%, transparent)` }}
        >
          VM {formatDecimal(h.vmShare * 100, 1)}%
        </span>
      </span>

      <span className="flex flex-wrap items-center gap-x-1.5 text-[10.5px] tnums !text-on-dark-2">
        <span>{formatCompact(h.oil)} bbl/d</span>
        <span className="!text-on-dark-3">·</span>
        <span>{formatDecimal(h.gas, 1)} MMm³/d</span>
      </span>
    </div>
  )
}

/** Ranking de operadoras: clic para filtrar el mapa (receta 06). */
export function TopOperatorsPanel({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (slug: string) => void
}) {
  const max = Math.max(...TOP_OPERATORS.map((o) => o.boeMonth))
  return (
    <Surface variant="overlay" padding="none" className="overflow-hidden">
      <div className="border-b px-4 py-3">
        <span className="type-label">Operadoras principales · BOE</span>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {TOP_OPERATORS.map((op, i) => {
          const activa = op.slug === selected
          const logo = LOGO[op.slug]
          return (
            <li key={op.slug}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => onSelect(activa ? '' : op.slug)}
                className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors duration-200 last:border-b-0 hover:bg-raised/60"
              >
                <span
                  className="w-4 shrink-0 text-[11px] tnums"
                  style={{ color: activa ? OIL : 'var(--text-tertiary)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <CompanyLogo
                  name={op.name}
                  website={logo?.website}
                  logoUrl={logo?.logoUrl}
                  size="sm"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className="truncate text-sm"
                      style={{
                        color: activa ? OIL : 'var(--text-primary)',
                        fontWeight: activa ? 600 : 400,
                      }}
                    >
                      {op.name}
                    </span>
                    <span className="shrink-0 text-[11px] tnums text-secondary">
                      {formatCompact(op.boeMonth)}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${Math.max(2, (op.boeMonth / max) * 100)}%`,
                        background: OIL,
                        opacity: activa ? 1 : 0.55,
                      }}
                    />
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="type-label m-0 border-t px-4 py-2.5">
        {selected ? 'Clic de nuevo para quitar el filtro' : 'Clic para filtrar el mapa'}
      </p>
    </Surface>
  )
}

/** Pie del panel de filtros: cuántos pozos quedan a la vista. */
export function WellCount({ visibles, total }: { visibles: number; total: number }) {
  return (
    <span className="flex items-baseline justify-between gap-2 border-t pt-2.5">
      <span className="type-label">
        {formatInteger(visibles)} {visibles === 1 ? 'pozo' : 'pozos'}
      </span>
      {visibles !== total && (
        <span className="type-label !text-tertiary">de {formatInteger(total)}</span>
      )}
    </span>
  )
}
