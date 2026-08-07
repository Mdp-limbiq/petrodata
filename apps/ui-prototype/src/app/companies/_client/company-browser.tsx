'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Surface } from '@/ui/surface'
import { TextField } from '@/ui/field'
import { Chip } from '@/ui/chip'
import { Badge } from '@/ui/badge'
import { EmptyState } from '@/ui/empty-state'
import { formatDecimal, formatInteger, formatPercent } from '@/lib/format'
import type { Company } from '@/fixtures/companies'

/* Listado de compañías — búsqueda por nombre + toggle "Con producción"
   (pctNacional > 0). El conteo de resultados anuncia en aria-live
   (fix del hallazgo A23). Muestra los campos reales del ranking:
   rank, listing, % nacional, % del valor y proyectos. */

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function CompanyBrowser({ companies }: { companies: Company[] }) {
  const [query, setQuery] = useState('')
  const [onlyProducing, setOnlyProducing] = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return companies.filter((c) => {
      if (onlyProducing && !(c.pctNacional > 0)) return false
      if (q && !normalize(c.name).includes(q)) return false
      return true
    })
  }, [companies, query, onlyProducing])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-[22rem]">
          <TextField
            label="Buscar compañía"
            type="search"
            placeholder="YPF, Vista, Tecpetrol…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 pb-1">
          <Chip selected={onlyProducing} onClick={() => setOnlyProducing((v) => !v)}>
            Con producción
          </Chip>
          <p aria-live="polite" className="type-label tnums m-0">
            {filtered.length === 1 ? '1 compañía' : `${filtered.length} compañías`}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        companies.length === 0 ? (
          <EmptyState
            kind="empty"
            title="Sin compañías"
            detail="Todavía no hay compañías cargadas en el directorio."
          />
        ) : (
          <EmptyState
            kind="empty"
            title="Sin resultados"
            detail="Ninguna compañía coincide con la búsqueda y los filtros elegidos."
          />
        )
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.slug} className="min-w-0">
              <Link href={`/companies/${c.slug}`} className="block h-full rounded-[10px]">
                <Surface variant="flat" interactive className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="type-label tnums shrink-0">#{c.rank}</span>
                      <h2 className="type-card-title m-0 min-w-0 break-words">{c.name}</h2>
                    </div>
                    <Badge tone="neutral" className="shrink-0">
                      {c.listing}
                    </Badge>
                  </div>
                  {c.ticker && c.price != null && c.change != null && (
                    <Badge tone={c.change >= 0 ? 'positive' : 'negative'} className="tnums self-start">
                      {c.ticker} · US$ {formatDecimal(c.price, 2)} · {c.change >= 0 ? '▲' : '▼'}{' '}
                      {formatPercent(Math.abs(c.change))}
                    </Badge>
                  )}
                  <dl className="m-0 mt-auto grid grid-cols-3 gap-2 pt-1">
                    <div className="min-w-0">
                      <dt className="type-label">% Nacional</dt>
                      <dd className="tnums m-0 mt-1 text-[13.5px] font-medium text-body">
                        {formatDecimal(c.pctNacional, 1)}%
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="type-label">% Valor US$</dt>
                      <dd className="tnums m-0 mt-1 text-[13.5px] font-medium text-body">
                        {formatDecimal(c.pctValor, 1)}%
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="type-label">Proyectos</dt>
                      <dd className="tnums m-0 mt-1 text-[13.5px] font-medium text-body">
                        {formatInteger(c.proyectos)}
                      </dd>
                    </div>
                  </dl>
                </Surface>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
