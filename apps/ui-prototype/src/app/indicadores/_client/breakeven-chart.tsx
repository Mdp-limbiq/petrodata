'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { AXIS_TICK, ChartFrame, ChartTooltipBox, GRID_PROPS } from '@/ui/chart-frame'
import { formatDecimal, formatInteger } from '@/lib/format'

/* Margen sobre el breakeven — Brent hoy vs breakeven de referencia (YPF):
   la banda entre ambas líneas es la tesis. Serie histórica ilustrativa. */

export type BreakevenPoint = { year: number; usdBbl: number }

function BreakevenTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <ChartTooltipBox>
      <p className="type-label">{String(label)}</p>
      <p className="mt-1 tnums font-medium text-body">
        {formatDecimal(Number(payload[0]?.value ?? 0), 0)} US$/bbl
      </p>
    </ChartTooltipBox>
  )
}

export function BreakevenChart({
  data,
  brent,
  breakeven,
  margin,
}: {
  data: BreakevenPoint[]
  brent: number
  breakeven: number
  margin: number
}) {
  const uid = useId().replace(/:/g, '')
  const summary = `El Brent hoy en ${formatDecimal(brent, 1)} US$/bbl deja un margen de ${formatDecimal(margin, 1)} dólares por barril sobre el breakeven de referencia de ${formatInteger(breakeven)} US$/bbl (YPF, Vaca Muerta). Serie histórica ilustrativa.`
  const yMax = Math.ceil((brent + 8) / 10) * 10

  return (
    <ChartFrame title="Margen sobre el breakeven" summary={summary} height="md">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id={`be-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--data-oil)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--data-oil)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, yMax]}
          />
          <Tooltip content={BreakevenTooltip} cursor={{ stroke: 'var(--border-default)' }} />
          <ReferenceLine
            y={brent}
            stroke="var(--status-positive)"
            strokeDasharray="4 4"
            label={{
              value: 'Brent hoy',
              position: 'insideTopRight',
              fill: 'var(--status-positive)',
              fontSize: 11,
              fontFamily: 'var(--font-schibsted)',
            }}
          />
          <ReferenceLine
            y={breakeven}
            stroke="var(--text-tertiary)"
            strokeDasharray="4 4"
            label={{
              value: 'Breakeven YPF',
              position: 'insideBottomRight',
              fill: 'var(--text-tertiary)',
              fontSize: 11,
              fontFamily: 'var(--font-schibsted)',
            }}
          />
          <Area
            type="monotone"
            dataKey="usdBbl"
            stroke="var(--data-oil)"
            strokeWidth={2}
            fill={`url(#be-${uid})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
