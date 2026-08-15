'use client'

import { useId, useState } from 'react'
import { Marca, Tag } from '../_ui/kit'
import { formatDecimal, formatInteger } from '@/lib/format'
import type { Province } from '@/fixtures/provinces'

/* Fila de provincia que se despliega en el lugar, en vez de navegar a una
   página dedicada.

   El mecanismo es el MEDIDO de la sección "Thinking" de la referencia, que es
   su primitiva de traza expandible:

     <div class="grid transition-[grid-template-rows,opacity] duration-400"
          style="grid-template-rows: 0fr; opacity: 0">
       <div style="overflow:hidden"> … </div>
     </div>

   El truco del 0fr → 1fr sirve porque anima a una altura que no hay que
   conocer de antemano, cosa que un max-height no puede hacer sin inventar un
   número. El chevron rota 180° en 300ms, cien menos que el panel: llega antes
   y por eso el gesto se siente responder al clic y no arrastrarse.

   El contenido de adentro es el de la página de provincia del sitio, servido
   con las piezas del sistema: la descripción, tres lecturas y las operadoras
   que trabajan ahí. */

export function FilaProvincia({
  p,
  n,
  pct,
  lider,
  tagColor,
  operadoras,
  pctPozos,
  puestoExpo,
  totalProvincias,
}: {
  p: Province
  n: number
  /** 0..1 sobre el máximo de la lista */
  pct: number
  lider: boolean
  /** sin valor cuando la cuenca no es una cuenca; el tag va neutro */
  tagColor?: string
  /** nombres ya resueltos: una función no cruza de server a client component */
  operadoras: string[]
  /** porcentaje de los pozos del país que aporta la provincia */
  pctPozos: number
  /** puesto en el ranking de exportaciones. Sin valor en el Estado Nacional,
      que aparece en la lista pero no es una provincia y no tiene puesto. */
  puestoExpo?: number
  totalProvincias: number
}) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()

  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => setAbierta((v) => !v)}
        className="s-fila s-fila-hover w-full text-left"
        style={{ border: 0, borderBottom: 0, background: 'transparent', cursor: 'pointer' }}
      >
        <span className="s-mono w-5 shrink-0 text-[11px]" style={{ color: 'var(--ink-3)' }}>
          {String(n).padStart(2, '0')}
        </span>
        <Marca nombre={p.name} />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {/* shrink-0: el nombre no cede, cede el tag. Cabe siempre —el más
              largo mide 100 sobre una ranura de 137 a 375—. */}
          <span className="s-cuerpo max-w-full shrink-0 truncate font-medium">{p.name}</span>
          <Tag color={tagColor}>{p.basin}</Tag>
        </span>
        <span
          className={`s-barra hidden w-16 shrink-0 sm:block ${lider ? 's-barra--lider' : ''}`}
          aria-hidden
        >
          <i style={{ width: `${Math.max(3, pct * 100)}%` }} />
        </span>
        {/* 48px abajo de sm y 64 arriba. El número más ancho de la lista mide
            37 (medido con un Range sobre las once filas), así que los 64 fijos
            eran 27 de aire que a 375 le faltaban al nombre de la provincia. */}
        <span className="s-num w-12 shrink-0 text-right text-[13px] font-medium sm:w-16">
          {formatInteger(p.wells)}
        </span>
        {/* chevron: 14px con trazo 2,2 — el mismo de la traza expandible de la
            referencia. Rota en 300ms, cien menos que el panel. */}
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          style={{
            transform: abierta ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 300ms var(--ease-in-out)',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={id}
        className="grid"
        style={{
          gridTemplateRows: abierta ? '1fr' : '0fr',
          opacity: abierta ? 1 : 0,
          transition: 'grid-template-rows 400ms var(--ease-in-out), opacity 400ms var(--ease-in-out)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          {/* El contenido arranca en 59, que deja el riel en 52: el centro
              exacto de la pastilla de la fila (12 de padding + 20 del rango +
              10 de gap + 10 de media pastilla). */}
          <div style={{ padding: '2px 12px 12px 59px' }}>
            {/* Todo cuelga como hijo DIRECTO del riel, sin envolver nada en un
                contenedor: si no, el codo se engancharía al contenedor y habría
                un solo codo para los cuatro. */}
            <div className="s-rama flex flex-col gap-1">
              {/* La descripción también cuelga del riel. Estuvo suelta un rato
                  —es prosa que presenta el desglose, no un ítem del desglose— y
                  ahí arrancaba en 65 sin alinearse con nada: el nombre de la
                  provincia está en 72 y los íconos de los pasos en 65.

                  Usar la caja del paso arregla las dos cosas: su ícono cae en
                  la columna de íconos (65) y su texto en la de rótulos (87), y
                  con el codo queda enganchada a lo mismo que el resto. Lo que
                  la sigue separando de un paso es la tipografía: prosa con
                  interlínea holgada, sin cifra y sin badges.

                  El ícono va arriba y no centrado —la prosa envuelve— con 3px
                  de corrección para quedar a media altura del primer renglón
                  (20,3 de interlínea contra 14 de ícono). El codo lo sigue
                  hasta ahí: ver .s-paso--intro en sistema.css. */}
              <div className="s-paso s-paso--intro">
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-[3px] shrink-0"
                  style={{ color: 'var(--ink-3)' }}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11.5v4.5" />
                  <path d="M12 8h.01" />
                </svg>
                {/* 12,5 con interlínea holgada e ink-2: es la receta MEDIDA de
                    la prosa adentro de una card de la referencia
                    (p.px-3.pt-2.pb-1.text-[12.5px].leading-relaxed.text-ink-2). */}
                <p
                  className="m-0 min-w-0 flex-1 text-[12.5px] leading-relaxed"
                  style={{ color: 'var(--ink-2)', textWrap: 'pretty' }}
                >
                  {p.blurb}
                </p>
              </div>

              {/* Sin puesto: el ranking de pozos es el orden de esta misma
                  lista, así que el puesto ya está impreso a la izquierda de la
                  fila. Repetirlo abajo era decir dos veces lo mismo. */}
              <Paso
                icono="pozo"
                rotulo="Pozos activos"
                valor={formatInteger(p.wells)}
                badges={[`${formatDecimal(pctPozos, 1)}% del país`]}
              />
              {/* Acá sí: el orden por exportaciones NO es el de esta lista y no
                  se ve en ningún otro lado de la sección. Escrito como puesto
                  ordinal y no como "04 de 10", que no decía qué era. */}
              <Paso
                icono="expo"
                rotulo="Exportaciones"
                valor={formatInteger(p.exportsMUSD)}
                unidad="MUSD"
                badges={[
                  `${formatDecimal(p.expSharePct, 1)}% nacional`,
                  ...(puestoExpo ? [`${puestoExpo}ª de ${totalProvincias} provincias`] : []),
                ]}
              />

              {/* "Top 3" y no "Operan": el fixture marca estas operadoras como
                  destacadas e ilustrativas, no como la lista completa. Decir
                  "Operan" afirmaba algo que el dato no sostiene.

                  El corte en tres es legítimo: el fixture las trae en el orden
                  del ranking por BOE, así que los primeros tres SON los tres
                  primeros. Las provincias con menos muestran las que tienen,
                  que es como se comporta cualquier top-N cuando el conjunto es
                  más chico.

                  Cada operadora es su propio badge, igual que el porcentaje y
                  el puesto de las otras dos filas: el badge es el tratamiento
                  de todo lo secundario del paso, no la excepción de una fila.
                  Cuando eran texto corrido separado por puntos medios, las tres
                  filas anotaban con formas distintas. */}
              {operadoras.length > 0 && (
                <Paso
                  icono="operadora"
                  rotulo="Top 3 operadoras"
                  badges={operadoras.slice(0, 3)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Paso: la fila del riel, con la escala MEDIDA en la traza de la referencia.

   Allá son tres ranuras —ícono 14, texto flexible de 12,5/500 en tinta plena
   y un detalle de 11,5/400 en ink-3, tipo "6 flavors"—. Acá la ranura del
   medio se abre en rótulo y cifra, que es lo que pide una fila de dato: el
   rótulo baja a ink-2 y la cifra se queda con el peso 500 y la tinta plena,
   porque la cifra es el punto de la línea. Es jerarquía por peso y tinta, que
   es la única que el sistema permite.

   Sin caja, sin anillo y sin fondo: ver el comentario de .s-paso. */
function Paso({
  icono,
  rotulo,
  valor,
  unidad,
  badges,
}: {
  icono: 'pozo' | 'expo' | 'operadora'
  rotulo: string
  valor?: string
  unidad?: string
  /** todo lo secundario del paso, cada cosa en su badge */
  badges: string[]
}) {
  return (
    <div className="s-paso">
      {/* Ícono y no un punto de color: un círculo de color sin significado
          contradice la regla del sistema —el color significa algo— y además
          la referencia usa íconos de trazo, no manchas. */}
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        style={{ color: 'var(--ink-3)' }}
      >
        {icono === 'pozo' && (
          <>
            <path d="M12 21V8" />
            <path d="M7 21h10" />
            <path d="m8 8 4-5 4 5" />
          </>
        )}
        {icono === 'expo' && (
          <>
            <path d="M4 20h16" />
            <path d="M7 16V9" />
            <path d="M12 16V5" />
            <path d="M17 16v-4" />
          </>
        )}
        {icono === 'operadora' && (
          <>
            <path d="M4 21V8l8-5 8 5v13" />
            <path d="M3 21h18" />
            <path d="M10 21v-5h4v5" />
          </>
        )}
      </svg>
      {/* El rótulo cede DESPUÉS que la nota y antes de desbordar. A 375 las
          partes fijas del paso de exportaciones sumaban 260 en 240 de ancho:
          la nota ya colapsaba a cero —es la flexible— pero el resto no entraba
          y la fila se desbordaba 26px. Con esto la nota se va primero, que es
          lo correcto, y recién después el rótulo recorta. */}
      <span className="min-w-0 truncate text-[12.5px]" style={{ color: 'var(--ink-2)' }}>
        {rotulo}
      </span>
      {valor && <span className="s-num shrink-0 text-[12.5px] font-medium">{valor}</span>}
      {unidad && (
        <span className="shrink-0 text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
          {unidad}
        </span>
      )}
      {/* Ninguno crece: si estiraran, el primero empujaría al resto contra el
          borde derecho de la card y quedarían flotando lejos de lo que anotan.
          Tampoco se recortan: .s-chip es inline-flex y ahí text-overflow no
          aplica sobre un nodo de texto suelto —el mismo problema que tenía el
          tag—, así que recortar habría sido cortar a hachazo. Bajan de renglón,
          que es lo que hace el paso desde que envuelve. */}
      {badges.map((b) => (
        <span key={b} className="s-chip s-chip--neutro s-chip--mini shrink-0">
          {b}
        </span>
      ))}
    </div>
  )
}
