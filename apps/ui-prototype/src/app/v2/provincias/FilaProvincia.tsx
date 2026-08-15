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
   con las piezas del sistema: la descripción, cuatro lecturas y las operadoras
   que trabajan ahí.

   La MISMA fila sirve para las dos listas de la página. Antes "Perfil
   exportador" tenía su propia pieza y no coincidía en nada con esta: 60px de
   alto contra 40, dos renglones contra uno, sin el tag de cuenca, y las cinco
   columnas corridas entre 24 y 28px. Eran dos listas de las mismas once
   provincias, una debajo de la otra, con geometrías distintas.

   Por eso la cifra de cabecera y la proporción de la barra entran por prop: la
   fila no sabe si la están ordenando por pozos o por exportaciones. Lo único
   que cambia entre listas es qué número muestra y si trae la columna de
   movimiento. */

export function FilaProvincia({
  p,
  n,
  valor,
  pct,
  lider,
  delta,
  tagColor,
  operadoras,
  pctPozos,
  puestoExpo,
  totalProvincias,
  serie,
  meses,
}: {
  p: Province
  n: number
  /** cifra de cabecera de ESTA lista, ya formateada: pozos en una, MUSD en la
      otra. La fila es la misma pieza en las dos y no sabe cuál está mirando. */
  valor: string
  /** 0..1 sobre el máximo de la lista */
  pct: number
  lider: boolean
  /** puestos que se mueve respecto del otro ranking de la página. Sin valor,
      la columna no se dibuja. */
  delta?: number
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
  /** doce meses de producción de petróleo, bbl/d. Ver serieProvincia(). */
  serie: number[]
  /** rótulo de cada uno de esos doce meses, ya formateado */
  meses: string[]
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
        {/* El delta va pegado al puesto porque es del PUESTO: al final de la
            fila, contra la cifra, se leería como una variación de la cifra.
            Ancho fijo aunque esté vacío —cinco de las once no se mueven— para
            que los nombres no arranquen en x distintas. El cero no se dibuja:
            un "0" verde o rojo sería color sin significado. */}
        {delta !== undefined && (
          <span
            className={`shrink-0 text-right ${
              delta === 0 ? '' : delta > 0 ? 's-delta s-delta--sube' : 's-delta s-delta--baja'
            }`}
            style={{ width: 18 }}
          >
            {delta === 0 ? '' : delta > 0 ? `+${delta}` : `\u2212${Math.abs(delta)}`}
          </span>
        )}
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
        {/* 40px abajo de sm y 64 arriba. El número más ancho de las dos listas
            mide 37 (medido con un Range sobre las once filas de cada una), así
            que arriba sobra aire de propósito y abajo se le da lo justo: a 375
            esos píxeles los necesita el nombre de la provincia. */}
        <span className="s-num w-10 shrink-0 text-right text-[13px] font-medium sm:w-16">
          {valor}
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
          {/* El riel tiene que caer en el centro de la pastilla, y la pastilla
              se corre cuando la lista trae columna de movimiento. Se calcula en
              vez de quedar fijo en 59:

                12 de padding + 20 del rango + 10 de gap
                (+ 18 del delta + 10 de gap, si lo hay)
                + 10 de media pastilla = 52 u 80

              y el contenido arranca 7px a la derecha del riel, que es la
              separación medida en la referencia. */}
          <div style={{ padding: `2px 12px 12px ${(delta === undefined ? 52 : 80) + 7}px` }}>
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
              {/* La historia de producción. Va acá y no al final porque es la
                  otra cara del renglón de arriba: cuántos pozos hay y cuánto
                  sacan.

                  Doce meses y no veinticuatro: la serie nacional tiene 24, pero
                  a 3px por barra son 118px de ancho contra 58, y adentro de un
                  renglón de 28 la diferencia decide si el paso envuelve o no.
                  Doce es además la ventana que ya usa el dashboard.

                  El badge dice la ventana y NO la variación del período. La
                  tenía puesta y la saqué: con la serie inventada, los doce
                  meses daban desde −11,4% hasta +80,0% según la provincia, y un
                  "+80,0% en 12 meses" en un badge se lee como un hallazgo. La
                  cifra del mes de corte al menos es proporcional a los pozos,
                  que son reales; el delta no se apoya en nada. La variación
                  mensual real que sí publica el sitio es nacional, no por
                  provincia. */}
              <Paso
                icono="produccion"
                rotulo="Producción"
                unidad="bbl/d"
                serie={serie}
                meses={meses}
                badges={[]}
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

              {/* "Operadoras" y no "Top 3 operadoras": el rótulo prometía tres y
                  el fixture sólo las tiene cargadas para cinco provincias —y
                  con tres solamente en Neuquén—. Santa Cruz, Chubut y Mendoza
                  mostraban UNA sola debajo de un título que anunciaba un
                  ranking de tres. El campo está declarado como "operadoras
                  destacadas (ilustrativo)": nunca pretendió ser el listado
                  completo ni un top-N.

                  Y la fila se muestra SIEMPRE, aunque no haya dato. Ocultarla
                  hacía que la ausencia se leyera como "esta provincia no tiene
                  operadoras", que es falso: La Pampa tiene 272 pozos activos.
                  Con el badge de "Sin dato" la ausencia se lee como lo que es,
                  un hueco nuestro. No se puede completar desde otro lado: el
                  fixture de pozos cubre sólo la Neuquina. */}
              <Paso
                icono="operadora"
                rotulo="Operadoras"
                badges={operadoras.length > 0 ? operadoras.slice(0, 3) : ['Sin dato']}
              />
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
  serie,
  meses,
  badges,
}: {
  icono: 'pozo' | 'expo' | 'operadora' | 'produccion'
  rotulo: string
  valor?: string
  unidad?: string
  /** si viene, se dibuja la serie compacta entre la unidad y los badges, y el
      paso pasa a manejar él la cifra y el badge: al pasar el mouse por un mes
      muestra ESE mes en vez del de corte */
  serie?: number[]
  /** rótulo de cada mes de la serie, ya formateado */
  meses?: string[]
  /** todo lo secundario del paso, cada cosa en su badge */
  badges: string[]
}) {
  const [mes, setMes] = useState<number | null>(null)

  /* Con serie, la cifra y el badge los decide el hover: sin hover, el mes de
     corte y la ventana; con hover, el mes señalado y su rótulo. */
  const i = serie ? (mes ?? serie.length - 1) : -1
  const cifra = serie ? formatInteger(serie[i]) : valor
  const rotulos = serie && meses ? [mes === null ? '12 meses' : meses[mes]] : badges

  /* La cifra más ancha de la serie, para reservarle el lugar. Sin esto el
     número cambia de ancho al pasar de mes —"12.246" contra "8.123" en La
     Pampa— y le empuja la serie y el badge en cada movimiento del mouse. */
  const reserva = serie
    ? serie.map((v) => formatInteger(v)).reduce((a, b) => (b.length > a.length ? b : a))
    : null

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
        {icono === 'produccion' && (
          <>
            <path d="M3 17l5.5-5.5 3.5 3.5L21 6" />
            <path d="M15 6h6v6" />
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
      {cifra &&
        (reserva ? (
          <span className="s-num grid shrink-0 text-[12.5px] font-medium">
            <span aria-hidden className="invisible" style={{ gridArea: '1 / 1' }}>
              {reserva}
            </span>
            <span style={{ gridArea: '1 / 1' }}>{cifra}</span>
          </span>
        ) : (
          <span className="s-num shrink-0 text-[12.5px] font-medium">{cifra}</span>
        ))}
      {unidad && (
        <span className="shrink-0 text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
          {unidad}
        </span>
      )}
      {/* Las barras se comparan DENTRO del rango de los doce meses y no desde
          cero: la serie va de 177k a 211k en Neuquén, así que desde cero las
          doce barras se verían iguales y la forma no diría nada. Queda
          declarado al pie de la sección, que es la única forma honesta.
          El piso de 15% es para que el mes más bajo siga siendo una barra y no
          un punto. */}
      {serie && serie.length > 0 && (
        /* aria-hidden y sin foco: son doce barras por fila y once filas, o sea
           132 paradas de tabulador para un dato que ya está escrito al lado en
           texto. El hover agrega, no reemplaza: sin mouse se lee el mes de
           corte igual. */
        <span className="s-serie" aria-hidden onMouseLeave={() => setMes(null)}>
          {(() => {
            const min = Math.min(...serie)
            const max = Math.max(...serie)
            return serie.map((v, k) => (
              <span key={k} onMouseEnter={() => setMes(k)}>
                <i
                  className={k === i ? 'on' : undefined}
                  style={{ height: `${15 + ((v - min) / (max - min || 1)) * 85}%` }}
                />
              </span>
            ))
          })()}
        </span>
      )}
      {/* Ninguno crece: si estiraran, el primero empujaría al resto contra el
          borde derecho de la card y quedarían flotando lejos de lo que anotan.
          Tampoco se recortan: .s-chip es inline-flex y ahí text-overflow no
          aplica sobre un nodo de texto suelto —el mismo problema que tenía el
          tag—, así que recortar habría sido cortar a hachazo. Bajan de renglón,
          que es lo que hace el paso desde que envuelve. */}
      {rotulos.map((b) => (
        <span key={b} className="s-chip s-chip--neutro s-chip--mini shrink-0">
          {b}
        </span>
      ))}
    </div>
  )
}
