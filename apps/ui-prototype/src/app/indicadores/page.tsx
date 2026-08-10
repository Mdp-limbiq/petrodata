import type { Metadata } from 'next'
import { FooterNewsletterForm } from '@/ui/shell/FooterNewsletterForm'
import {
  ASOF,
  BREAKEVEN,
  CONTRIBUTION,
  CRUCE,
  DAY_VALUE_INPUTS,
  HEADLINE,
  KPIS,
  MUNDO,
  NOTE,
  OPERADORES,
  SERIE,
  ACTIVIDAD,
} from '@/fixtures/inversiones'
import { useTranslations } from './_lib/messages'
import { SectionLabel } from '@/ui/section-label'
import { DayValueCardEstrato } from './_components/DayValueCardEstrato'
import { KpiBento, type KpiViz } from './_components/KpiBento'
import { BreakevenTrend } from './_components/BreakevenTrend'
import { RampChart } from './_components/RampChart'
import { ActividadChart } from './_components/ActividadChart'
import { CruceChart } from './_components/CruceChart'
import { OperatorLeaderboard } from './_components/OperatorLeaderboard'
import { ContributionTable } from './_components/ContributionTable'
import { TransportInfra } from './_components/TransportInfra'
import {
  ImpactoPanel,
  PoliticaMacro,
  RigiSection,
  WorldGrowth,
  WorldRankings,
} from './_components/WorldStage'

/* INDICADORES — nació como copia 1:1 de vacamuerta.io/indicadores (datos
   reales scrapeados 2026-08-07) y fue fine-tuneada sección por sección con
   Mariano hasta quedar 100% en el design system ESTRATO: tokens de color,
   Inter Tight para display/cifras, Schibsted para cuerpo/labels, cards con
   ancla animada + tooltips oscuros, y semántica oil/gas/status. */

export const metadata: Metadata = {
  title: 'Indicadores',
  description:
    'La oportunidad de Vaca Muerta en números: cada cifra se computa a partir de datos oficiales de producción y exportación, con su fuente y fecha de corte.',
}

export default function IndicadoresPage() {
  const t = useTranslations('indicadores')

  const kpiValue = (id: string): number | null =>
    KPIS.find((k) => k.id === id)?.figure.value ?? null

  /* Mini-viz del bento — todas series REALES ya scrapeadas (nada simulado):
     rampa de producción, actividad de pozos, exportaciones de energía del
     cruce y el flip del superávit desde los charts de política. */
  const superavitSerie = MUNDO.politica?.charts.find((c) => c.id === 'superavit_energia')
  const kpiViz: Record<string, KpiViz> = {
    produccion_vm: {
      kind: 'area',
      color: 'var(--data-oil)',
      data: SERIE.points.map((p) => ({ x: p.period, y: p.oilBblD })),
    },
    participacion_petroleo: { kind: 'share', color: 'var(--data-oil)' },
    participacion_gas: { kind: 'share', color: 'var(--data-gas)' },
    pozos_activos: {
      kind: 'bars',
      color: 'rgba(255,255,255,0.8)',
      data: ACTIVIDAD.points.map((p) => ({ x: p.period, y: p.nuevosPozos })),
    },
    exportaciones_energia: {
      kind: 'line',
      color: '#2fe0a4',
      data: CRUCE.points
        .filter((p) => p.energiaUsd != null)
        .slice(-20)
        .map((p) => ({ x: p.period, y: p.energiaUsd as number })),
    },
    ...(superavitSerie
      ? {
          superavit_energia: {
            kind: 'signed-bars' as const,
            color: '#2fe0a4',
            data: superavitSerie.points.map((p) => ({ x: p.period, y: p.value })),
          },
        }
      : {}),
  }

  return (
    <div className="w-full flex-1 overflow-x-clip">
      {/* Hero — tipografía y marca Estrato (rombo oil, Inter Tight, Schibsted) */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 border-b pb-6 pt-8 md:pt-12">
        <span className="type-label-md flex items-center gap-2.5 !tracking-[0.14em]">
          <span
            aria-hidden
            className="live-dot inline-block size-1.5 rotate-45"
            style={{ background: 'var(--data-oil)' }}
          />
          {t('eyebrow')}
        </span>
        <h1 className="type-h1 mt-3 text-balance">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('blurb')}
        </p>
      </section>

      {/* Cuánto vale un día + qué es Vaca Muerta dentro del país —
          card única Estrato compacta (ancla | escenario + banda de foto) */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-12 pt-8">
        <DayValueCardEstrato
          inputs={DAY_VALUE_INPUTS}
          oilSharePct={kpiValue('participacion_petroleo')}
          gasSharePct={kpiValue('participacion_gas')}
          wells={kpiValue('pozos_activos')}
        />
      </section>

      {/* Headline + nota de integridad — tipografía ESTRATO (Inter Tight
          para el titular, Schibsted para la nota; pedido de Mariano) */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-10">
        <p className="type-display max-w-3xl text-pretty !text-[1.7rem] !leading-[1.25] md:!text-[2rem]">
          {HEADLINE}
        </p>
        <p className="mt-4 max-w-2xl text-pretty text-[11px] leading-relaxed text-tertiary">
          {NOTE}
        </p>
      </section>

      {/* La tesis en seis datos — bento oscuro Estrato */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel title={t('thesisLabel')} note={t('asOf', { month: ASOF })} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('thesisBlurb')}
        </p>
        <KpiBento kpis={KPIS.filter((k) => k.id !== 'produccion_nacional')} viz={kpiViz} />
      </section>

      {/* 01 · Margen sobre el breakeven */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="01" title={t('breakevenTitle')} note="US$/BBL" />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('breakevenBlurb')}
        </p>
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <BreakevenTrend breakeven={BREAKEVEN} />
        </div>
      </section>

      {/* 02 · Rampa de producción */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="02" title={SERIE.title} note={SERIE.unit} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('serieBlurb')}
        </p>
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <RampChart points={SERIE.points} />
        </div>
      </section>

      {/* 03 · Actividad: pozos nuevos por mes */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="03" title={t('actividadTitle')} note={ACTIVIDAD.unit} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('actividadBlurb')}
        </p>
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <ActividadChart actividad={ACTIVIDAD} />
        </div>
      </section>

      {/* 04 · Cruce agro vs energía */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="04" title={CRUCE.title} note={CRUCE.unit} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('cruceBlurb')}
        </p>
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <CruceChart cruce={CRUCE} />
        </div>
      </section>

      {/* 05 · Operadores principales */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="05" title={t('operatorsTitle')} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('operatorsBlurb')}
        </p>
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <OperatorLeaderboard operadores={OPERADORES} />
        </div>
      </section>

      {/* 06 · Contribución económica por operadora */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="06" title={t('contribution.title')} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('contribution.blurb')}
        </p>
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <ContributionTable data={CONTRIBUTION} />
        </div>
      </section>

      {/* 07 · Infraestructura de transporte */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="07" title={t('transportTitle')} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('transportBlurb')}
        </p>
        {/* una sola card: encabezado de datos + barras (composición del 06) */}
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">
          <TransportInfra />
        </div>
      </section>

      {/* 08 · Argentina en el mundo — rankings EIA (hoy vs proyectado) */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel
            index="08"
            title={t('worldTitle')}
            note={MUNDO.rankings[0] ? `EIA · ${MUNDO.rankings[0].year}` : undefined}
          />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('worldBlurb')}
        </p>
        <WorldRankings mundo={MUNDO} />
      </section>

      {/* 09 · Productores de mayor crecimiento */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel
            index="09"
            title={t('growthTitle')}
            note={
              MUNDO.fastestGrowing[0]
                ? `${MUNDO.fastestGrowing[0].sinceYear}–${MUNDO.fastestGrowing[0].toYear}`
                : undefined
            }
          />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('growthSectionBlurb')}
        </p>
        <WorldGrowth mundo={MUNDO} />
      </section>

      {/* 10 · Política económica — narrativa + charts macro + palancas */}
      <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
        <div className="mb-3">
          <SectionLabel index="10" title={t('politicaTitle')} />
        </div>
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
          {t('politicaBlurb')}
        </p>
        <PoliticaMacro politica={MUNDO.politica} />
      </section>

      {/* 11 · RIGI — inversión comprometida (dataset propio) */}
      {MUNDO.politica?.rigi && MUNDO.politica.rigi.projects.length > 0 && (
        <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
          <div className="mb-3">
            <SectionLabel
              index="11"
              title={t('rigiTitle')}
              note={`${MUNDO.politica.rigi.count} proyectos · US$ ${(
                MUNDO.politica.rigi.totalMusd / 1000
              ).toLocaleString('es-AR', { maximumFractionDigits: 1 })} B`}
            />
          </div>
          <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
            {t('rigiBlurb')}
          </p>
          <RigiSection rigi={MUNDO.politica.rigi} />
        </section>
      )}

      {/* 12 · Impacto proyectado — el cierre antes del CTA */}
      {MUNDO.politica?.impacto && (
        <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
          <div className="mb-3">
            <SectionLabel
              index="12"
              title={t('impactoTitle')}
              note={MUNDO.rankings[0] ? String(MUNDO.rankings[0].projected.year) : undefined}
            />
          </div>
          <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
            {t('impactoBlurb')}
          </p>
          <ImpactoPanel impacto={MUNDO.politica.impacto} />
        </section>
      )}

      {/* Banda CTA */}
      <section className="border-t bg-surface">
        <div className="mx-auto max-w-[80rem] px-4 md:px-8 flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            {/* tipografía Estrato: Inter Tight display + Schibsted cuerpo */}
            <h2 className="type-display max-w-3xl text-balance !text-[1.5rem] !leading-[1.25] md:!text-[1.75rem]">
              {t('ctaTitle')}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-secondary">
              {t('ctaBody')}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <a
              href="mailto:info@vacamuerta.io?subject=Inversiones%20Vaca%20Muerta"
              className="inline-flex w-fit items-center gap-2 rounded-[8px] bg-inverse px-5 py-2.5 text-xs uppercase tracking-[var(--tracking-label)] text-on-dark transition-opacity hover:opacity-80"
            >
              {t('ctaContact')} →
            </a>
            <div>
              <span className="type-label mb-2 block">
                {t('ctaNewsletter')}
              </span>
              <FooterNewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
