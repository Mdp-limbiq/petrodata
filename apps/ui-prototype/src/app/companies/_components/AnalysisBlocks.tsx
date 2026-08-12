'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatDecimal, formatInteger } from '@/lib/format'
import { prefersReducedMotion, useInView } from '@/lib/motion'
import { RankedRow } from './RankedRow'
import { BRECHAS, COTIZAN, PRODUCTIVIDAD, RANKED, RANK_BY_SLUG, STATS, UMBRAL_GRANDE } from '../_lib/stats'

const OIL = 'var(--data-oil)'
const GAS = 'var(--data-gas)'
const pct1 = (v: number) => `${formatDecimal(v, 1)}%`

/* ── 01 · Concentración ───────────────────────────────────────────────
   Las diez primeras con la receta 06 y la acumulada en la nota: es el
   titular del sector y hoy había que sumar 52 filas para verlo. */
export function ConcentrationBlock() {
  const top = RANKED.slice(0, 10)
  const max = top[0].pctNacional
  return (
    <div className="rounded-[10px] border bg-surface p-5 md:p-6">
      <div className="mb-1 flex items-baseline justify-between gap-3 border-b pb-2">
        <span className="type-label">Empresa</span>
        <span className="type-label">Participación</span>
      </div>
      <div className="flex flex-col">
        {top.map((c, i) => (
          <RankedRow
            key={c.slug}
            rank={i + 1}
            name={c.name}
            index={i}
            leader={i === 0}
            pct={(c.pctNacional / max) * 100}
            right={
              <span
                className="font-semibold"
                style={{ color: i === 0 ? OIL : 'var(--text-primary)' }}
              >
                {pct1(c.pctNacional)}
              </span>
            }
          />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-tertiary">
        Participación en la producción nacional. La columna suma {pct1(STATS.baseNacional)} por
        redondeo a un decimal, no 100%.
      </p>
    </div>
  )
}

/* ── 02 · Producción vs valor ─────────────────────────────────────────
   Barras divergentes desde un eje central: a la derecha en oil si la
   empresa captura más valor del que produce (crudo), a la izquierda en
   gas si captura menos (gas seco). El signo de la brecha ES la mezcla
   de la cartera, así que los tokens de dato explican el gráfico solos. */
export function ValueGapBlock() {
  const maxDesvio = Math.max(...BRECHAS.map((b) => Math.abs(b.ratio - 1)))
  return (
    <div className="rounded-[10px] border bg-surface p-5 md:p-6">
      <div className="mb-1 flex items-baseline justify-between gap-3 border-b pb-2">
        <span className="type-label">Empresa</span>
        <span className="type-label">Producción → valor · múltiplo</span>
      </div>
      <div className="flex flex-col">
        {BRECHAS.map((b, i) => (
          <GapRow key={b.slug} brecha={b} index={i} maxDesvio={maxDesvio} />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-tertiary">
        Múltiplo = participación en el valor ÷ participación en la producción. Sólo las{' '}
        {STATS.grandes} empresas con {UMBRAL_GRANDE}% o más de la producción nacional: por debajo, el
        redondeo a un decimal fabrica múltiplos falsos.
      </p>
    </div>
  )
}

function GapRow({
  brecha,
  index,
  maxDesvio,
}: {
  brecha: (typeof BRECHAS)[number]
  index: number
  maxDesvio: number
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15)
  const barRef = useRef<HTMLDivElement>(null)
  const gana = brecha.ratio >= 1
  const ancho = (Math.abs(brecha.ratio - 1) / maxDesvio) * 50 // 50% = medio ancho

  /* ancho final en el markup, animación 0 → final (ver RankedRow) */
  useEffect(() => {
    const el = barRef.current
    if (!el || !inView || prefersReducedMotion()) return
    el.style.width = '0%'
    requestAnimationFrame(() => {
      el.style.transition = `width 800ms cubic-bezier(0.16,1,0.3,1) ${index * 45}ms`
      el.style.width = `${ancho}%`
    })
  }, [inView, ancho, index])

  return (
    <div
      ref={ref}
      className="grid grid-cols-[1.5rem_1fr] items-center gap-x-4 border-b py-3 transition-colors duration-200 hover:bg-raised/60"
    >
      <span className="text-[11px] tnums" style={{ color: 'var(--text-tertiary)' }}>
        {String(RANK_BY_SLUG[brecha.slug]).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm text-primary">{brecha.name}</span>
          <span className="shrink-0 text-[11px] tnums text-secondary">
            {pct1(brecha.pctNacional)} → {pct1(brecha.pctValor)} ·{' '}
            <span className="font-semibold" style={{ color: gana ? OIL : GAS }}>
              ×{formatDecimal(brecha.ratio, 2)}
            </span>
          </span>
        </div>
        {/* eje central: la barra crece a la derecha si gana valor */}
        <div className="relative mt-1.5 h-1.5 w-full rounded-full bg-line">
          <span aria-hidden className="absolute left-1/2 top-[-2px] h-[10px] w-px bg-line-strong" />
          <div
            ref={barRef}
            className="absolute top-0 h-full rounded-full"
            style={{
              width: `${ancho}%`,
              background: gana ? OIL : GAS,
              left: gana ? '50%' : undefined,
              right: gana ? undefined : '50%',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── 03 · Pozos no es producción ──────────────────────────────────────
   Entre las grandes, el aporte por cada 100 pozos varía casi veinte
   veces: es la razón por la que el ranking no puede ordenarse por pozos. */
export function PerWellBlock() {
  const max = PRODUCTIVIDAD[0].por100
  return (
    <div className="rounded-[10px] border bg-surface p-5 md:p-6">
      <div className="mb-1 flex items-baseline justify-between gap-3 border-b pb-2">
        <span className="type-label">Empresa</span>
        <span className="type-label">Pozos · aporte por 100</span>
      </div>
      <div className="flex flex-col">
        {PRODUCTIVIDAD.map((p, i) => (
          <RankedRow
            key={p.slug}
            rank={i + 1}
            name={p.name}
            index={i}
            leader={i === 0}
            pct={(p.por100 / max) * 100}
            right={
              <>
                {formatInteger(p.pozos)} pozos ·{' '}
                <span
                  className="font-semibold"
                  style={{ color: i === 0 ? OIL : 'var(--text-primary)' }}
                >
                  {formatDecimal(p.por100, 2)}
                </span>
              </>
            }
          />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-tertiary">
        Puntos de producción nacional por cada 100 pozos operados. Las {STATS.sinProduccion}{' '}
        empresas sin producción declarada operan {formatInteger(STATS.pozosSinProduccion)} pozos.
      </p>
    </div>
  )
}

/* ── 04 · Las que cotizan ─────────────────────────────────────────────
   Las ocho con precio público, hoy desparramadas en chips de 10px entre
   las filas 1, 11, 18, 19, 22, 24, 26 y 45. Acá el pill tintado del YoY
   sí corresponde: hay uno por fila y respira. */
export function ListedBlock() {
  const max = Math.max(...COTIZAN.map((c) => c.pctNacional))
  return (
    <div className="rounded-[10px] border bg-surface p-5 md:p-6">
      <div className="mb-1 grid grid-cols-[1.5rem_minmax(0,1fr)_5rem_6rem] items-baseline gap-x-4 border-b pb-2">
        <span className="type-label">#</span>
        <span className="type-label">Empresa</span>
        <span className="type-label text-right">Precio</span>
        <span className="type-label text-right">Día</span>
      </div>
      <div className="flex flex-col">
        {COTIZAN.map((c, i) => {
          const up = (c.change ?? 0) >= 0
          const tone = up ? 'var(--status-positive)' : 'var(--status-negative)'
          return (
            <div
              key={c.slug}
              className="grid grid-cols-[1.5rem_minmax(0,1fr)_5rem_6rem] items-center gap-x-4 border-b py-3 transition-colors duration-200 hover:bg-raised/60"
            >
              <span className="text-[11px] tnums text-tertiary">
                {String(RANK_BY_SLUG[c.slug]).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/companies/${c.slug}`}
                    className="truncate text-sm text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                  <span className="shrink-0 text-[10px] tnums text-tertiary">
                    {c.ticker} · {c.exchange}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(c.pctNacional / max) * 100}%`, background: OIL }}
                  />
                </div>
                <span className="mt-1 block text-[10px] tnums text-tertiary">
                  {pct1(c.pctNacional)} de la producción nacional
                </span>
              </div>
              <span className="text-right text-[13px] tnums text-primary">
                US$ {formatDecimal(c.price ?? 0, 2)}
              </span>
              <span className="flex justify-end">
                <span
                  className="tnums inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px]"
                  style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
                >
                  {up ? '+' : '−'}
                  {formatDecimal(Math.abs(c.change ?? 0), 1)}%
                </span>
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[10px] text-tertiary">
        Cotizaciones del 11-08-2026. Entre las {STATS.cotizan} suman {pct1(STATS.pctCotizan)} de la
        producción y {pct1(STATS.pctValorCotizan)} del valor.
      </p>
    </div>
  )
}
