'use client'

import type { ReactNode } from 'react'
import { formatDecimal, formatInteger } from '@/lib/format'
import { useCountUp, useInView } from '@/lib/motion'
import { STATS } from '../_lib/stats'

/* "La foto del sector" — bento oscuro con la receta de KpiBento de
   Indicadores: cards negras con marco de 4px, rótulo con rombo en una
   sola línea, cifra en Inter Tight blanca con contador al entrar en
   viewport. Las seis cifras son sumas sobre la fixture del ranking. */

const OIL = 'var(--data-oil)'

function Tile({
  label,
  children,
  span,
}: {
  label: string
  children: ReactNode
  span?: string
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[10px] border-4 border-black bg-inverse p-5 ${span ?? ''}`}
    >
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

function Figure({ value, unit, hero }: { value: ReactNode; unit?: string; hero?: boolean }) {
  return (
    <span className={`type-kpi !text-white ${hero ? 'text-[2.6rem] sm:text-[3.1rem]' : 'text-3xl'}`}>
      {value}
      {unit && <span className="ml-1.5 text-base font-normal !text-on-dark-2">{unit}</span>}
    </span>
  )
}

/** Barra de participación sobre fondo oscuro + leyenda de los dos lados. */
function ShareBar({ pct, leftLabel, rightLabel }: { pct: number; leftLabel: string; rightLabel: string }) {
  return (
    <div className="mt-auto flex flex-col gap-2">
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: OIL }} />
      </div>
      {/* una sola línea: en las cards angostas dos labels enfrentados se
          apelmazaban y quebraban en dos renglones */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-label flex min-w-0 items-center gap-1.5 !text-on-dark-2">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: OIL }} />
          <span className="truncate">{leftLabel}</span>
        </span>
        <span className="type-label shrink-0 tnums !text-on-dark-3">{rightLabel}</span>
      </div>
    </div>
  )
}

function Counted({ to, digits = 0 }: { to: number; digits?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.2)
  const v = useCountUp(to, { enabled: inView, durationMs: 1200 })
  return (
    <span ref={ref}>{digits === 0 ? formatInteger(Math.round(v)) : formatDecimal(v, digits)}</span>
  )
}

export function CompanyBento() {
  const s = STATS
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* Héroe: la concentración, que es el titular del sector */}
      <Tile label="Concentración · top 5" span="sm:col-span-2">
        <Figure value={`${formatDecimal(s.top5, 1)}%`} hero />
        <span className="text-[11px] tnums !text-on-dark-2">
          {s.lider.name} {formatDecimal(s.lider.pctNacional, 1)}% ·{' '}
          {s.segunda.name} {formatDecimal(s.segunda.pctNacional, 1)}%
        </span>
        <ShareBar
          pct={s.top5}
          leftLabel="Las cinco primeras"
          rightLabel={`Las otras ${s.empresas - 5} ${formatDecimal(s.baseNacional - s.top5, 1)}%`}
        />
      </Tile>

      <Tile label="Operadoras con pozos">
        <Figure value={String(s.empresas)} />
        <span className="mt-auto text-[11px] tnums !text-on-dark-2">
          {s.empresas - s.cotizan} privadas · {s.cotizan} cotizan en bolsa
        </span>
      </Tile>

      <Tile label="Pozos operados">
        <Figure value={<Counted to={s.pozosTotales} />} />
        <span className="mt-auto text-[11px] tnums !text-on-dark-2">
          Mediana de {formatInteger(s.pozosMediana)} por empresa · máximo{' '}
          {formatInteger(s.pozosMax)}
        </span>
      </Tile>

      <Tile label="Superan el 1% nacional">
        <Figure value={String(s.grandes)} unit={`de ${s.empresas}`} />
        <ShareBar
          pct={s.pctGrandes}
          leftLabel="De la producción"
          rightLabel={`${formatDecimal(s.pctGrandes, 1)}%`}
        />
      </Tile>

      <Tile label="Cotizan en bolsa">
        <Figure value={String(s.cotizan)} unit={`de ${s.empresas}`} />
        <ShareBar
          pct={s.pctCotizan}
          leftLabel="De la producción"
          rightLabel={`${formatDecimal(s.pctCotizan, 1)}%`}
        />
      </Tile>

      <Tile label="Sin producción declarada" span="sm:col-span-2 xl:col-span-2">
        <Figure value={String(s.sinProduccion)} unit="empresas" />
        <span className="mt-auto text-[11px] tnums !text-on-dark-2">
          Operan {formatInteger(s.pozosSinProduccion)} pozos y declaran 0,0% de la producción
          nacional
        </span>
      </Tile>
    </div>
  )
}
