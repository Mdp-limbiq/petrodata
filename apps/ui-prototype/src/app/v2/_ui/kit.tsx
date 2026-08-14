import type { ReactNode } from 'react'
import { formatDelta } from '@/lib/format'

/* Kit del sistema V2. Las piezas son las mismas que tiene el producto —dato,
   ranking, tabla, fila— pero compuestas como pide el sistema medido, no como
   las teníamos.

   Las dos reglas que gobiernan todo lo de acá:
   · La jerarquía es peso y tinta, nunca tamaño. Nada pasa de 21px.
   · Los planos se separan con un anillo de 1px, nunca con sombra difusa. */

/** Cabecera de sección: número, título y descripción en UNA línea alineada
    por línea de base. Es lo que permite repetir la plantilla sin que se lea
    como un formulario: la sección gasta un renglón en presentarse. */
export function Seccion({
  n,
  titulo,
  desc,
  children,
  ancho = 'marco',
}: {
  n: string
  titulo: string
  desc: string
  children: ReactNode
  /** 'marco' envuelve en el contenedor de 14px; 'suelto' lo deja al aire */
  ancho?: 'marco' | 'suelto'
}) {
  return (
    <section className="s-seccion" id={`s${n}`}>
      <header className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="s-mono shrink-0 text-[11px]" style={{ color: 'var(--ink-3)' }}>
          {n}
        </span>
        <h2 className="s-titulo m-0 whitespace-nowrap">{titulo}</h2>
        <p className="s-desc s-desc-trunca m-0 min-w-0 flex-1">{desc}</p>
      </header>
      {ancho === 'marco' ? <div className="s-marco">{children}</div> : children}
    </section>
  )
}

/** Dato: rótulo, cifra, unidad y variación. La cifra manda por peso, no por
    tamaño — 21px la principal, 16px las de apoyo. */
export function Dato({
  rotulo,
  valor,
  unidad,
  delta = null,
  nota,
  grande = false,
}: {
  rotulo: string
  valor: string
  unidad?: string
  delta?: number | null
  nota?: string
  grande?: boolean
}) {
  const d = formatDelta(delta)
  return (
    <div className="min-w-0">
      <p className="s-etq m-0">{rotulo}</p>
      <p className="m-0 mt-1 flex items-baseline gap-1.5">
        <span className={grande ? 's-cifra' : 's-cifra-sm'}>{valor}</span>
        {unidad && (
          <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
            {unidad}
          </span>
        )}
      </p>
      {(nota || d) && (
        <p className="s-micro m-0 mt-1 flex items-center gap-1.5">
          {d && (
            <span className={d.dir === 'up' ? 's-sube' : 's-baja'}>
              {d.arrow} {d.label}
            </span>
          )}
          {nota && <span style={{ color: 'var(--ink-3)' }}>{nota}</span>}
        </p>
      )}
    </div>
  )
}

/** Fila de ranking: rango en mono, nombre, valor a la derecha y barra fina.
    La barra va neutra y sólo el líder toma el acento — el acento es para
    detalles, nunca para llenar superficies. */
export function FilaRanking({
  n,
  nombre,
  valor,
  pct,
  lider = false,
  nota,
}: {
  n: number
  nombre: string
  valor: string
  /** 0..1 — proporción sobre el máximo de la lista */
  pct: number
  lider?: boolean
  nota?: string
}) {
  /* La barra va en su PROPIA columna, no debajo del nombre: pegada al texto
     se lee como un subrayado y no como una magnitud. Y el riel se dibuja
     siempre —aunque el valor sea chico— para que se entienda que hay una
     escala detrás. */
  return (
    <div className="s-fila s-fila-hover">
      <span className="s-mono w-5 shrink-0 text-[11px]" style={{ color: 'var(--ink-3)' }}>
        {String(n).padStart(2, '0')}
      </span>
      <span className="min-w-0 flex-1">
        <span className="s-cuerpo block truncate font-medium">{nombre}</span>
        {nota && (
          <span className="s-micro mt-0.5 block truncate" style={{ color: 'var(--ink-2)' }}>
            {nota}
          </span>
        )}
      </span>
      <span
        className={`s-barra hidden w-16 shrink-0 sm:block ${lider ? 's-barra--lider' : ''}`}
        aria-hidden
      >
        <i style={{ width: `${Math.max(3, pct * 100)}%` }} />
      </span>
      <span className="s-num w-16 shrink-0 text-right text-[13px] font-medium">{valor}</span>
    </div>
  )
}

/** Fila simple de lectura: etiqueta a la izquierda, valor a la derecha. */
export function FilaDato({
  etiqueta,
  valor,
  delta = null,
  unidad,
}: {
  etiqueta: string
  valor: string
  delta?: number | null
  unidad?: string
}) {
  const d = formatDelta(delta)
  return (
    <div className="s-fila s-fila-hover">
      <span className="s-etq min-w-0 flex-1 truncate">{etiqueta}</span>
      <span className="flex shrink-0 items-baseline gap-1.5">
        <span className="s-num text-[13px] font-medium">{valor}</span>
        {unidad && (
          <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
            {unidad}
          </span>
        )}
      </span>
      {d && (
        <span className={`s-micro s-num w-14 shrink-0 text-right ${d.dir === 'up' ? 's-sube' : 's-baja'}`}>
          {d.arrow} {d.label}
        </span>
      )}
    </div>
  )
}

/** Card: el plano que sostiene contenido. Anillo de 1px, nunca sombra. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`s-card ${className}`}>{children}</div>
}

/** Cabecera de card: rótulo a la izquierda, apunte a la derecha. */
export function CardHead({ titulo, nota }: { titulo: string; nota?: string }) {
  return (
    <div
      className="flex items-baseline justify-between gap-3 border-b px-3 py-2.5"
      style={{ borderColor: 'var(--line)' }}
    >
      <span className="s-etq">{titulo}</span>
      {nota && <span className="s-micro s-num" style={{ color: 'var(--ink-3)' }}>{nota}</span>}
    </div>
  )
}

export function Chip({
  tono = 'neutro',
  children,
}: {
  tono?: 'ok' | 'warn' | 'bad' | 'info' | 'neutro'
  children: ReactNode
}) {
  return <span className={`s-chip s-chip--${tono}`}>{children}</span>
}

/** Pie de sección: la línea de contexto que cierra. Va en ink-2 y no en la
    tinta más tenue — es una aclaración que hay que poder leer, y la regla del
    proyecto (SISTEMA.md §10.1) reserva ink-3 para metadata pura. */
export function Pie({ children }: { children: ReactNode }) {
  return (
    <p className="s-micro m-0 mt-2.5" style={{ color: 'var(--ink-2)' }}>
      {children}
    </p>
  )
}
