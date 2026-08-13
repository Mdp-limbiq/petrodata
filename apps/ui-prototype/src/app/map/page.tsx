import type { Metadata } from 'next'
import { EmptyState } from '@/ui/empty-state'
import { readMock, applyEstado, type SearchParams } from '@/mock/state'
import { WELLS } from '@/fixtures/wells'
import { MapExperience } from './_client/MapExperience'

export const metadata: Metadata = {
  title: 'Mapa de pozos',
  description: 'Mapa interactivo de pozos de la cuenca Neuquina, con filtros por estado, recurso y operadora.',
}

/* /map — a diferencia de producción, la página tiene h1 visible y una
   alternativa accesible al mapa: la tabla "Pozos en vista" (hallazgo A2). */

export default async function MapPage({ searchParams }: { searchParams: SearchParams }) {
  const { estado } = await readMock(searchParams)
  const wells = applyEstado(estado, WELLS, 40)
  const sp = await searchParams
  const initialOperator = typeof sp.operator === 'string' ? sp.operator : null

  return (
    <div className="pb-14">
      {/* Sin hero visible (pedido de Mariano, 2026-08-12): el mapa arranca
          arriba de todo. El h1 se conserva para lectores de pantalla —
          sin él la ruta queda sin encabezado, que es el hueco de
          accesibilidad que tiene producción y acá ya estaba cerrado. */}
      <h1 className="sr-only">Mapa de pozos de la cuenca Neuquina</h1>

      {wells === null ? (
        <div className="mx-auto max-w-[80rem] px-4 md:px-8">
          <EmptyState kind="offline" actionHref="/map" actionLabel="Reintentar" />
        </div>
      ) : (
        <MapExperience wells={wells} initialOperator={initialOperator} />
      )}
    </div>
  )
}
