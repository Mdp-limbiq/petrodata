import type { Metadata } from 'next'
import { EmptyState } from '@/ui/empty-state'
import { readMock, applyEstado } from '@/mock/state'
import { COMPANIES } from '@/fixtures/companies'
import { CompanyBrowser } from './_client/company-browser'

/* EMPRESAS — copia 1:1 de vacamuerta.io/companies (scrape 2026-08-11),
   igual que se hizo con indicadores antes de fine-tunearla: hero con
   eyebrow + h1 + blurb, y la tabla de las 52 del ranking. Los colores y
   tipografías vienen del shim `.nd-scope` de globals.css, que reproduce
   los tokens reales de producción; se borra cuando la sección migre a
   Estrato. Textos: namespace `companies` de es.json. */

const T = {
  listEyebrow: 'EMPRESAS',
  listTitle: 'Empresas de petróleo y gas',
  listBlurb: 'Carteras de proyectos por empresa en Argentina.',
}

export const metadata: Metadata = {
  title: 'Empresas de petróleo y gas',
  description: 'Carteras de proyectos por empresa en Argentina.',
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { estado } = await readMock(searchParams)
  const companies = applyEstado(estado, COMPANIES, 3)

  return (
    <main className="nd-scope w-full flex-1 overflow-x-clip">
      <section className="nd-container pb-8 pt-12 md:pt-20">
        <span
          className="nd-mono block text-[11px] uppercase tracking-[0.08em]"
          style={{ color: 'var(--nd-text-secondary)' }}
        >
          {T.listEyebrow}
        </span>
        <h1
          className="mt-4 text-balance break-words text-4xl leading-none sm:text-5xl md:text-7xl"
          style={{ color: 'var(--nd-text-display)', fontFamily: 'var(--nd-font-display)' }}
        >
          {T.listTitle}
        </h1>
        <p
          className="mt-5 max-w-2xl text-pretty text-base leading-relaxed"
          style={{ color: 'var(--nd-text-secondary)' }}
        >
          {T.listBlurb}
        </p>
      </section>

      <section className="nd-container pb-20">
        {companies === null ? (
          <EmptyState
            kind={estado === 'offline' ? 'offline' : 'error'}
            actionHref="/companies"
            actionLabel="Reintentar"
          />
        ) : (
          <CompanyBrowser companies={companies} />
        )}
      </section>
    </main>
  )
}
