import type { Metadata } from 'next'
import { PageHero } from '@/ui/page-hero'
import { EmptyState } from '@/ui/empty-state'
import { readMock, applyEstado, type SearchParams } from '@/mock/state'
import { WELLS } from '@/fixtures/wells'
import { MapExperience } from './_client/MapExperience'

export const metadata: Metadata = {
  title: 'Mapa de pozos',
  description: 'Mapa interactivo de pozos de la cuenca Neuquina con filtros y tabla accesible.',
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
      <div className="mx-auto max-w-[80rem] px-4 md:px-8">
        <PageHero eyebrow="Cuenca Neuquina" title="Mapa de pozos">
          Pozos simulados alrededor de Añelo, con estado, operadora y producción. Los mismos datos
          del mapa están disponibles en la tabla de abajo.
        </PageHero>
      </div>

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
