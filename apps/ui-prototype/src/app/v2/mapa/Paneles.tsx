'use client'

import type { ReactNode } from 'react'
import { HEADLINE } from '@/fixtures/production'
import { TOP_OPERATORS } from '@/fixtures/operators'
import { formatCompact, formatDecimal, formatInteger, formatPercent } from '@/lib/format'

/* Paneles flotantes del mapa — los que tiene vacamuerta.io/map, vestidos con
   el sistema.

   Antes había escrito que "el sistema no superpone capas". Era inferencia
   mía, no una regla medida: la referencia no tiene mapas, así que nunca tuvo
   que resolver este caso. Lo que SÍ está medido y acá se respeta:

   · Cero backdrop-filter. Los paneles van con fondo OPACO, igual que las
     cabeceras sticky de sus tablas, que también flotan sobre contenido.
   · El plano lo hace el anillo de 1px, no una sombra difusa.
   · z-index bajo: acá van en 10, que es el máximo del sistema.
   · Radio 10, el de card, porque son cajas de ese tamaño.

   Los rótulos salen de messages/es.json del sitio: "Resumen", "Filtros",
   "Operadores principales · BOE", "Último mes", "Haz clic para filtrar el
   mapa". */

const RECURSOS = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'petroleo', label: 'Petróleo' },
  { valor: 'gas', label: 'Gas' },
] as const

export type Recurso = (typeof RECURSOS)[number]['valor']

/** Caja base: la receta de card, opaca, sin desenfoque. */
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`pointer-events-auto overflow-hidden ${className}`}
      style={{
        borderRadius: 'var(--radius-card)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  )
}

function Cabecera({ titulo, nota }: { titulo: string; nota?: string }) {
  return (
    <div
      className="flex items-baseline justify-between gap-3 border-b px-3 py-2"
      style={{ borderColor: 'var(--line)' }}
    >
      <span className="s-etq">{titulo}</span>
      {nota && (
        <span className="s-micro s-num" style={{ color: 'var(--ink-3)' }}>
          {nota}
        </span>
      )}
    </div>
  )
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const mes = (p: string) => `${MESES[Number(p.split('-')[1]) - 1]} ${p.split('-')[0]}`

/** Resumen — el marco de referencia del país. */
export function PanelResumen() {
  return (
    <Panel className="w-[228px]">
      <Cabecera titulo={`Último mes · ${mes(HEADLINE.period)}`} />
      <div className="px-3 py-2.5">
        <p className="m-0 flex items-baseline gap-1.5">
          <span className="s-cifra-sm">{formatCompact(HEADLINE.boeMonth)}</span>
          <abbr
            title="Barriles equivalentes de petróleo"
            className="s-micro cursor-help no-underline"
            style={{ color: 'var(--ink-2)' }}
          >
            BOE
          </abbr>
        </p>
        <p className="s-micro s-num m-0 mt-1.5 flex flex-wrap gap-x-1.5" style={{ color: 'var(--ink-2)' }}>
          <span>{formatCompact(HEADLINE.oil)} bbl/d petróleo</span>
        </p>
        <p className="s-micro s-num m-0 flex flex-wrap gap-x-1.5" style={{ color: 'var(--ink-2)' }}>
          <span>{formatDecimal(HEADLINE.gas, 1)} MMm³/d gas</span>
        </p>
        <p className="s-micro s-num m-0 mt-1.5" style={{ color: 'var(--ink-2)' }}>
          {formatPercent(HEADLINE.vmShare)} del BOE
        </p>
      </div>
    </Panel>
  )
}

/** Filtros — recurso y estado, más el conteo de pozos a la vista. */
export function PanelFiltros({
  recurso,
  onRecurso,
  ocultarAbandonados,
  onOcultar,
  visibles,
  total,
}: {
  recurso: Recurso
  onRecurso: (r: Recurso) => void
  ocultarAbandonados: boolean
  onOcultar: (v: boolean) => void
  visibles: number
  total: number
}) {
  const limpio = recurso === 'todos' && !ocultarAbandonados
  return (
    <Panel className="w-[228px]">
      <Cabecera titulo="Filtros" nota={`${formatInteger(visibles)} pozos`} />
      <div className="px-3 py-2.5">
        <p className="s-micro m-0 mb-1.5" style={{ color: 'var(--ink-2)' }}>
          Recurso
        </p>
        <div
          role="group"
          aria-label="Recurso"
          className="flex rounded-full p-0.5"
          style={{ background: 'var(--field)' }}
        >
          {RECURSOS.map((r) => {
            const on = r.valor === recurso
            return (
              <button
                key={r.valor}
                type="button"
                aria-pressed={on}
                onClick={() => onRecurso(r.valor)}
                className="s-micro flex-1 rounded-full px-2 py-1 transition-colors"
                style={{
                  background: on ? 'var(--surface)' : 'transparent',
                  boxShadow: on ? 'var(--shadow-btn)' : 'none',
                  color: on ? 'var(--ink)' : 'var(--ink-2)',
                  fontWeight: on ? 500 : 400,
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>

        <label className="s-micro mt-2.5 flex cursor-pointer items-center gap-2" style={{ color: 'var(--ink-2)' }}>
          <input
            type="checkbox"
            checked={ocultarAbandonados}
            onChange={(e) => onOcultar(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          Ocultar pozos abandonados
        </label>

        {!limpio && (
          <button
            type="button"
            onClick={() => {
              onRecurso('todos')
              onOcultar(false)
            }}
            className="s-micro mt-2.5 block"
            style={{ color: 'var(--accent-ink)', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            Reiniciar
          </button>
        )}
        {limpio && (
          <p className="s-micro s-num m-0 mt-2.5" style={{ color: 'var(--ink-3)' }}>
            de {formatInteger(total)} muestreados
          </p>
        )}
      </div>
    </Panel>
  )
}

/** Operadores principales — clic para filtrar, como en el sitio. */
export function PanelOperadores({
  seleccionada,
  onSeleccionar,
}: {
  seleccionada: string
  onSeleccionar: (slug: string) => void
}) {
  const max = Math.max(...TOP_OPERATORS.map((o) => o.boeMonth))
  return (
    <Panel className="w-[268px]">
      <Cabecera titulo="Operadores principales · BOE" />
      {TOP_OPERATORS.map((op, i) => {
        const on = op.slug === seleccionada
        return (
          <button
            key={op.slug}
            type="button"
            aria-pressed={on}
            onClick={() => onSeleccionar(on ? '' : op.slug)}
            className="s-fila s-fila-hover w-full text-left"
            style={{ background: on ? 'var(--hover)' : 'transparent', cursor: 'pointer', border: 0 }}
          >
            <span className="s-mono w-4 shrink-0 text-[11px]" style={{ color: on ? 'var(--accent-ink)' : 'var(--ink-3)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="s-micro block truncate" style={{ color: 'var(--ink)', fontWeight: on ? 500 : 400 }}>
                {op.name}
              </span>
            </span>
            <span className={`s-barra hidden w-10 shrink-0 sm:block ${on ? 's-barra--lider' : ''}`} aria-hidden>
              <i style={{ width: `${Math.max(3, (op.boeMonth / max) * 100)}%` }} />
            </span>
            <span className="s-num s-micro w-10 shrink-0 text-right" style={{ fontWeight: 500 }}>
              {formatCompact(op.boeMonth)}
            </span>
          </button>
        )
      })}
      <p className="s-micro m-0 border-t px-3 py-2" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
        {seleccionada ? 'Clic de nuevo para quitar el filtro' : 'Haz clic para filtrar el mapa'}
      </p>
    </Panel>
  )
}

/** Referencias — la leyenda de los clusters. */
export function PanelReferencias() {
  const items = [
    { color: '#189a4d', label: 'Hasta 50 pozos' },
    { color: '#ef720c', label: '50 a 250' },
    { color: '#e3474c', label: 'Más de 250' },
  ]
  return (
    <Panel className="w-[168px]">
      <Cabecera titulo="Referencias" />
      <ul className="m-0 flex list-none flex-col gap-1.5 p-3">
        {items.map((it) => (
          <li key={it.label} className="s-micro flex items-center gap-2" style={{ color: 'var(--ink-2)' }}>
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: it.color }}
            />
            {it.label}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
