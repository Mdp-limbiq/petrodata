'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatMonth } from '@/utilities/formatNumber'
import { useUnits } from '@/providers/Units'
import { GAS_UNIT_LABEL, gasValue } from '@/utilities/units'
import { drawPath, useInView } from '@/components/Petrodata/uranium/anim'

type Point = { date: string; oilBblD: number; gasMmcfD: number }

const HEIGHT = 300
const PAD = { top: 20, right: 16, bottom: 28, left: 16 }

const OIL_COLOR = 'var(--nd-accent)'
const GAS_COLOR = '#0284c7' // sky-600

type Scaled = { x: number; oilY: number; gasY: number; point: Point; t: number }

export function ProvinceProductionChart({ points }: { points: Point[] }) {
  const t = useTranslations('provinces')
  const { gasUnit } = useUnits()

  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const { ref: inViewRef, inView } = useInView<HTMLDivElement>()
  const oilLineRef = useRef<SVGPathElement>(null)
  const gasLineRef = useRef<SVGPathElement>(null)
  const [hover, setHover] = useState<Scaled | null>(null)

  // Measure real pixel width for crisp rendering.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const model = useMemo(() => {
    if (points.length < 2 || width === 0) return null

    const times = points.map((p) => new Date(p.date).getTime())
    const tMin = times[0]
    const tMax = times[times.length - 1]
    const tSpan = tMax - tMin || 1

    // Normalise each series to its own max so both lines read on a shared box.
    const oilMax = Math.max(1, ...points.map((p) => p.oilBblD))
    const gasMax = Math.max(1, ...points.map((p) => p.gasMmcfD))

    const plotW = width - PAD.left - PAD.right
    const plotH = HEIGHT - PAD.top - PAD.bottom

    const sx = (time: number) => PAD.left + ((time - tMin) / tSpan) * plotW
    const syNorm = (value: number, max: number) => PAD.top + (1 - value / max) * plotH

    const scaled: Scaled[] = points.map((point, i) => ({
      point,
      t: times[i],
      x: sx(times[i]),
      oilY: syNorm(point.oilBblD, oilMax),
      gasY: syNorm(point.gasMmcfD, gasMax),
    }))

    const path = (key: 'oilY' | 'gasY') =>
      scaled.map((s, i) => `${i === 0 ? 'M' : 'L'}${s.x.toFixed(2)} ${s[key].toFixed(2)}`).join(' ')

    // ~3 horizontal gridlines.
    const gridCount = 3
    const yGrid = Array.from({ length: gridCount }, (_, i) => PAD.top + (plotH * i) / (gridCount - 1))

    // ~5 x ticks (year-month).
    const tickCount = 5
    const xTicks = Array.from({ length: tickCount }, (_, i) => {
      const time = tMin + (tSpan * i) / (tickCount - 1)
      return { x: sx(time), label: formatMonth(new Date(time).toISOString()) }
    })

    return { scaled, oilPath: path('oilY'), gasPath: path('gasY'), yGrid, xTicks }
  }, [points, width])

  useEffect(() => {
    if (!inView || !model) return
    if (oilLineRef.current) drawPath(oilLineRef.current, { duration: 2600, delay: 200 })
    if (gasLineRef.current) drawPath(gasLineRef.current, { duration: 2600, delay: 400 })
  }, [inView, model])

  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node
    inViewRef.current = node
  }

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!model) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    let best = model.scaled[0]
    let bestDiff = Infinity
    for (const s of model.scaled) {
      const d = Math.abs(s.x - x)
      if (d < bestDiff) {
        bestDiff = d
        best = s
      }
    }
    setHover(best)
  }

  if (points.length < 2) {
    return (
      <div className="bg-nd-surface border border-nd-border p-6 font-sans text-sm text-nd-text-secondary">
        {t('noSectorData')}
      </div>
    )
  }

  return (
    <div className="bg-nd-surface border border-nd-border p-4 sm:p-5">
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-secondary">
          <span className="inline-block h-[2px] w-4" style={{ backgroundColor: OIL_COLOR }} aria-hidden />
          {`${t('oilProduction')} · bbl/d`}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-secondary">
          <span className="inline-block h-[2px] w-4" style={{ backgroundColor: GAS_COLOR }} aria-hidden />
          {`${t('gasProduction')} · ${GAS_UNIT_LABEL[gasUnit]}`}
        </span>
      </div>

      <div ref={setRefs} className="relative h-[300px] w-full" onPointerLeave={() => setHover(null)}>
        {model && (
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            className="block h-full w-full"
            onPointerMove={handlePointer}
            role="img"
            aria-label={`${t('oilProduction')} / ${t('gasProduction')} — ${t('productionHistory')}`}
          >
            {/* Horizontal gridlines */}
            {model.yGrid.map((y, i) => (
              <line
                key={`grid-${i}`}
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--nd-border)"
                strokeWidth={1}
              />
            ))}

            {/* X-axis tick labels */}
            {model.xTicks.map((tk, i) => (
              <text
                key={`xt-${i}`}
                x={tk.x}
                y={HEIGHT - PAD.bottom + 18}
                textAnchor={i === 0 ? 'start' : i === model.xTicks.length - 1 ? 'end' : 'middle'}
                className="font-mono tabular-nums"
                fontSize={10}
                fill="var(--nd-text-disabled)"
              >
                {tk.label}
              </text>
            ))}

            {/* Gas line */}
            <path
              ref={gasLineRef}
              d={model.gasPath}
              fill="none"
              stroke={GAS_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Oil line */}
            <path
              ref={oilLineRef}
              d={model.oilPath}
              fill="none"
              stroke={OIL_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Hover crosshair + dots */}
            {hover && (
              <g>
                <line
                  x1={hover.x}
                  x2={hover.x}
                  y1={PAD.top}
                  y2={HEIGHT - PAD.bottom}
                  stroke="var(--nd-border-visible)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle cx={hover.x} cy={hover.gasY} r={3.5} fill={GAS_COLOR} stroke="var(--nd-surface)" strokeWidth={1.5} />
                <circle cx={hover.x} cy={hover.oilY} r={3.5} fill={OIL_COLOR} stroke="var(--nd-surface)" strokeWidth={1.5} />
              </g>
            )}
          </svg>
        )}

        {/* Hover tooltip */}
        {hover && model && (
          <div
            className="pointer-events-none absolute z-10 border border-nd-border bg-nd-surface px-2.5 py-1.5 font-mono tabular-nums"
            style={{ left: Math.min(Math.max(hover.x, PAD.left), width - 150), top: PAD.top }}
          >
            <div className="text-[10px] uppercase tracking-[0.08em] text-nd-text-disabled">
              {formatMonth(hover.point.date)}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: OIL_COLOR }}>
              {`${hover.point.oilBblD.toLocaleString()} bbl/d`}
            </div>
            <div className="text-xs" style={{ color: GAS_COLOR }}>
              {`${gasValue(hover.point.gasMmcfD, gasUnit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${GAS_UNIT_LABEL[gasUnit]}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
