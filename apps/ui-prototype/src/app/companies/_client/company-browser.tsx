'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CompanyLogo } from './company-logo'
import type { Company } from '@/fixtures/companies'

/* LISTA DE EMPRESAS — port 1:1 de CompanyList de producción
   (frontend/src/components/Petrodata/entities/CompanyList.tsx):
   barra de toggle + buscador, tabla de 6 columnas dentro de una caja
   con borde, y CTA mailto al pie. Los textos son los del namespace
   `companies` de es.json, agrupados acá arriba porque el prototipo
   no tiene capa i18n.

   Divergencias DELIBERADAS respecto de producción (fixes que ya
   estaban en el prototipo y no conviene perder): label real en el
   buscador, conteo anunciado por aria-live, normalización de acentos
   en la búsqueda y caption accesible en la tabla. */

const T = {
  listEyebrow: 'EMPRESAS',
  sector: 'Sector',
  nationalShare: '% Nacional',
  valueShare: '% Valor (US$)',
  projects: 'Proyectos',
  search: 'Buscar empresa…',
  withWells: 'Con pozos',
  noResults: 'Ninguna empresa coincide con la búsqueda.',
  ctaWells: '¿Tenés un pozo o estás perforando en la zona? Escribinos para sumarte:',
  private: 'Privada',
  tradedOn: (exchange: string) => `Cotiza en ${exchange}`,
}

/* Lupa de lucide-react ("search") en SVG inline: el prototipo no
   tiene la dependencia y producción la usa sólo para este ícono. */
function SearchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function CompanyBrowser({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')
  // producción arranca con el filtro ACTIVO: sólo empresas con ≥1 pozo
  const [onlyWells, setOnlyWells] = useState(true)

  const filtered = useMemo(() => {
    const needle = normalize(q.trim())
    return companies.filter(
      (c) => (!needle || normalize(c.name).includes(needle)) && (!onlyWells || c.proyectos >= 1),
    )
  }, [companies, q, onlyWells])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          role="switch"
          aria-checked={onlyWells}
          onClick={() => setOnlyWells((v) => !v)}
          className="nd-mono inline-flex w-fit items-center gap-2 text-[11px] uppercase tracking-[0.08em]"
          style={{ color: 'var(--nd-text-secondary)' }}
        >
          <span
            className="relative inline-flex h-4 w-7 items-center rounded-full transition-colors"
            style={{ background: onlyWells ? 'var(--nd-accent)' : 'var(--nd-border)' }}
          >
            <span
              className="inline-block size-3 rounded-full bg-white transition-transform"
              style={{ transform: onlyWells ? 'translateX(14px)' : 'translateX(2px)' }}
            />
          </span>
          {T.withWells}
        </button>

        <div className="flex items-center gap-3 md:w-72">
          <label className="relative block w-full">
            <span className="sr-only">{T.search}</span>
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: 'var(--nd-text-disabled)' }}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={T.search}
              className="nd-mono w-full border py-2.5 pl-9 pr-3 text-sm outline-none"
              style={{
                borderColor: 'var(--nd-border)',
                background: 'var(--nd-surface)',
                color: 'var(--nd-text-primary)',
              }}
            />
          </label>
          <p aria-live="polite" className="sr-only">
            {filtered.length === 1 ? '1 empresa' : `${filtered.length} empresas`}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="nd-mono text-sm" style={{ color: 'var(--nd-text-disabled)' }}>
          {T.noResults}
        </p>
      ) : (
        <div
          className="overflow-x-auto border"
          style={{ borderColor: 'var(--nd-border)', background: 'var(--nd-surface)' }}
        >
          <table className="nd-mono w-full text-[12px]">
            <caption className="sr-only">
              Ranking nacional de empresas de petróleo y gas por cantidad de pozos
            </caption>
            <thead>
              <tr
                className="text-[10px] uppercase tracking-[0.08em]"
                style={{ background: 'var(--nd-surface-raised)', color: 'var(--nd-text-secondary)' }}
              >
                <th className="w-px px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">{T.listEyebrow}</th>
                <th className="px-5 py-3 text-left">{T.sector}</th>
                <th className="px-5 py-3 text-right">{T.nationalShare}</th>
                <th className="px-5 py-3 text-right">{T.valueShare}</th>
                <th className="px-5 py-3 text-right">{T.projects}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--nd-border)' }}>
              {filtered.map((c, i) => (
                <tr key={c.slug} className="transition-colors hover:bg-[var(--nd-surface-raised)]">
                  <td className="px-5 py-3 tabular-nums" style={{ color: 'var(--nd-text-disabled)' }}>
                    {i + 1}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <CompanyLogo name={c.name} website={c.website} size="sm" />
                      <div className="flex flex-col items-start gap-1">
                        <Link
                          href={`/companies/${c.slug}`}
                          className="font-[family-name:var(--nd-font-display)] tracking-normal hover:underline"
                          style={{ color: 'var(--nd-text-display)' }}
                        >
                          {c.name}
                        </Link>
                        <CompanyBadge company={c} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--nd-text-secondary)' }}>
                    {c.sector}
                  </td>
                  <td
                    className="px-5 py-3 text-right tabular-nums"
                    style={{ color: 'var(--nd-text-secondary)' }}
                  >
                    {c.pctNacional.toFixed(1)}%
                  </td>
                  <td
                    className="px-5 py-3 text-right tabular-nums"
                    style={{ color: 'var(--nd-text-secondary)' }}
                  >
                    {c.pctValor.toFixed(1)}%
                  </td>
                  <td
                    className="px-5 py-3 text-right tabular-nums"
                    style={{ color: 'var(--nd-text-secondary)' }}
                  >
                    {c.proyectos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CTA — invita a las operadoras a sumarse al listado */}
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-1 border px-4 py-3 text-sm"
        style={{
          borderColor: 'var(--nd-border)',
          background: 'var(--nd-surface)',
          color: 'var(--nd-text-secondary)',
        }}
      >
        <span>{T.ctaWells}</span>
        <a
          href="mailto:info@vacamuerta.io"
          className="underline underline-offset-2 transition-colors hover:text-[var(--nd-accent)]"
          style={{ color: 'var(--nd-text-display)' }}
        >
          info@vacamuerta.io
        </a>
      </div>
    </div>
  )
}

/* Chips bajo el nombre: si cotiza y hay precio → exchange + precio +
   variación (coloreada); si cotiza sin precio → sólo exchange; si no
   cotiza → "Privada". Mismo árbol de decisión que producción. */
function CompanyBadge({ company }: { company: Company }) {
  const badge =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] tabular-nums'
  const { exchange, price, change, isPublic } = company

  if (exchange && price != null) {
    const up = (change ?? 0) >= 0
    return (
      <div className="flex flex-wrap items-center gap-1">
        <span
          title={T.tradedOn(exchange)}
          className={`${badge} cursor-help`}
          style={{ borderColor: 'var(--nd-border)', color: 'var(--nd-text-disabled)' }}
        >
          {exchange}
        </span>
        <span
          className={badge}
          style={{ borderColor: 'var(--nd-border)', color: 'var(--nd-text-display)' }}
        >
          ${price.toFixed(2)}
        </span>
        {change != null && (
          <span
            className={`${badge} gap-0.5`}
            style={{
              borderColor: 'var(--nd-border)',
              color: up ? 'var(--nd-success)' : 'var(--nd-accent)',
            }}
          >
            <span className="text-[7px] leading-none">{up ? '▲' : '▼'}</span>
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    )
  }

  if (exchange) {
    return (
      <span
        title={T.tradedOn(exchange)}
        className={`${badge} cursor-help`}
        style={{ borderColor: 'var(--nd-border)', color: 'var(--nd-text-disabled)' }}
      >
        {exchange}
      </span>
    )
  }

  if (!isPublic) {
    return (
      <span
        className={badge}
        style={{ borderColor: 'var(--nd-border)', color: 'var(--nd-text-disabled)' }}
      >
        {T.private}
      </span>
    )
  }

  return null
}
