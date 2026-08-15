'use client'

import { useId, useState } from 'react'
import { Marca, Tag } from '../_ui/kit'
import { formatDecimal, formatInteger } from '@/lib/format'
import type { Province } from '@/fixtures/provinces'

/* Fila de provincia que se despliega en el lugar, en vez de navegar a una
   página dedicada.

   El mecanismo es el MEDIDO de la sección "Thinking" de la referencia, que es
   su primitiva de traza expandible:

     <div class="grid transition-[grid-template-rows,opacity] duration-400"
          style="grid-template-rows: 0fr; opacity: 0">
       <div style="overflow:hidden"> … </div>
     </div>

   El truco del 0fr → 1fr sirve porque anima a una altura que no hay que
   conocer de antemano, cosa que un max-height no puede hacer sin inventar un
   número. El chevron rota 180° en 300ms, cien menos que el panel: llega antes
   y por eso el gesto se siente responder al clic y no arrastrarse.

   El contenido de adentro es el de la página de provincia del sitio, servido
   con las piezas del sistema: la descripción, tres lecturas y las operadoras
   que trabajan ahí. */

export function FilaProvincia({
  p,
  n,
  pct,
  lider,
  tagColor,
  operadoras,
}: {
  p: Province
  n: number
  /** 0..1 sobre el máximo de la lista */
  pct: number
  lider: boolean
  tagColor: string
  /** nombres ya resueltos: una función no cruza de server a client component */
  operadoras: string[]
}) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()

  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => setAbierta((v) => !v)}
        className="s-fila s-fila-hover w-full text-left"
        style={{ border: 0, borderBottom: 0, background: 'transparent', cursor: 'pointer' }}
      >
        <span className="s-mono w-5 shrink-0 text-[11px]" style={{ color: 'var(--ink-3)' }}>
          {String(n).padStart(2, '0')}
        </span>
        <Marca nombre={p.name} />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="s-cuerpo min-w-0 truncate font-medium">{p.name}</span>
          <Tag color={tagColor}>{p.basin}</Tag>
        </span>
        <span
          className={`s-barra hidden w-16 shrink-0 sm:block ${lider ? 's-barra--lider' : ''}`}
          aria-hidden
        >
          <i style={{ width: `${Math.max(3, pct * 100)}%` }} />
        </span>
        <span className="s-num w-16 shrink-0 text-right text-[13px] font-medium">
          {formatInteger(p.wells)}
        </span>
        {/* chevron: 14px con trazo 2,2 — el mismo de la traza expandible de la
            referencia. Rota en 300ms, cien menos que el panel. */}
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          style={{
            transform: abierta ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 300ms var(--ease-in-out)',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={id}
        className="grid"
        style={{
          gridTemplateRows: abierta ? '1fr' : '0fr',
          opacity: abierta ? 1 : 0,
          transition: 'grid-template-rows 400ms var(--ease-in-out), opacity 400ms var(--ease-in-out)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 12px 12px 12px' }}>
            <p className="s-desc m-0">{p.blurb}</p>

            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              <Lectura rotulo="Pozos activos" valor={formatInteger(p.wells)} />
              <Lectura
                rotulo="Exportaciones"
                valor={formatInteger(p.exportsMUSD)}
                unidad="MUSD"
              />
              <Lectura
                rotulo="Part. exportadora"
                valor={`${formatDecimal(p.expSharePct, 1)}%`}
                nota="del total nacional"
              />
            </div>

            {operadoras.length > 0 && (
              <>
                <p className="s-micro m-0 mt-3 mb-1.5" style={{ color: 'var(--ink-2)' }}>
                  Empresas que operan
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {operadoras.map((nombre) => (
                    <span
                      key={nombre}
                      className="s-micro flex items-center gap-1.5 rounded-[6px] px-2 py-1"
                      style={{ background: 'var(--field)', color: 'var(--ink-2)' }}
                    >
                      <Marca nombre={nombre} />
                      {nombre}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Lectura chica: la card del sistema con su cuerpo de 12px. */
function Lectura({
  rotulo,
  valor,
  unidad,
  nota,
}: {
  rotulo: string
  valor: string
  unidad?: string
  nota?: string
}) {
  return (
    <div className="s-card">
      <div style={{ padding: 12 }}>
        <p className="s-etq m-0">{rotulo}</p>
        <p className="m-0 mt-1 flex items-baseline gap-1.5">
          <span className="s-cifra-sm">{valor}</span>
          {unidad && (
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {unidad}
            </span>
          )}
        </p>
        {nota && (
          <p className="s-micro m-0 mt-1" style={{ color: 'var(--ink-3)' }}>
            {nota}
          </p>
        )}
      </div>
    </div>
  )
}
