'use client'

import type { ReactNode } from 'react'
import { formatDecimal, formatInteger } from '@/lib/format'
import { useCountUp, useInView } from '@/lib/motion'
import { STATS } from '../_lib/stats'

/* "La foto del sector" — bento oscuro con la receta de KpiBento de
   Indicadores: cards negras con marco de 4px, rótulo con rombo en una
   sola línea, cifra en Inter Tight blanca.

   Tres cards, no seis (pedido de Mariano): cada una es el titular de una
   de las secciones que siguen — concentración, pozos y bolsa — así el
   bento adelanta la página en vez de acumular datos sueltos. Quedaron
   afuera el conteo de operadoras (ya está en el blurb del hero y en la
   nota del listado), el corte del 1% (es la misma idea que la
   concentración) y las que no declaran producción (vive en la nota al
   pie de la sección 02). */

const OIL = 'var(--data-oil)'

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border-4 border-black bg-inverse p-5">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="size-1.5 shrink-0 rotate-45" style={{ background: OIL }} />
        <span className="type-label-md whitespace-nowrap !leading-none !tracking-[0.12em] !text-on-dark-2">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

function Figure({ value, unit }: { value: ReactNode; unit?: string }) {
  return (
    <span className="type-kpi text-[2.6rem] !text-white">
      {value}
      {unit && <span className="ml-1.5 text-base font-normal !text-on-dark-2">{unit}</span>}
    </span>
  )
}

/** Barra de participación sobre fondo oscuro + leyenda en una línea. */
function ShareBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="mt-auto flex flex-col gap-2">
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: OIL }} />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-label flex min-w-0 items-center gap-1.5 !text-on-dark-2">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: OIL }} />
          <span className="truncate">{label}</span>
        </span>
        <span className="type-label shrink-0 tnums !text-on-dark-3">
          {formatDecimal(pct, 1)}%
        </span>
      </div>
    </div>
  )
}

function Counted({ to }: { to: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.2)
  const v = useCountUp(to, { enabled: inView, durationMs: 1200 })
  return <span ref={ref}>{formatInteger(Math.round(v))}</span>
}

export function CompanyBento() {
  const s = STATS
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* → sección 01 · la concentración es el titular del sector */}
      <Tile label="Concentración · top 5">
        <Figure value={`${formatDecimal(s.top5, 1)}%`} />
        <span className="text-[11px] tnums !text-on-dark-2">
          {s.lider.name} {formatDecimal(s.lider.pctNacional, 1)}% · {s.segunda.name}{' '}
          {formatDecimal(s.segunda.pctNacional, 1)}%
        </span>
        <ShareBar pct={s.top5} label="Las cinco primeras" />
      </Tile>

      {/* → sección 02 · más pozos no es más producción */}
      <Tile label="Pozos operados">
        <Figure value={<Counted to={s.pozosTotales} />} />
        <span className="mt-auto text-[11px] tnums !text-on-dark-2">
          Mediana de {formatInteger(s.pozosMediana)} por empresa · máximo{' '}
          {formatInteger(s.pozosMax)}
        </span>
      </Tile>

      {/* → sección 03 · las que tienen precio público */}
      <Tile label="Cotizan en bolsa">
        <Figure value={String(s.cotizan)} unit={`de ${s.empresas}`} />
        <ShareBar pct={s.pctCotizan} label="De la producción" />
      </Tile>
    </div>
  )
}
