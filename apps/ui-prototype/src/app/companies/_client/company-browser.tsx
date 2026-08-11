'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TextField } from '@/ui/field'
import { EmptyState } from '@/ui/empty-state'
import { formatDecimal, formatInteger } from '@/lib/format'
import { CompanyLogo } from './company-logo'
import { RANK_BY_SLUG } from '../_lib/stats'
import type { Company } from '@/fixtures/companies'

/* EL LISTADO COMPLETO — las 52 con la receta 06 de Indicadores.
   Decisiones de Mariano (2026-08-11):
   - ordenado por participación en la producción, no por cantidad de pozos
   - sin el toggle "Con pozos" (filtraba cero filas: todas tienen ≥1)
   - sin la columna "Sector" (decía "Petróleo & Gas" 52 veces)
   El puesto sale de RANK_BY_SLUG, calculado sobre el set completo, así que
   NO se renumera al buscar: el puesto es de la empresa, no de la vista. */

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function CompanyBrowser({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = normalize(q.trim())
    return needle ? companies.filter((c) => normalize(c.name).includes(needle)) : companies
  }, [companies, q])

  const max = companies[0]?.pctNacional || 1

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <p aria-live="polite" className="type-label tnums m-0 pb-2">
          {filtered.length === companies.length
            ? `${companies.length} empresas`
            : `${filtered.length} de ${companies.length} empresas`}
        </p>
        <div className="w-full md:max-w-[18rem]">
          <TextField
            label="Buscar empresa"
            type="search"
            placeholder="YPF, Vista, Tecpetrol…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          kind="empty"
          title="Sin resultados"
          detail="Ninguna empresa coincide con la búsqueda."
        />
      ) : (
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <div className="mb-1 grid grid-cols-[1.5rem_minmax(0,1fr)_5.5rem_5.5rem] items-baseline gap-x-4 border-b pb-2">
            <span className="type-label">#</span>
            <span className="type-label">Empresa</span>
            <span className="type-label text-right">% Valor</span>
            <span className="type-label text-right">Pozos</span>
          </div>
          <div className="flex flex-col">
            {filtered.map((c) => {
              const rank = RANK_BY_SLUG[c.slug]
              const leader = rank === 1
              return (
                <div
                  key={c.slug}
                  className="grid grid-cols-[1.5rem_minmax(0,1fr)_5.5rem_5.5rem] items-center gap-x-4 border-b py-3 transition-colors duration-200 hover:bg-raised/60"
                >
                  <span
                    className="text-[11px] tnums"
                    style={{ color: leader ? 'var(--data-oil)' : 'var(--text-tertiary)' }}
                  >
                    {String(rank).padStart(2, '0')}
                  </span>
                  <div className="flex min-w-0 items-start gap-3">
                    <CompanyLogo name={c.name} website={c.website} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link
                          href={`/companies/${c.slug}`}
                          className="truncate text-sm text-primary hover:underline"
                          style={{ fontWeight: leader ? 600 : 400 }}
                        >
                          {c.name}
                        </Link>
                        <span className="shrink-0 text-[11px] tnums text-secondary">
                          <span
                            className="font-semibold"
                            style={{ color: leader ? 'var(--data-oil)' : 'var(--text-primary)' }}
                          >
                            {formatDecimal(c.pctNacional, 1)}%
                          </span>
                        </span>
                      </div>
                      {c.exchange && c.price != null && (
                        <span className="mt-0.5 block text-[10px] tnums text-tertiary">
                          {c.exchange} · US$ {formatDecimal(c.price, 2)}
                          {c.change != null && (
                            <span
                              className="ml-1 font-semibold"
                              style={{
                                color:
                                  c.change >= 0
                                    ? 'var(--status-positive)'
                                    : 'var(--status-negative)',
                              }}
                            >
                              {c.change >= 0 ? '+' : '−'}
                              {formatDecimal(Math.abs(c.change), 1)}%
                            </span>
                          )}
                        </span>
                      )}
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(c.pctNacional / max) * 100}%`,
                            background: 'var(--data-oil)',
                            opacity: leader ? 1 : 0.85,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-right text-[11px] tnums text-secondary">
                    {formatDecimal(c.pctValor, 1)}%
                  </span>
                  <span className="text-right text-[11px] tnums text-secondary">
                    {formatInteger(c.proyectos)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
