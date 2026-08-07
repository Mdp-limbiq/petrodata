import type { Metadata } from 'next'
import { PageHero } from '@/ui/page-hero'
import { EmptyState } from '@/ui/empty-state'
import { readMock, applyEstado } from '@/mock/state'
import { COMPANIES } from '@/fixtures/companies'
import { CompanyBrowser } from './_client/company-browser'

export const metadata: Metadata = {
  title: 'Compañías · Estrato',
  description: 'Ranking nacional de compañías productoras de petróleo y gas de Argentina.',
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { estado } = await readMock(searchParams)
  const companies = applyEstado(estado, COMPANIES, 3)

  return (
    <main className="mx-auto max-w-[80rem] px-4 pb-16 md:px-8">
      <PageHero eyebrow="Directorio · Compañías" title="Quiénes desarrollan la cuenca">
        Las 52 compañías del ranking nacional de producción, con su participación en la producción
        nacional, en el valor en dólares y sus proyectos. Cotización para las que listan en bolsa.
      </PageHero>

      {companies === null ? (
        <EmptyState kind={estado === 'offline' ? 'offline' : 'error'} actionHref="/companies" actionLabel="Reintentar" />
      ) : (
        <CompanyBrowser companies={companies} />
      )}
    </main>
  )
}
