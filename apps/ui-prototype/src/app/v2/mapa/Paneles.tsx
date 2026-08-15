'use client'

import type { ReactNode } from 'react'
import { HEADLINE } from '@/fixtures/production'
import { TOP_OPERATORS } from '@/fixtures/operators'
import { formatCompact, formatDecimal, formatInteger, formatPercent } from '@/lib/format'

/* Paneles flotantes del mapa — con la receta de card MEDIDA de la referencia,
   no con la que yo había inventado.

   La estructura real de sus cards (medida en approval-card y
   recommendation-card):

     div.rounded-card            blanco · radio 10
       ├─ div.primitive-card-pad   padding 12px          ← el cuerpo
       └─ div.primitive-card-footer bg --inset · border-top 1px · padding 10×12

   O sea: NO hay barra de cabecera con divisoria arriba. El título es la
   primera línea del cuerpo, y lo secundario —conteos, ayudas, acciones— baja
   a un pie sobre fondo hundido. Yo tenía exactamente lo contrario: cabecera
   con borde arriba y nada abajo.

   Lo que sí estaba bien y se conserva: fondo opaco (cero backdrop-filter, la
   regla medida), anillo de 1px en vez de sombra difusa y z-index en 10.

   Los rótulos salen de messages/es.json del sitio. */

const RECURSOS = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'petroleo', label: 'Petróleo' },
  { valor: 'gas', label: 'Gas' },
] as const

export type Recurso = (typeof RECURSOS)[number]['valor']

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

/** Cuerpo: los 12px de padding de la referencia. */
function Cuerpo({ children }: { children: ReactNode }) {
  return <div style={{ padding: 12 }}>{children}</div>
}

/** Pie: fondo hundido, filete arriba, padding 10×12. */
function Pie({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3"
      style={{
        padding: '10px 12px',
        background: 'var(--inset)',
        borderTop: '1px solid var(--line)',
      }}
    >
      {children}
    </div>
  )
}

/** Título del panel: primera línea del cuerpo, no una barra aparte. */
function Titulo({ children }: { children: ReactNode }) {
  return <p className="s-titulo m-0">{children}</p>
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const mes = (p: string) => `${MESES[Number(p.split('-')[1]) - 1]} ${p.split('-')[0]}`

/** Resumen — el marco de referencia del país. */
export function PanelResumen() {
  return (
    <Panel className="w-[228px]">
      <Cuerpo>
        <Titulo>Último mes</Titulo>
        <p className="s-micro m-0 mt-0.5" style={{ color: 'var(--ink-2)' }}>
          {mes(HEADLINE.period)}
        </p>
        <p className="m-0 mt-2.5 flex items-baseline gap-1.5">
          <span className="s-cifra-sm">{formatCompact(HEADLINE.boeMonth)}</span>
          <abbr
            title="Barriles equivalentes de petróleo"
            className="s-micro cursor-help no-underline"
            style={{ color: 'var(--ink-2)' }}
          >
            BOE
          </abbr>
        </p>
        <p className="s-micro s-num m-0 mt-1.5" style={{ color: 'var(--ink-2)' }}>
          {formatCompact(HEADLINE.oil)} bbl/d petróleo
        </p>
        <p className="s-micro s-num m-0" style={{ color: 'var(--ink-2)' }}>
          {formatDecimal(HEADLINE.gas, 1)} MMm³/d gas
        </p>
      </Cuerpo>
      <Pie>
        <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
          Participación
        </span>
        <span className="s-micro s-num" style={{ fontWeight: 500 }}>
          {formatPercent(HEADLINE.vmShare)} del BOE
        </span>
      </Pie>
    </Panel>
  )
}

/** Filtros — recurso y estado; el conteo y el reinicio bajan al pie. */
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
      <Cuerpo>
        <Titulo>Filtros</Titulo>
        <p className="s-micro m-0 mt-2.5 mb-1.5" style={{ color: 'var(--ink-2)' }}>
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
                  border: 0,
                  cursor: 'pointer',
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>
        <label
          className="s-micro mt-2.5 flex cursor-pointer items-center gap-2"
          style={{ color: 'var(--ink-2)' }}
        >
          <input
            type="checkbox"
            checked={ocultarAbandonados}
            onChange={(e) => onOcultar(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          Ocultar abandonados
        </label>
      </Cuerpo>
      <Pie>
        <span className="s-micro s-num" style={{ fontWeight: 500 }}>
          {formatInteger(visibles)} pozos
        </span>
        {limpio ? (
          <span className="s-micro s-num" style={{ color: 'var(--ink-3)' }}>
            de {formatInteger(total)}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              onRecurso('todos')
              onOcultar(false)
            }}
            className="s-micro"
            style={{ color: 'var(--accent-ink)', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            Reiniciar
          </button>
        )}
      </Pie>
    </Panel>
  )
}

/** Operadores principales — clic para filtrar; la ayuda baja al pie. */
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
      <Cuerpo>
        <Titulo>Operadores principales</Titulo>
        <ul className="m-0 mt-2 flex list-none flex-col gap-0.5 p-0">
          {TOP_OPERATORS.map((op, i) => {
            const on = op.slug === seleccionada
            return (
              <li key={op.slug}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onSeleccionar(on ? '' : op.slug)}
                  className="flex w-full items-center gap-2 rounded-[7px] px-1.5 py-1 text-left transition-colors"
                  style={{
                    background: on ? 'var(--hover)' : 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    marginInline: -6,
                    width: 'calc(100% + 12px)',
                  }}
                >
                  <span
                    className="s-mono w-4 shrink-0 text-[11px]"
                    style={{ color: on ? 'var(--accent-ink)' : 'var(--ink-3)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="s-micro min-w-0 flex-1 truncate"
                    style={{ color: 'var(--ink)', fontWeight: on ? 500 : 400 }}
                  >
                    {op.name}
                  </span>
                  <span className={`s-barra hidden w-10 shrink-0 sm:block ${on ? 's-barra--lider' : ''}`} aria-hidden>
                    <i style={{ width: `${Math.max(3, (op.boeMonth / max) * 100)}%` }} />
                  </span>
                  <span className="s-num s-micro w-10 shrink-0 text-right" style={{ fontWeight: 500 }}>
                    {formatCompact(op.boeMonth)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Cuerpo>
      <Pie>
        <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
          {seleccionada ? 'Clic de nuevo para quitarlo' : 'Haz clic para filtrar el mapa'}
        </span>
        <span className="s-micro s-num" style={{ color: 'var(--ink-3)' }}>
          BOE
        </span>
      </Pie>
    </Panel>
  )
}

/** Referencias — la leyenda. Sin pie: no tiene nada secundario que bajar. */
export function PanelReferencias() {
  const items = [
    { color: '#189a4d', label: 'Hasta 50 pozos' },
    { color: '#ef720c', label: '50 a 250' },
    { color: '#e3474c', label: 'Más de 250' },
  ]
  return (
    <Panel className="w-[168px]">
      <Cuerpo>
        <Titulo>Referencias</Titulo>
        <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
          {items.map((it) => (
            <li key={it.label} className="s-micro flex items-center gap-2" style={{ color: 'var(--ink-2)' }}>
              <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: it.color }} />
              {it.label}
            </li>
          ))}
        </ul>
      </Cuerpo>
    </Panel>
  )
}
