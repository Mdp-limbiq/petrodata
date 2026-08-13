import Link from 'next/link'
import { Surface } from '@/ui/surface'
import { Stat } from '@/ui/stat'
import { SectionLabel } from '@/ui/section-label'
import { Donut } from '@/ui/donut'
import { ProportionBarList } from '@/ui/proportion-list'
import { EmptyState } from '@/ui/empty-state'
import { formatCompact, formatInteger, formatMonth, formatPercent } from '@/lib/format'
import { HEADLINE, PREV } from '@/fixtures/production'
import { TOP_OPERATORS } from '@/fixtures/operators'
import { WELLS } from '@/fixtures/wells'
import { NEWS } from '@/fixtures/news'
import { applyEstado, readMock, type SearchParams } from '@/mock/state'
import { OperatorAreaChart } from './_home/OperatorChart'
import { MapPreview } from './_home/MapPreview'
import { NewsCardGrid } from './noticias/_components/NewsCard'

/* DASHBOARD — gemelo del home de vacamuerta.io con sus datos reales
   (MAY 2026). El orden y las piezas siguen al sitio: hero con la cifra
   del mes → 4 KPIs → fila de tres paneles (share, operadoras, mapa de
   actividad) → banda del mapa → últimas noticias → fecha de corte.
   Las secciones van SIN numerar, como en producción. */

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { estado } = await readMock(searchParams)
  const noticias = applyEstado(estado, NEWS, 2)
  const ultimas = noticias
    ?.slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const periodo = formatMonth(`${HEADLINE.period}-01`)
  const previo = formatMonth(`${PREV.period}-01`)

  return (
    <div className="mx-auto max-w-[80rem] px-4 pb-16 md:px-8">
      {/* Hero: el número del mes como titular */}
      <header className="pb-2 pt-10 md:pt-12">
        <p className="type-label-md mb-3 flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-primary" />
          Vaca Muerta · {periodo}
        </p>
        <h1 className="type-display tnums m-0 flex flex-wrap items-baseline gap-x-3 text-[clamp(2.8rem,8vw,4.8rem)]">
          {formatInteger(HEADLINE.boeMonth)}
          <span className="type-label-md !tracking-[0.14em]">BOE</span>
        </h1>
        <p className="mt-4 max-w-[44rem] text-[13.5px] text-secondary">
          Inteligencia en tiempo real para el petróleo y el gas de Argentina, actualizada
          mensualmente.
        </p>
      </header>

      {/* KPIs del mes */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Surface>
          <Stat
            label="Petróleo"
            value={HEADLINE.oil}
            unit="bbl/d"
            delta={HEADLINE.momOil}
            footnote={`vs. ${previo}`}
            animate
          />
        </Surface>
        <Surface>
          <Stat
            label="Gas natural"
            value={HEADLINE.gas}
            format="compact"
            unit="MMm³/d"
            delta={HEADLINE.momGas}
            footnote={`vs. ${previo}`}
            animate
          />
        </Surface>
        <Surface>
          <Stat
            label="Participación VM"
            value={HEADLINE.vmShare}
            format="percent"
            footnote="del BOE nacional"
            animate
          />
        </Surface>
        <Surface>
          <Stat
            label="Pozos activos"
            value={HEADLINE.activeWells}
            delta={HEADLINE.momWells}
            footnote={`vs. ${previo}`}
            animate
          />
        </Surface>
      </div>

      {/* Fila de tres paneles del mismo peso, como el dashboard real:
          participación · operadoras · actividad */}
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Surface className="flex flex-col">
          <p className="type-label">Participación de Vaca Muerta en el BOE</p>
          <div className="mt-4 flex flex-1 items-center justify-center">
            <Donut
              title={`Participación de Vaca Muerta en la producción nacional: ${formatPercent(HEADLINE.vmShare)}`}
              segments={[
                { value: HEADLINE.vmShare, color: 'var(--data-oil)', label: 'Vaca Muerta' },
                {
                  value: 1 - HEADLINE.vmShare,
                  color: 'var(--border-strong)',
                  label: 'Convencional',
                },
              ]}
              center={formatPercent(HEADLINE.vmShare)}
              centerLabel="VM"
            />
          </div>
          <ul className="m-0 mt-4 flex list-none flex-col gap-1.5 p-0">
            <li className="flex items-center gap-2 text-[11px] text-secondary">
              <span aria-hidden className="size-1.5 rounded-full bg-oil" />
              Vaca Muerta
              <span className="tnums ml-auto text-primary">{formatPercent(HEADLINE.vmShare)}</span>
            </li>
            <li className="flex items-center gap-2 text-[11px] text-secondary">
              <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
              Convencional
              <span className="tnums ml-auto text-primary">
                {formatPercent(1 - HEADLINE.vmShare)}
              </span>
            </li>
          </ul>
        </Surface>

        <Surface className="flex flex-col">
          <div className="flex items-baseline justify-between gap-3">
            <p className="type-label">Operadoras principales</p>
            <p className="type-label">BOE</p>
          </div>
          <div className="mt-4 flex-1">
            <ProportionBarList
              items={TOP_OPERATORS.map((op) => ({
                key: op.slug,
                label: op.name,
                value: op.boeMonth,
                display: formatCompact(op.boeMonth),
                color: op.color,
              }))}
            />
          </div>
          <Link
            href="/companies"
            className="type-label mt-4 block !text-primary hover:underline"
          >
            Ranking completo →
          </Link>
        </Surface>

        <MapPreview />
      </div>

      {/* Banda del mapa: la invitación a la herramienta */}
      <section className="mt-14">
        <SectionLabel title="El mapa" />
        <Surface variant="photo" className="mt-5 overflow-hidden">
          <div className="flex min-h-[15rem] flex-col justify-end gap-3 p-2 md:min-h-[17rem] md:p-4">
            <span className="type-label !text-on-dark-2">Mapa interactivo</span>
            <h2 className="type-display max-w-xl text-balance !text-white !text-[1.7rem] md:!text-[2.1rem]">
              La actividad de la cuenca. Pozo por pozo.
            </h2>
            <p className="max-w-lg text-[13.5px] text-on-dark-2">
              {formatInteger(HEADLINE.catalogWells)} pozos en el catálogo,{' '}
              {formatInteger(WELLS.length)} muestreados en vivo sobre la cuenca Neuquina.
            </p>
            <Link
              href="/map"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-[8px] bg-surface px-4 py-2 text-[12px] font-medium text-primary transition-opacity duration-200 hover:opacity-85"
            >
              Abrir el mapa →
            </Link>
          </div>
        </Surface>
      </section>

      {/* Producción por operadora — el sitio lo tiene oculto pero
          restaurable; acá se conserva porque es el bloque más denso */}
      <section className="mt-14">
        <SectionLabel title="Producción por operadora" note="Top 5 · últimos 12 meses" />
        <Surface className="mt-5">
          <OperatorAreaChart />
        </Surface>
      </section>

      {/* Últimas noticias */}
      <section className="mt-14">
        <SectionLabel title="Últimas noticias" note="Todas las noticias →" noteHref="/noticias" />
        {ultimas == null ? (
          <div className="mt-5">
            <EmptyState kind={estado === 'offline' ? 'offline' : 'error'} />
          </div>
        ) : ultimas.length === 0 ? (
          <div className="mt-5">
            <EmptyState kind="empty" detail="Todavía no hay noticias cargadas." />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {ultimas.map((n) => (
              <NewsCardGrid key={n.id} item={n} />
            ))}
          </div>
        )}
      </section>

      {/* Fecha de corte de los datos */}
      <div className="mt-10 rounded-[10px] border bg-surface px-5 py-3">
        <span className="type-label">Datos hasta {periodo}</span>
      </div>
    </div>
  )
}
