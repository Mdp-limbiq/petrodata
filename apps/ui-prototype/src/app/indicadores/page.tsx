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
import { SectionLabelNd } from './_components/SectionLabelNd'
import { DayValueCardEstrato } from './_components/DayValueCardEstrato'
import { KpiBento, type KpiViz } from './_components/KpiBento'
import { BreakevenTrend } from './_components/BreakevenTrend'
import { RampChart } from './_components/RampChart'
import { ActividadChart } from './_components/ActividadChart'
import { CruceChart } from './_components/CruceChart'
import { OperatorLeaderboard } from './_components/OperatorLeaderboard'
import { ContributionTable } from './_components/ContributionTable'
import { TransportInfra } from './_components/TransportInfra'
import { WorldStage } from './_components/WorldStage'

/* INDICADORES — copia 1:1 de vacamuerta.io/indicadores (pedido de Mariano,
   2026-08-07): misma estructura, mismos componentes, mismos tokens (nd-*),
   mismas fuentes tipográficas y datos reales scrapeados del sitio vivo.
   Punto de partida para el fine-tuning con Estrato. */

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
    <div className="nd-scope w-full flex-1 overflow-x-clip">
      {/* Hero — tipografía y marca Estrato (rombo oil, Inter Tight, Schibsted) */}
      <section className="container border-b border-nd-border pb-6 pt-8 md:pt-12">
        <span className="type-label-md flex items-center gap-2.5 !tracking-[0.14em]">
          <span
            aria-hidden
            className="nd-live-dot inline-block size-1.5 rotate-45"
            style={{ background: 'var(--data-oil)' }}
          />
          {t('eyebrow')}
        </span>
        <h1 className="type-h1 mt-3 text-balance">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-secondary [font-family:var(--font-schibsted)]">
          {t('blurb')}
        </p>
      </section>

      {/* Cuánto vale un día + qué es Vaca Muerta dentro del país —
          card única Estrato compacta (ancla | escenario + banda de foto) */}
      <section className="container pb-12 pt-8">
        <DayValueCardEstrato
          inputs={DAY_VALUE_INPUTS}
          oilSharePct={kpiValue('participacion_petroleo')}
          gasSharePct={kpiValue('participacion_gas')}
          wells={kpiValue('pozos_activos')}
        />
      </section>

      {/* Headline + nota de integridad — tipografía ESTRATO (Inter Tight
          para el titular, Schibsted para la nota; pedido de Mariano) */}
      <section className="container pb-10">
        <p className="type-display max-w-3xl text-pretty !text-[1.7rem] !leading-[1.25] md:!text-[2rem]">
          {HEADLINE}
        </p>
        {/* [font-family:…] explícito: dentro del scope nd el heredado es
            Helvetica; la nota va en Schibsted (cuerpo Estrato) */}
        <p className="mt-4 max-w-2xl text-pretty text-[11px] leading-relaxed text-tertiary [font-family:var(--font-schibsted)]">
          {NOTE}
        </p>
      </section>

      {/* La tesis en seis datos — bento oscuro Estrato */}
      <section className="container pb-16">
        <SectionLabelNd title={t('thesisLabel')} note={t('asOf', { month: ASOF })} />
        <KpiBento kpis={KPIS.filter((k) => k.id !== 'produccion_nacional')} viz={kpiViz} />
      </section>

      {/* 01 · Margen sobre el breakeven */}
      <section className="container pb-16">
        <SectionLabelNd index="01" title={t('breakevenTitle')} note="US$/BBL" />
        <div className="overflow-hidden rounded-[10px] border border-nd-border">
          <BreakevenTrend breakeven={BREAKEVEN} />
        </div>
      </section>

      {/* 02 · Rampa de producción */}
      <section className="container pb-16">
        <SectionLabelNd index="02" title={SERIE.title} note={SERIE.unit} />
        <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
          <RampChart points={SERIE.points} />
        </div>
      </section>

      {/* 03 · Actividad: pozos nuevos por mes */}
      <section className="container pb-16">
        <SectionLabelNd index="03" title={t('actividadTitle')} note={ACTIVIDAD.unit} />
        <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
          <ActividadChart actividad={ACTIVIDAD} />
        </div>
      </section>

      {/* 04 · Cruce agro vs energía */}
      <section className="container pb-16">
        <SectionLabelNd index="04" title={CRUCE.title} note={CRUCE.unit} />
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
          {t('cruceBlurb')}
        </p>
        <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
          <CruceChart cruce={CRUCE} />
        </div>
      </section>

      {/* 05 · Operadores principales */}
      <section className="container pb-16">
        <SectionLabelNd index="05" title={t('operatorsTitle')} />
        <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
          <OperatorLeaderboard operadores={OPERADORES} />
        </div>
      </section>

      {/* 06 · Contribución económica por operadora */}
      <section className="container pb-16">
        <SectionLabelNd index="06" title={t('contribution.title')} />
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
          {t('contribution.blurb')}
        </p>
        <div className="rounded-[10px] border border-nd-border bg-nd-surface p-5 md:p-6">
          <ContributionTable data={CONTRIBUTION} />
        </div>
      </section>

      {/* 07 · Infraestructura de transporte */}
      <section className="container pb-16">
        <SectionLabelNd index="07" title={t('transportTitle')} />
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
          {t('transportBlurb')}
        </p>
        <TransportInfra />
      </section>

      {/* 08 · Argentina en el mundo */}
      <section className="container pb-16">
        <SectionLabelNd index="08" title={t('worldTitle')} />
        <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-nd-text-secondary font-sans">
          {t('worldBlurb')}
        </p>
        <WorldStage mundo={MUNDO} />
      </section>

      {/* Banda CTA */}
      <section className="border-t border-nd-border bg-nd-surface">
        <div className="container flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            {/* tipografía Estrato: Inter Tight display + Schibsted cuerpo */}
            <h2 className="type-display max-w-3xl text-balance !text-[1.5rem] !leading-[1.25] md:!text-[1.75rem]">
              {t('ctaTitle')}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-secondary [font-family:var(--font-schibsted)]">
              {t('ctaBody')}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <a
              href="mailto:info@vacamuerta.io?subject=Inversiones%20Vaca%20Muerta"
              className="inline-flex w-fit items-center gap-2 rounded-[8px] bg-nd-text-display px-5 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-nd-surface transition-opacity hover:opacity-80"
            >
              {t('ctaContact')} →
            </a>
            <div>
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-nd-text-disabled">
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
