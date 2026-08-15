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
  pctPozos,
  puestoPozos,
  puestoExpo,
  total,
}: {
  p: Province
  n: number
  /** 0..1 sobre el máximo de la lista */
  pct: number
  lider: boolean
  tagColor: string
  /** nombres ya resueltos: una función no cruza de server a client component */
  operadoras: string[]
  /** porcentaje de los pozos del país que aporta la provincia */
  pctPozos: number
  /** puesto en cada ranking, y cuántas provincias hay */
  puestoPozos: number
  puestoExpo: number
  total: number
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
          <div style={{ padding: '0 12px 12px 44px' }}>
            <p className="s-desc m-0">{p.blurb}</p>

            {/* Dos cápsulas —la fila-píldora de "Task Rows"— en vez de tres
                cards: mismo dato en la mitad del alto, y cada una cierra con
                el puesto que ocupa la provincia en ese ranking, que es
                información que antes no estaba. */}
            <div className="mt-2.5 flex flex-col gap-1.5">
              <Capsula
                icono="pozo"
                rotulo="Pozos activos"
                valor={formatInteger(p.wells)}
                nota={`${formatDecimal(pctPozos, 1)}% del país`}
                puesto={`${String(puestoPozos).padStart(2, '0')} de ${total}`}
              />
              <Capsula
                icono="expo"
                rotulo="Exportaciones"
                valor={formatInteger(p.exportsMUSD)}
                unidad="MUSD"
                nota={`${formatDecimal(p.expSharePct, 1)}% nacional`}
                puesto={`${String(puestoExpo).padStart(2, '0')} de ${total}`}
              />
            </div>

            {operadoras.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="s-micro" style={{ color: 'var(--ink-3)' }}>
                  Operan
                </span>
                {operadoras.map((nombre) => (
                  <span key={nombre} className="s-chip-tool">
                    <Marca nombre={nombre} />
                    {nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Cápsula: la fila-píldora del sistema. Rótulo, cifra, una nota y el puesto. */
function Capsula({
  icono,
  rotulo,
  valor,
  unidad,
  nota,
  puesto,
}: {
  icono: 'pozo' | 'expo'
  rotulo: string
  valor: string
  unidad?: string
  nota: string
  puesto: string
}) {
  return (
    <div className="s-capsula">
      {/* Ícono y no un punto de color: un círculo de color sin significado
          contradice la regla del sistema —el color significa algo— y además
          la referencia usa íconos de trazo, no manchas. 14px con trazo 2, que
          es lo que le toca a esa caja. */}
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1 shrink-0"
        style={{ color: 'var(--ink-3)' }}
      >
        {icono === 'pozo' ? (
          <>
            <path d="M12 21V8" />
            <path d="M7 21h10" />
            <path d="m8 8 4-5 4 5" />
          </>
        ) : (
          <>
            <path d="M4 20h16" />
            <path d="M7 16V9" />
            <path d="M12 16V5" />
            <path d="M17 16v-4" />
          </>
        )}
      </svg>
      <span className="s-micro shrink-0" style={{ color: 'var(--ink-2)' }}>
        {rotulo}
      </span>
      <span className="s-num shrink-0 text-[13px] font-medium">{valor}</span>
      {unidad && (
        <span className="text-[11px] shrink-0" style={{ color: 'var(--ink-3)' }}>
          {unidad}
        </span>
      )}
      <span className="s-micro s-num min-w-0 flex-1 truncate" style={{ color: 'var(--ink-3)' }}>
        {nota}
      </span>
      <span className="s-chip s-chip--neutro s-mono shrink-0 !px-2 !text-[10px]">{puesto}</span>
    </div>
  )
}
