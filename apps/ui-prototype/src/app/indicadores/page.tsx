import type { Metadata } from 'next'
import { PageHero } from '@/ui/page-hero'
import { Surface } from '@/ui/surface'
import { Stat } from '@/ui/stat'
import { SectionLabel } from '@/ui/section-label'
import { Badge } from '@/ui/badge'
import { ProportionBarList } from '@/ui/proportion-list'
import { EmptyState } from '@/ui/empty-state'
import { Alert } from '@/ui/alert'
import { formatDecimal, formatInteger } from '@/lib/format'
import { applyEstado, readMock, type SearchParams } from '@/mock/state'
import {
  BREAKEVEN,
  BRENT,
  CONTRIBUTION,
  CONTRIBUTION_TOTALS,
  DAY_VALUE,
  RIGI,
  TESIS,
  VM,
  WORLD_OIL,
} from '@/fixtures/indicadores'
import { OIL_PRODUCERS } from '@/fixtures/operators'
import { ContributionTable } from './_client/contribution-table'
import { BreakevenChart } from './_client/breakeven-chart'

export const metadata: Metadata = {
  title: 'Indicadores',
  description:
    'La oportunidad de Vaca Muerta en números: valor de producción, contribución por operadora, margen sobre el breakeven y el lugar de Argentina en el mundo. Datos reales de vacamuerta.io.',
}

export default async function IndicadoresPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { estado } = await readMock(searchParams)
  const tesis = applyEstado(estado, TESIS, 3)
  const contribution = applyEstado(estado, CONTRIBUTION, 4)

  const hero = (
    <PageHero eyebrow="Tesis de inversión" title="Indicadores">
      La oportunidad de Vaca Muerta en números: cada cifra se computa a partir de datos
      oficiales de producción y exportación.
    </PageHero>
  )

  /* error / offline → hero + estado de error, nada más */
  if (tesis === null || contribution === null) {
    return (
      <div className="mx-auto max-w-[80rem] px-4 pb-16 md:px-8">
        {hero}
        <EmptyState
          kind={estado === 'offline' ? 'offline' : 'error'}
          actionHref="/indicadores"
          actionLabel="Reintentar"
        />
      </div>
    )
  }

  const vacio = estado === 'vacio'

  const oilItems = OIL_PRODUCERS.map((o, i) => ({
    key: o.name,
    label: i === 0 ? <span className="font-medium text-oil">{o.name}</span> : o.name,
    value: o.bbld,
    display: `${formatInteger(o.bbld)} bbl/d`,
    color: i === 0 ? 'var(--data-oil)' : undefined,
  }))

  const worldItems = [
    ...WORLD_OIL.top.map((c) => ({
      key: c.name,
      label: c.name as React.ReactNode,
      value: c.kbbld,
      display: `${formatInteger(c.kbbld)} mil bbl/d`,
      color: undefined as string | undefined,
    })),
    {
      key: 'argentina',
      label: (
        <span className="font-medium text-oil">Argentina · #{WORLD_OIL.todayRank} hoy</span>
      ),
      value: WORLD_OIL.todayKbbld,
      display: `${formatInteger(WORLD_OIL.todayKbbld)} mil bbl/d`,
      color: 'var(--data-oil)',
    },
  ]

  return (
    <div className="mx-auto max-w-[80rem] px-4 pb-16 md:px-8">
      {hero}

      {/* Valor de un día — única superficie inversa: jerarquía máxima */}
      <section aria-label="Valor de un día de Vaca Muerta">
        {vacio ? (
          <EmptyState
            kind="empty"
            title="Sin valor de producción"
            detail="No hay valor bruto de producción para mostrar."
          />
        ) : (
          <Surface variant="inverse">
            <dl className="m-0 flex min-w-0 flex-col gap-2.5">
              <dt className="type-label !text-on-dark-3">Valor de un día de Vaca Muerta</dt>
              <dd className="m-0 flex flex-wrap items-baseline gap-2">
                <span className="type-kpi text-[2.6rem] !text-on-dark md:text-[3rem]">
                  US$ {formatDecimal(DAY_VALUE.perDayMUSD, 1)} M
                </span>
                <span className="type-label-md !text-on-dark-3">por día</span>
              </dd>
              <dd className="m-0 tnums text-on-dark">
                ≈ US$ {formatDecimal(DAY_VALUE.perYearBUSD, 1)} B al año · ≈{' '}
                {formatDecimal(DAY_VALUE.pbiPct, 1)}% del PBI {DAY_VALUE.pbiYear}
              </dd>
              <dd className="m-0 type-label !text-on-dark-3">
                Valor bruto de producción · últimos 12 meses · petróleo a Brent menos calidad
                + gas a PIST
              </dd>
            </dl>
          </Surface>
        )}
      </section>

      {/* Grid Brent: precio, margen y sólo-petróleo */}
      <section aria-label="Brent y margen" className="mt-4">
        {vacio ? (
          <EmptyState
            kind="empty"
            title="Brent no disponible"
            detail="No hay precio de referencia para mostrar."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Surface variant="flat">
              <Stat
                label="Brent hoy"
                value={BRENT.value}
                format="compact"
                unit="US$/bbl"
                animate
                footnote={`PROMEDIO PERÍODO US$ ${formatDecimal(BRENT.avg12m, 1)}`}
              />
            </Surface>
            <Surface variant="flat">
              <Stat
                label="Margen sobre breakeven"
                value={BRENT.marginOverBreakeven}
                format="compact"
                unit="US$/bbl"
                animate
                footnote={`BREAKEVEN REF. US$ ${formatInteger(BRENT.breakeven)} (YPF)`}
              />
            </Surface>
            <Surface variant="flat">
              <Stat
                label="Sólo el petróleo"
                value={BRENT.oilOnlyYearBUSD}
                format="compact"
                unit="US$ B/año"
                animate
                footnote={`US$ ${formatDecimal(BRENT.oilOnlyDayMUSD, 1)} M POR DÍA`}
              />
            </Surface>
          </div>
        )}
      </section>

      {/* 01 · La tesis en seis datos */}
      <section aria-label="La tesis en seis datos" className="mt-14">
        <SectionLabel index="01" title="La tesis en seis datos" note={`DATOS AL ${VM.dataDate}`} />
        <div className="mt-5">
          {tesis.length === 0 ? (
            <EmptyState
              kind="empty"
              title="Sin datos de la tesis"
              detail="No hay indicadores para mostrar."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tesis.map((t) => (
                <Surface key={t.label} variant="flat" className="flex flex-col gap-2.5">
                  <p className="m-0 type-label">{t.label}</p>
                  <p
                    className={`m-0 tnums ${
                      t.value.length <= 9 ? 'type-kpi text-[1.9rem]' : 'type-h2'
                    }`}
                  >
                    {t.value}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="type-label tnums">{t.asOf}</span>
                    {t.yoy && <Badge tone="positive">{t.yoy} i/a</Badge>}
                  </div>
                </Surface>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 02 · Contribución económica por operadora */}
      <section aria-label="Contribución económica por operadora" className="mt-14">
        <SectionLabel
          index="02"
          title="Contribución económica por operadora"
          note="VENTANA 2025-06 A 2026-05"
        />
        <div className="mt-5">
          {contribution.length === 0 ? (
            <EmptyState
              kind="empty"
              title="Sin datos por operadora"
              detail="No hay contribución económica para mostrar."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Surface variant="flat">
                  <Stat
                    label="Valor bruto"
                    value={CONTRIBUTION_TOTALS.valorBrutoBUSD}
                    format="compact"
                    unit="US$ B"
                    footnote="ANUALIZADO"
                  />
                </Surface>
                <Surface variant="flat">
                  <Stat
                    label="Regalías"
                    value={CONTRIBUTION_TOTALS.regaliasBUSD}
                    format="compact"
                    unit="US$ B"
                    footnote="AL 12% DEL VALOR BRUTO"
                  />
                </Surface>
                <Surface variant="flat">
                  <Stat
                    label="Exportaciones"
                    value={CONTRIBUTION_TOTALS.exportacionesBUSD}
                    format="compact"
                    unit="US$ B"
                    footnote="ATRIBUIDAS PRO RATA"
                  />
                </Surface>
              </div>
              <div className="mt-3">
                <ContributionTable rows={contribution} />
              </div>
              <div className="mt-3">
                <Alert tone="info" title="Metodología">
                  Volúmenes oficiales por operadora, ventana 2025-06 a 2026-05; petróleo
                  valuado a Brent −US$ 5/bbl; regalías al 12%; exportaciones atribuidas pro
                  rata de la producción. Son estimaciones, no cifras contables.
                </Alert>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 03 · Margen sobre el breakeven */}
      <section aria-label="Margen sobre el breakeven" className="mt-14">
        <SectionLabel index="03" title="Margen sobre el breakeven" note="US$/BBL" />
        <div className="mt-5">
          {vacio ? (
            <EmptyState
              kind="empty"
              title="Sin serie de breakeven"
              detail="No hay datos de costos para mostrar."
            />
          ) : (
            <Surface variant="flat">
              <BreakevenChart
                data={BREAKEVEN}
                brent={BRENT.value}
                breakeven={BRENT.breakeven}
                margin={BRENT.marginOverBreakeven}
              />
              <p className="mt-3 border-t pt-3 text-secondary">
                Con el Brent en{' '}
                <span className="tnums font-medium text-body">
                  {formatDecimal(BRENT.value, 1)} US$/bbl
                </span>{' '}
                y un breakeven de referencia de{' '}
                <span className="tnums font-medium text-body">
                  US$ {formatInteger(BRENT.breakeven)}
                </span>{' '}
                (YPF), el margen es de{' '}
                <span className="tnums font-medium text-body">
                  {formatDecimal(BRENT.marginOverBreakeven, 1)} US$/bbl
                </span>
                . La serie histórica es ilustrativa.
              </p>
            </Surface>
          )}
        </div>
      </section>

      {/* 04 · Operadores principales · petróleo */}
      <section aria-label="Operadores principales de petróleo" className="mt-14">
        <SectionLabel index="04" title="Operadores principales · petróleo" note={VM.dataDate} />
        <div className="mt-5">
          {vacio ? (
            <EmptyState
              kind="empty"
              title="Sin operadores"
              detail="No hay producción por operadora para mostrar."
            />
          ) : (
            <Surface variant="flat">
              <ProportionBarList items={oilItems} />
            </Surface>
          )}
        </div>
      </section>

      {/* 05 · Argentina en el mundo */}
      <section aria-label="Argentina en el mundo" className="mt-14">
        <SectionLabel index="05" title="Argentina en el mundo" note="EIA · 2025" />
        <div className="mt-5">
          {vacio ? (
            <EmptyState
              kind="empty"
              title="Sin ranking mundial"
              detail="No hay datos de producción por país para mostrar."
            />
          ) : (
            <Surface variant="flat">
              <ProportionBarList items={worldItems} />
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                <span className="text-secondary">
                  Proyectado 2030:{' '}
                  <span className="tnums font-medium text-body">
                    #{WORLD_OIL.projectedRank} · {formatInteger(WORLD_OIL.projectedKbbld)} mil
                    bbl/d
                  </span>
                </span>
                <Badge tone="positive">
                  +{WORLD_OIL.todayRank - WORLD_OIL.projectedRank} puestos
                </Badge>
              </div>
            </Surface>
          )}
        </div>
      </section>

      {/* 06 · Proyectos RIGI de petróleo y gas */}
      <section aria-label="Proyectos RIGI de petróleo y gas" className="mt-14">
        <SectionLabel
          index="06"
          title="Proyectos RIGI de petróleo y gas"
          note={`US$ ${formatDecimal(RIGI.totalBUSD, 1)} B COMPROMETIDOS`}
        />
        <div className="mt-5">
          {vacio ? (
            <EmptyState
              kind="empty"
              title="Sin proyectos RIGI"
              detail="No hay proyectos aprobados para mostrar."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {RIGI.projects.map((p) => (
                <Surface key={p.name} variant="flat">
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone={p.kind === 'gas' ? 'gas' : 'oil'}>{p.kind}</Badge>
                    <span className="type-kpi text-[1.35rem]">
                      US$ {formatDecimal(p.busd, 1)} B
                    </span>
                  </div>
                  <p className="m-0 mt-3 font-medium text-body">{p.name}</p>
                  <p className="m-0 mt-1 type-label">{p.sponsor}</p>
                </Surface>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cierre */}
      <div className="mt-14">
        <Alert tone="info" title="Fuente de los datos">
          Datos reales de vacamuerta.io (2026-08-05); las series de los gráficos son
          ilustrativas.
        </Alert>
      </div>
    </div>
  )
}
