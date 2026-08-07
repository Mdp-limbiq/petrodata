import { Surface } from '@/ui/surface'
import { Stat } from '@/ui/stat'
import { SectionLabel } from '@/ui/section-label'
import { Donut } from '@/ui/donut'
import { ProportionBarList } from '@/ui/proportion-list'
import { EmptyState } from '@/ui/empty-state'
import { formatCompact, formatInteger, formatMonth, formatPercent } from '@/lib/format'
import { HEADLINE, PREV } from '@/fixtures/production'
import { TOP_OPERATORS } from '@/fixtures/operators'
import { NEWS } from '@/fixtures/news'
import { applyEstado, readMock, type SearchParams } from '@/mock/state'
import { OperatorAreaChart } from './_home/OperatorChart'
import { NewsCardGrid } from './noticias/_components/NewsCard'

/* Home — dashboard de producción de Vaca Muerta. Gemelo funcional del
   dashboard de vacamuerta.io con sus datos reales (MAY 2026). */

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
      {/* Hero: el número nacional como titular */}
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
          Barriles equivalentes producidos en el mes. Datos reales de vacamuerta.io sobre{' '}
          {formatInteger(HEADLINE.activeWells)} pozos activos de un catálogo de{' '}
          {formatInteger(HEADLINE.catalogWells)}.
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

      {/* 01 · Producción por operadora */}
      <section className="mt-14">
        <SectionLabel index="01" title="Producción por operadora" note="Top 5 · últimos 12 meses" />
        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Surface>
            <OperatorAreaChart />
          </Surface>
          <Surface>
            <p className="type-label mb-5">Ranking · BOE del mes</p>
            <ProportionBarList
              items={TOP_OPERATORS.map((op) => ({
                key: op.slug,
                label: op.name,
                value: op.boeMonth,
                display: `${formatCompact(op.boeMonth)} BOE`,
                color: op.color,
              }))}
            />
          </Surface>
        </div>
      </section>

      {/* 02 · Share de Vaca Muerta (nivel 2 de jerarquía: superficie inversa) */}
      <section className="mt-14">
        <SectionLabel index="02" title="Share de Vaca Muerta" note={periodo} />
        <Surface variant="inverse" className="mt-5">
          <div className="flex flex-col items-center gap-8 p-2 md:flex-row md:gap-14 md:p-4">
            <div className="shrink-0 [&_.type-kpi]:!text-on-dark [&_.type-label]:!text-on-dark-3">
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
                centerLabel="no convencional"
              />
            </div>
            <div className="min-w-0">
              <h3 className="type-card-title !text-on-dark text-balance">
                Casi cuatro de cada cinco barriles equivalentes ya salen del shale
              </h3>
              <p className="mt-3 max-w-[32rem] text-[13.5px] text-on-dark-2">
                La participación de Vaca Muerta sobre el total nacional crece de forma sostenida
                desde 2024, empujada por el petróleo de la ventana negra y por el gas de invierno.
              </p>
              <ul className="mt-5 flex list-none flex-col gap-2 p-0">
                <li className="flex items-center gap-2.5 text-[13px] text-on-dark-2">
                  <span aria-hidden className="size-2 rounded-full bg-oil" />
                  Vaca Muerta
                  <span className="tnums ml-auto font-medium text-on-dark">
                    {formatPercent(HEADLINE.vmShare)}
                  </span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-on-dark-2">
                  <span aria-hidden className="size-2 rounded-full bg-line-strong" />
                  Convencional
                  <span className="tnums ml-auto font-medium text-on-dark">
                    {formatPercent(1 - HEADLINE.vmShare)}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Surface>
      </section>

      {/* 03 · Últimas noticias */}
      <section className="mt-14">
        <SectionLabel
          index="03"
          title="Últimas noticias"
          note="Todas las noticias →"
          noteHref="/noticias"
        />
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
    </div>
  )
}
