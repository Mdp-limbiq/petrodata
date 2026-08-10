'use client'

/* "La tesis en seis datos" — versión ESTRATO en bento oscuro (pedido de
   Mariano, 2026-08-07): cards negras con marco de 4px, rombo + hairline
   como rótulo, Inter Tight para las cifras y grilla bento 4-col:
   producción (héroe, 2 col) y superávit (2 col) anclan la diagonal.
   Conserva el count-up on-scroll del KpiGrid original (reduced-motion
   muestra el valor final directo). */

import { useEffect, useRef } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { useMounted } from '../_lib/useMounted'
import { animateCounter, useInView } from '../_lib/anim'
import { formatDeltaPct, formatFigure } from './format'
import type { InvKpi } from '../_lib/types'

/* Mini-viz por KPI (pedido de Mariano): SIEMPRE con series reales ya
   scrapeadas — nada simulado. kind ring usa el propio valor del KPI. */
export type KpiViz =
  | { kind: 'area' | 'line' | 'bars' | 'signed-bars'; color: string; data: { x: string; y: number }[] }
  | { kind: 'share'; color: string }

/* La card es SIEMPRE oscura: status vivo del tema dark */
const CONFIRMED = '#2fe0a4'

/** "2026-04" → "04-2026" · "2026-08-07[ …]" → "07-08-2026" · resto tal cual */
export function fmtUpdate(asOf: string): string {
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(asOf)
  if (ymd) return `${ymd[3]}-${ymd[2]}-${ymd[1]}`
  const ym = /^(\d{4})-(\d{2})$/.exec(asOf)
  return ym ? `${ym[2]}-${ym[1]}` : asOf
}

/* Bento 4-col: héroe y cierre en doble ancho, el resto simple */
const SPAN: Record<string, string> = {
  produccion_vm: 'sm:col-span-2',
  superavit_energia: 'sm:col-span-2',
}

/** Proporción (share %): barra pegada a la cifra + leyenda de ambos
    segmentos (VM vs resto del país) — la barra informa, no decora */
function ShareBlock({ pct, color }: { pct: number; color: string }) {
  const rest = (100 - pct).toLocaleString('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-label flex items-center gap-1.5 !text-on-dark-3">
          <span aria-hidden className="size-1.5 rounded-full" style={{ background: color }} />
          Vaca Muerta
        </span>
        <span className="type-label tnums !text-on-dark-3">Resto del país {rest}%</span>
      </div>
    </div>
  )
}

/** Sparkline/mini-barras con recharts (sin ejes, sin tooltip: puro gesto) */
function MiniChart({ viz, height }: { viz: Extract<KpiViz, { kind: 'area' | 'line' | 'bars' | 'signed-bars' }>; height: number }) {
  const mounted = useMounted()
  if (!mounted) return <div style={{ height }} aria-hidden />
  const margin = { top: 2, right: 0, bottom: 0, left: 0 }
  return (
    <div style={{ height }} className="w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        {viz.kind === 'area' ? (
          <AreaChart data={viz.data} margin={margin}>
            <defs>
              <linearGradient id={`kb-${viz.color.replace(/[^a-z]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={viz.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={viz.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke={viz.color}
              strokeWidth={1.5}
              fill={`url(#kb-${viz.color.replace(/[^a-z]/gi, '')})`}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : viz.kind === 'line' ? (
          <LineChart data={viz.data} margin={margin}>
            <Line type="monotone" dataKey="y" stroke={viz.color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        ) : (
          <BarChart data={viz.data} margin={margin} barCategoryGap={viz.kind === 'signed-bars' ? '25%' : '35%'}>
            {viz.kind === 'signed-bars' && <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />}
            <Bar dataKey="y" isAnimationActive={false}>
              {viz.data.map((p) => (
                <Cell
                  key={p.x}
                  fill={viz.kind === 'signed-bars' && p.y < 0 ? '#ff6d5f' : viz.color}
                  fillOpacity={viz.kind === 'signed-bars' ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function KpiTile({
  kpi,
  hero,
  viz,
  figureRef,
}: {
  kpi: InvKpi
  hero: boolean
  viz?: KpiViz
  figureRef: (el: HTMLSpanElement | null) => void
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[10px] border-4 border-black bg-inverse p-5 ${
        SPAN[kpi.id] ?? ''
      }`}
    >
      {/* Rótulo: rombo + label a 2 líneas si hace falta (sin truncar —
          los títulos no se entierran; pedido de Mariano) */}
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-[5px] size-1.5 shrink-0 rotate-45"
          style={{ background: CONFIRMED }}
        />
        <span className="type-label-md !leading-[1.5] !tracking-[0.12em] !text-on-dark-2">
          {kpi.label}
        </span>
      </div>

      <span
        ref={figureRef}
        className={`type-kpi !text-white ${hero ? 'text-[2.6rem] sm:text-[3.1rem]' : 'text-3xl'}`}
      >
        {formatFigure(kpi.figure.value, kpi.format)}
      </span>
      {kpi.delta && (
        <span
          className="tnums inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
          style={{ color: CONFIRMED, background: 'color-mix(in srgb, #2fe0a4 12%, transparent)' }}
        >
          {formatDeltaPct(kpi.delta.pct)} {kpi.delta.base}
        </span>
      )}

      {/* Tendencia/proporción real, PEGADA a la cifra (nada flotando) */}
      {viz &&
        (viz.kind === 'share' ? (
          <ShareBlock pct={kpi.figure.value} color={viz.color} />
        ) : (
          <MiniChart viz={viz} height={hero ? 64 : 40} />
        ))}

      <span className="type-label mt-auto !text-on-dark-3">Update {fmtUpdate(kpi.source.asOf)}</span>
    </div>
  )
}

export function KpiBento({ kpis, viz }: { kpis: InvKpi[]; viz?: Record<string, KpiViz> }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 })
  const figureRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!inView || !kpis.length) return
    const anims = kpis.map((kpi, i) => {
      const el = figureRefs.current[i]
      if (!el) return undefined
      return animateCounter(el, kpi.figure.value, {
        duration: 1700,
        delay: i * 110,
        format: (v) => formatFigure(v, kpi.format),
      })
    })
    return () => anims.forEach((a) => a?.pause?.())
  }, [inView, kpis])

  if (!kpis.length) return null
  return (
    <div ref={ref} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KpiTile
          key={kpi.id}
          kpi={kpi}
          hero={kpi.id === 'produccion_vm'}
          viz={viz?.[kpi.id]}
          figureRef={(el) => {
            figureRefs.current[i] = el
          }}
        />
      ))}
    </div>
  )
}
