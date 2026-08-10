import type { ReactNode } from 'react'
import { SectionLabel } from '@/ui/section-label'

/* Sección de Indicadores — receta única de las 13 secciones de la página:
   contenedor 80rem, SectionLabel (índice opcional + nota), blurb corto en
   secondary y el contenido. card=true envuelve el contenido en la card
   clara estándar (secciones 01–07); 08–12 traen su propia card. */
export function Section({
  index,
  title,
  note,
  blurb,
  card = false,
  children,
}: {
  index?: string
  title: string
  note?: string
  blurb: string
  card?: boolean
  children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-[80rem] px-4 md:px-8 pb-16">
      <div className="mb-3">
        <SectionLabel index={index} title={title} note={note} />
      </div>
      <p className="mb-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary">
        {blurb}
      </p>
      {card ? (
        <div className="rounded-[10px] border bg-surface p-5 md:p-6">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}
