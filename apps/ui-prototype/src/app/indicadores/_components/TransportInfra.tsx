'use client'

// Transport infrastructure block for the indicadores page. Shows the trunk
// network that evacuates production — total km split gas/oil, plus a leaderboard
// of gas transport pipeline km by licenciataria (TGS, TGN, …). Derived from the
// official Secretaría de Energía / ENARGAS datasets (geometry only — the source
// carries no throughput), via scripts/build-pipelines.py → pipelineStats.ts.

import { useEffect, useRef } from 'react'
import { useTranslations } from '../_lib/messages'
import { animate, animateCounter, prefersReducedMotion, useInView } from '../_lib/anim'
import { PIPELINE_STATS } from '../_lib/pipelineStats'

const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const GAS_COLOR = 'var(--data-gas)'
const OIL_COLOR = 'var(--data-oil)'

export function TransportInfra() {
  const t = useTranslations('indicadores')
  const s = PIPELINE_STATS
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const max = Math.max(...s.operators.map((o) => o.km), 1)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    const anims = barRefs.current.map((el, i) => {
      if (!el) return undefined
      const target = Number(el.dataset.pct ?? '0')
      el.style.width = '0%'
      return animate(el, { width: `${target}%`, duration: 800, delay: i * 60, ease: 'outCubic' })
    })
    return () => anims.forEach((a) => a?.pause?.())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <div ref={ref}>
      {/* Summary: total network split gas / oil */}
      <div className="grid grid-cols-1 gap-px overflow-hidden border border-nd-border bg-nd-border sm:grid-cols-3">
        <Stat
          label={t('transportNetwork')}
          km={s.totalKm}
          unit={t('kmUnit')}
          sub={t('transportSegments', { count: s.gasSegments + s.oilSegments })}
          color="var(--nd-text-display)"
          inView={inView}
        />
        <Stat
          label={t('transportGas')}
          km={s.gasKm}
          unit={t('kmUnit')}
          sub={t('transportSegments', { count: s.gasSegments })}
          color={GAS_COLOR}
          inView={inView}
        />
        <Stat
          label={t('transportOil')}
          km={s.oilKm}
          unit={t('kmUnit')}
          sub={t('transportSegments', { count: s.oilSegments })}
          color={OIL_COLOR}
          inView={inView}
        />
      </div>

      {/* Gas transport km by operator */}
      <div className="mt-8">
        <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-disabled">
          {t('transportByOperator')}
        </span>
        <div className="flex flex-col">
          {s.operators.map((o, i) => {
            const pct = (o.km / max) * 100
            return (
              <div
                key={o.operator}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-nd-border py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-sans text-sm text-nd-text-display">
                      {o.operator}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-nd-text-secondary">
                      {nf.format(o.km)} {t('kmUnit')}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-nd-border">
                    <div
                      ref={(el) => {
                        barRefs.current[i] = el
                      }}
                      data-pct={pct}
                      className="h-full"
                      style={{ width: `${pct}%`, background: GAS_COLOR }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <span className="mt-3 inline-block font-mono text-[10px] text-nd-text-disabled">
        {s.source.label} · Update {s.source.asOf}
      </span>
    </div>
  )
}

function Stat({
  label,
  km,
  unit,
  sub,
  color,
  inView,
}: {
  label: string
  km: number
  unit: string
  sub: string
  color: string
  inView: boolean
}) {
  /* contador animado (paridad con las anclas de las cards 01-04) */
  const numRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!inView || !numRef.current) return
    if (prefersReducedMotion()) {
      numRef.current.textContent = nf.format(km)
      return
    }
    const a = animateCounter(numRef.current, km, {
      duration: 1400,
      delay: 200,
      format: (v) => nf.format(Math.round(v)),
    })
    return () => {
      a?.pause?.()
    }
  }, [inView, km])

  return (
    <div className="bg-nd-surface px-5 py-5">
      <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-disabled">
        {label}
      </span>
      <span className="type-kpi mt-1 block !text-3xl md:!text-4xl" style={{ color }}>
        <span ref={numRef}>{nf.format(km)}</span> {unit}
      </span>
      <span className="mt-2 block font-mono text-[11px] tabular-nums text-nd-text-secondary">
        {sub}
      </span>
    </div>
  )
}
