'use client'

// Cita de fuente compacta: "Update 04-2026" (pedido de Mariano, 2026-08-07 —
// reemplaza el "Computado por vacamuerta.io · último dato disponible {date}"
// de producción en toda la página).

import { fmtUpdate } from './KpiBento'

export function SourceChip({ source }: { source: { asOf: string } }) {
  return (
    <span className="font-mono text-[10px] uppercase leading-none tracking-[0.08em] text-nd-text-disabled">
      Update {fmtUpdate(source.asOf)}
    </span>
  )
}
