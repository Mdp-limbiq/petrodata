'use client'

import { DataTable, type Column } from '@/ui/data-table'
import { formatDecimal, formatUSDCompact } from '@/lib/format'

/* Wrapper cliente de la tabla de contribución: las columns llevan funciones
   (cell/sort) que no pueden cruzar el límite server→client. */

export type ContributionRow = {
  operator: string
  partBoePct: number
  partUsdPct: number
  valorMUSD: number
  regaliasMUSD: number
  expoMUSD: number
}

const COLUMNS: Column<ContributionRow>[] = [
  {
    key: 'operator',
    header: 'Operadora',
    cell: (r) => <span className="font-medium text-body">{r.operator}</span>,
    sort: (r) => r.operator,
  },
  {
    key: 'partBoePct',
    header: 'Part. BOE %',
    cell: (r) => `${formatDecimal(r.partBoePct, 1)}%`,
    sort: (r) => r.partBoePct,
    align: 'right',
    numeric: true,
  },
  {
    key: 'partUsdPct',
    header: 'Part. US$ %',
    cell: (r) => `${formatDecimal(r.partUsdPct, 1)}%`,
    sort: (r) => r.partUsdPct,
    align: 'right',
    numeric: true,
  },
  {
    key: 'valorMUSD',
    header: 'Valor bruto',
    cell: (r) => formatUSDCompact(r.valorMUSD * 1e6),
    sort: (r) => r.valorMUSD,
    align: 'right',
    numeric: true,
  },
  {
    key: 'regaliasMUSD',
    header: 'Regalías',
    cell: (r) => formatUSDCompact(r.regaliasMUSD * 1e6),
    sort: (r) => r.regaliasMUSD,
    align: 'right',
    numeric: true,
  },
  {
    key: 'expoMUSD',
    header: 'Expo. atribuidas',
    cell: (r) => formatUSDCompact(r.expoMUSD * 1e6),
    sort: (r) => r.expoMUSD,
    align: 'right',
    numeric: true,
  },
]

export function ContributionTable({ rows }: { rows: ContributionRow[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.operator}
      defaultSort={{ key: 'valorMUSD', dir: 'desc' }}
      caption="Contribución económica por operadora: participación en BOE y en dólares, valor bruto, regalías y exportaciones atribuidas (ventana 2025-06 a 2026-05)"
    />
  )
}
