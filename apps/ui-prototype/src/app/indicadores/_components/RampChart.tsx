'use client'

/* Rampa de producción — alineada con la card 01 (auditoría de Mariano,
   2026-08-08): dato ancla animado ("Producción actual" + delta YoY calculado
   de la propia serie), petróleo en VERDE data-oil (el rojo de producción
   leía como alerta), tooltip oscuro con fecha legible. */

import { useEffect, useRef } from 'react'
import { useTranslations } from '../_lib/messages'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMounted } from '../_lib/useMounted'
import { formatCompact } from '../_lib/formatNumber'
import { animateCounter, prefersReducedMotion, useInView } from '../_lib/anim'
import type { InvSeriePoint } from '../_lib/types'

const OIL = 'var(--data-oil)'
const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'always',
})

type Row = {
  period: string
  oil: number | null // confirmed segment
  oilPrelim: number | null // preliminary tail (dashed)
  raw: number
  preliminary: boolean
}

function buildRows(points: InvSeriePoint[]): Row[] {
  const firstPrelim = points.findIndex((p) => p.preliminary)
  return points.map((p, i) => {
    const isPrelim = p.preliminary
    // Connect the dashed tail to the last confirmed point.
    const connect = firstPrelim > 0 && i === firstPrelim - 1
    return {
      period: p.period,
      oil: isPrelim ? null : p.oilBblD,
      oilPrelim: isPrelim || connect ? p.oilBblD : null,
      raw: p.oilBblD,
      preliminary: isPrelim,
    }
  })
}

function fmtPeriod(period: string): string {
  // "2026-04" → "abr '26"
  const [y, m] = period.split('-')
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1))
  const month = d.toLocaleString('es-AR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
  return `${month} '${y.slice(2)}`
}

export function RampChart({ points }: { points: InvSeriePoint[] }) {
  const t = useTranslations('indicadores')
  const mounted = useMounted()
  const rows = buildRows(points)
  const hasPrelim = points.some((p) => p.preliminary)

  /* Dato ancla: último mes CONFIRMADO + variación vs 12 meses atrás,
     ambos derivados de la propia serie */
  const confirmed = points.filter((p) => !p.preliminary)
  const lastConfirmed = confirmed[confirmed.length - 1]
  const yearAgo = lastConfirmed
    ? points.find((p) => {
        const [y, m] = lastConfirmed.period.split('-')
        return p.period === `${Number(y) - 1}-${m}`
      })
    : undefined
  const yoyPct =
    lastConfirmed && yearAgo ? (lastConfirmed.oilBblD / yearAgo.oilBblD - 1) * 100 : null

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const headRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!inView || !headRef.current || !lastConfirmed) return
    if (prefersReducedMotion()) {
      headRef.current.textContent = nf0.format(Math.round(lastConfirmed.oilBblD))
      return
    }
    const a = animateCounter(headRef.current, Math.round(lastConfirmed.oilBblD), {
      duration: 1500,
      delay: 250,
      format: (v) => nf0.format(Math.round(v)),
    })
    return () => {
      a?.pause?.()
    }
  }, [inView, lastConfirmed])

  if (!rows.length) {
    return (
      <div className="flex h-[200px] items-center justify-center font-mono text-sm text-nd-text-disabled md:h-[240px]">
        {t('charts.noProduction')}
      </div>
    )
  }

  return (
    <div ref={ref} className="flex flex-col gap-5">
      {/* Dato ancla (paridad con la card 01) */}
      {lastConfirmed && (
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-disabled">
              Producción actual · {fmtPeriod(lastConfirmed.period)}
            </span>
            <span className="mt-1 block text-3xl tabular-nums text-nd-text-display md:text-4xl font-display">
              <span ref={headRef}>{nf0.format(Math.round(lastConfirmed.oilBblD))}</span>
              <span className="ml-1 text-base text-nd-text-secondary">bbl/d</span>
            </span>
          </div>
          {yoyPct != null && (
            <span
              className="tnums rounded-full px-2 py-0.5 font-mono text-[11px]"
              style={{ color: OIL, background: 'color-mix(in srgb, var(--data-oil) 12%, transparent)' }}
            >
              {nf1.format(yoyPct)}% YoY
            </span>
          )}
        </div>
      )}

      <div className="h-[200px] w-full md:h-[240px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="grad-oil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={OIL} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={OIL} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--nd-border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={fmtPeriod}
                tick={{ fill: 'var(--nd-text-disabled)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--nd-border)' }}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v as number)}
                tick={{ fill: 'var(--nd-text-disabled)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                content={<RampTooltip prelimLabel={t('charts.preliminary')} />}
                cursor={{ stroke: 'var(--nd-border)', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="oil"
                stroke={OIL}
                strokeWidth={1.5}
                fill="url(#grad-oil)"
                connectNulls={false}
                isAnimationActive
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="oilPrelim"
                stroke={OIL}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeOpacity={0.6}
                fill="url(#grad-oil)"
                fillOpacity={0.4}
                connectNulls
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      {hasPrelim && (
        <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-nd-text-disabled">
          <span className="mr-1 inline-block h-px w-4 align-middle" style={{ borderTop: `1px dashed ${OIL}` }} />
          {t('charts.preliminaryPartial')}
        </p>
      )}
    </div>
  )
}

type TooltipPayload = { value?: number; payload?: Row }

function RampTooltip({
  active,
  payload,
  label,
  prelimLabel,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
  prelimLabel?: string
}) {
  if (!active || !payload || !payload.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  /* Tooltip oscuro Estrato: card negra radio 8, fecha legible (on-dark-2) */
  return (
    <div className="rounded-[8px] border border-white/15 bg-[#04060a] px-3 py-2.5 font-mono shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)]">
      <div className="mb-1.5 flex items-center justify-between gap-4 border-b border-white/10 pb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-on-dark-2">
        <span>{fmtPeriod(String(label))}</span>
        {row.preliminary && <span style={{ color: '#e2a33f' }}>{prelimLabel}</span>}
      </div>
      <div className="text-[12px] tabular-nums text-white">
        {new Intl.NumberFormat('es-AR').format(Math.round(row.raw))} bbl/d
      </div>
    </div>
  )
}
