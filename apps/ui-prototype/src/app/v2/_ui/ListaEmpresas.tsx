'use client'

import { useId, useMemo, useState } from 'react'
import { Icono, PATH } from './iconos'
import { LogoEmpresa } from './LogoEmpresa'

/* LISTA FILTRABLE — la Filter Table (§13) con el buscador de la §15 y un
   desglose por fila.

   Nadie lee 52 filas: busca una, o mira un grupo. Antes acá vivía la Records
   Table (§12) completa, que es la otra receta que el catálogo tiene para una
   tabla larga. Se cambió por ésta (pedido de Mariano, 2026-08-17) y el motivo
   es sano: la §12 trae selección con checkbox, y la selección sólo significa
   algo si hay acciones que aplicarle. Acá no las hay, así que era una casilla
   que se marca y no pasa nada. La §13 no promete nada que no cumpla.

   Lo que se gana de paso es la única animación ESTRUCTURAL del sistema:
   `grid-template-rows: 1fr → 0fr`, que es cómo se anima una altura `auto`. La
   usa dos veces: al filtrar, para que las filas que salen se colapsen en vez de
   desaparecer de un frame al otro, y al clickear una fila, para abrir su ficha.

   La ficha es la opción C de las cinco que se probaron en
   design-research/beautifului-dev/empresa-card-5.html: placa de logo a la
   izquierda, reseña y cinco renglones etiqueta→valor. Ahí vivía en su propia
   card; acá cuelga de la fila, que es donde tiene más sentido — la tabla da el
   panorama y la ficha, el detalle de la que te interesa.

   Todo llega ya formateado desde el servidor —los `*_n` son sólo para
   comparar— por la razón de siempre: una función de formato no cruza el
   límite de servidor a cliente. */

export type FilaEmpresa = {
  slug: string
  nombre: string
  /** clave del grupo al que pertenece, para los filtros */
  grupo: string
  /** true si cotiza; es un filtro que cruza a los otros */
  cotiza: boolean
  /** ya formateado, p. ej. "34,2%" */
  nacional: string
  nacional_n: number
  /** rótulo del fluido; sin color, se lee como sin dato. `razon` es la
      relación valor/volumen de la que sale el rótulo, y es lo que lo explica:
      «Gas ×0,08» dice por qué es gas mucho mejor que «Gas» solo. */
  mix: { rot: string; color?: string; razon?: string }
  pozos: string
  pozos_n: number
  /* ── lo que se ve sólo al abrir la fila ──────────────────────────────── */
  /** reseña del fixture, o la frase derivada del mix si no hay */
  resena: string
  /** % del valor en dólares, formateado */
  valor: string
  /** qué parte de los pozos del país opera, formateado */
  pctPozos: string
  /** rinde por pozo contra la media, p. ej. "×1,6"; null si no se puede */
  rinde: string | null
  /** en qué tercio cae ese rinde: 1, 2 o 3 */
  rindeNivel: number
  bolsa?: { ticker: string; mercado: string; precio: string; delta: number }
  website?: string
  logoUrl?: string
}

export type GrupoFiltro = {
  id: string
  rot: string
  color?: string
  /** cuántas caen en el grupo; se calcula en el servidor */
  n: number
}

export function ListaEmpresas({
  filas,
  grupos,
  /** rótulos del pie, ya formateados por el servidor para el estado inicial */
  totalPct,
  totalPozos,
}: {
  filas: FilaEmpresa[]
  grupos: GrupoFiltro[]
  totalPct: string
  totalPozos: string
}) {
  const idBase = useId()
  const [grupo, setGrupo] = useState('todas')
  const [q, setQ] = useState('')
  /* Una sola abierta a la vez. En provincias cada fila guarda su estado y se
     pueden abrir todas, pero ahí son once; con 52 y una ficha de 130px, dejar
     abrir varias convierte la lista en una pila que hay que volver a cerrar a
     mano. El acordeón mantiene el largo previsible. */
  const [abierta, setAbierta] = useState<string | null>(null)

  /* El filtro decide qué se VE, no qué se renderiza: las 52 filas están
     siempre en el DOM y las que salen quedan colapsadas en alto cero. Es lo
     que permite animarlas — una fila desmontada no tiene qué animar — y de
     paso el buscador no vuelve a montar 52 nodos en cada tecla. */
  const { visible, resumen } = useMemo(() => {
    const txt = q.trim().toLowerCase()
    const pasa = (f: FilaEmpresa) =>
      (grupo === 'todas' || (grupo === 'cotizan' ? f.cotiza : f.grupo === grupo)) &&
      (!txt || f.nombre.toLowerCase().includes(txt))
    const v = new Set(filas.filter(pasa).map((f) => f.slug))
    const dentro = filas.filter((f) => v.has(f.slug))
    return {
      visible: v,
      resumen: {
        n: dentro.length,
        pct: dentro.reduce((s, f) => s + f.nacional_n, 0),
        pozos: dentro.reduce((s, f) => s + f.pozos_n, 0),
      },
    }
  }, [filas, grupo, q])

  const sinResultados = resumen.n === 0
  /* El pie arranca con los textos del servidor y sólo recalcula cuando hay un
     filtro puesto: así el primer render coincide exacto con el HTML servido y
     no hay parpadeo de hidratación por el formato de número. */
  const intacto = grupo === 'todas' && q.trim() === ''

  /* Cambiar de filtro cierra la ficha: si la que estaba abierta sale del
     filtro, quedaría un desglose colgando de una fila que ya no se ve. */
  function filtrar(id: string) {
    setGrupo(id)
    setAbierta(null)
  }

  return (
    /* A ancho completo de la sección y no centrada en 520: con seis píldoras la
       barra de filtros mide 563 y en 520 «Cotizan» quedaba cortada. Además las
       cards de las secciones 01 y 02 ocupan el ancho entero, así que centrar
       ésta la dejaba como la única angosta de la página. */
    <div>
      <div className="s-card mb-2">
        <div className="s-busca">
          <span className="shrink-0" style={{ color: 'var(--ink-3)' }}>
            <Icono d={PATH.buscar} size={14} grosor={2} />
          </span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setAbierta(null)
            }}
            placeholder="Buscar empresa…"
            aria-label="Buscar empresa"
          />
          {q && (
            <button
              type="button"
              className="s-icono shrink-0"
              style={{ width: 22, height: 22 }}
              onClick={() => setQ('')}
              aria-label="Limpiar la búsqueda"
            >
              <Icono d={PATH.cerrar} size={12} grosor={2} />
            </button>
          )}
        </div>
      </div>

      <div className="s-filtros" role="group" aria-label="Filtrar por fluido">
        {grupos.map((g) => (
          <button
            key={g.id}
            type="button"
            className="s-fpill"
            aria-pressed={grupo === g.id}
            onClick={() => filtrar(g.id)}
          >
            {g.color && <i style={{ background: g.color }} />}
            {g.rot}
            <b>{g.n}</b>
          </button>
        ))}
      </div>

      <div className="s-card">
        <div className="s-gcab">
          <span>Empresa</span>
          <span className="text-right">Nacional</span>
          <span className="pl-3">Mix</span>
          <span className="text-right">Pozos</span>
          <span />
        </div>
        <div className="max-h-[392px] overflow-auto">
          {filas.map((f) => {
            const id = `${idBase}-${f.slug}`
            const esta = abierta === f.slug
            return (
              <div key={f.slug} className="s-colapsa" data-abierto={visible.has(f.slug) ? 'si' : 'no'}>
                <div>
                  <button
                    type="button"
                    className="s-gfila"
                    aria-expanded={esta}
                    aria-controls={id}
                    onClick={() => setAbierta((a) => (a === f.slug ? null : f.slug))}
                  >
                    <span className="truncate font-medium">{f.nombre}</span>
                    <span className="s-num text-right">{f.nacional}</span>
                    <span className="pl-3">
                      <span
                        className="s-festado"
                        style={
                          f.mix.color
                            ? {
                                /* La misma receta que .s-tag: el fondo lleva 13% del
                                   color y el texto 55% mezclado con la tinta, que es
                                   el escalón donde los ocho de la paleta llegan a
                                   AA. Va inline porque el color entra por fila. */
                                background: `color-mix(in srgb, ${f.mix.color} 13%, var(--surface))`,
                                color: `color-mix(in srgb, ${f.mix.color} 55%, var(--ink))`,
                              }
                            : { background: 'var(--field)', color: 'var(--ink-2)' }
                        }
                      >
                        {f.mix.rot}
                      </span>
                    </span>
                    <span className="s-num text-right" style={{ color: 'var(--ink-2)' }}>
                      {f.pozos}
                    </span>
                    {/* Chevron de 14 con trazo 2,2 y giro en 300ms: el mismo que
                        abre el desglose de provincias. Que sean la misma pieza
                        importa más que su tamaño — dos formas distintas de
                        «esto se abre» en la misma web es una de más. */}
                    <span
                      aria-hidden
                      className="flex items-center justify-center"
                      style={{
                        color: 'var(--ink-3)',
                        transform: esta ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform var(--dur-slow) var(--ease-in-out)',
                      }}
                    >
                      <Icono d="M6 9l6 6 6-6" size={14} grosor={2.2} />
                    </span>
                  </button>

                  <div id={id} className="s-colapsa" data-abierto={esta ? 'si' : 'no'}>
                    <div>
                      <Ficha f={f} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {/* El vacío no se esconde: si el buscador no encuentra nada, la card
              lo dice en el mismo renglón que ocuparía una fila. */}
          {sinResultados && (
            <p className="s-etq m-0 px-3 py-6 text-center">
              Ninguna empresa coincide con «{q.trim()}».
            </p>
          )}
        </div>
        <div className="s-pie-card">
          <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
            <b className="s-num font-medium" style={{ color: 'var(--ink)' }}>
              {intacto ? filas.length : resumen.n}
            </b>{' '}
            de {filas.length}
          </span>
          <span className="s-micro ml-auto" style={{ color: 'var(--ink-2)' }}>
            <b className="s-num font-medium" style={{ color: 'var(--ink)' }}>
              {intacto ? totalPct : `${resumen.pct.toFixed(1).replace('.', ',')}%`}
            </b>{' '}
            del país
          </span>
          <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
            <b className="s-num font-medium" style={{ color: 'var(--ink)' }}>
              {intacto ? totalPozos : resumen.pozos.toLocaleString('es-AR')}
            </b>{' '}
            pozos
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── La ficha ───────────────────────────────────────────────────────────
   La opción C de las cinco probadas: placa de logo a la izquierda —la misma
   composición que la fila de noticias y que las cards de la sección 01—, la
   reseña arriba y cinco renglones etiqueta→valor.

   Va sobre --inset y no sobre --surface: es un plano por detrás de la fila que
   lo abrió, y ese escalón es lo que hace que se lea como su desglose y no como
   cinco filas más de la tabla. */
function Ficha({ f }: { f: FilaEmpresa }) {
  return (
    <div
      className="flex items-start gap-3 px-3 py-3"
      style={{ background: 'var(--inset)', borderBottom: '1px solid var(--line)' }}
    >
      <LogoEmpresa nombre={f.nombre} website={f.website} logoUrl={f.logoUrl} caja={56} />
      <div className="min-w-0 flex-1">
        <p className="s-desc m-0">{f.resena}</p>
        <div className="mt-1.5">
          <FichaFila rotulo="Producción" valor={f.nacional} apoyo="del país" />
          <FichaFila rotulo="Valor en dólares" valor={f.valor} apoyo="del país" />
          <FichaFila rotulo="Pozos" valor={f.pozos} apoyo={`${f.pctPozos} del país`} />
          {f.rinde && (
            <FichaFila
              rotulo="Rinde por pozo"
              valor={f.rinde}
              apoyo="contra la media"
              marca={
                <span className="s-medidor shrink-0" aria-hidden>
                  {[1, 2, 3].map((i) => (
                    <i key={i} className={i <= f.rindeNivel ? 'on' : undefined} />
                  ))}
                </span>
              }
            />
          )}
          <FichaFila
            rotulo="Fluido"
            valor={f.mix.rot}
            /* «val/vol» abreviado y no «valor/volumen»: el apoyo tiene 86px y
               el texto entero envolvía a dos líneas, que era el único renglón
               de la ficha que rompía el ritmo. Lo que significa está dicho en
               el pie de la sección. */
            apoyo={f.mix.razon ? `${f.mix.razon} val/vol` : 'sin relación'}
            marca={
              <span
                aria-hidden
                className="block size-2 shrink-0 rounded-full"
                style={{ background: f.mix.color ?? 'var(--line-strong)' }}
              />
            }
          />
          {/* El renglón de cotización sólo existe si la empresa cotiza. Poner
              «Cotización — privada» sería gastar un renglón en decir que no hay
              nada; que falte ya lo dice, y el filtro «Cotizan» de arriba está
              para quien lo busque. */}
          {f.bolsa && (
            <FichaFila
              rotulo={`Cotización · ${f.bolsa.mercado}`}
              valor={`US$ ${f.bolsa.precio}`}
              apoyo={
                <span
                  className={`s-delta ${f.bolsa.delta >= 0 ? 's-delta--sube' : 's-delta--baja'}`}
                >
                  {f.bolsa.delta >= 0 ? '+' : '−'}
                  {Math.abs(f.bolsa.delta).toFixed(1).replace('.', ',')}%
                </span>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

function FichaFila({
  rotulo,
  valor,
  apoyo,
  marca,
}: {
  rotulo: string
  valor: string
  /** columna derecha: qué califica al valor. Acepta nodo porque el delta de la
      cotización va acá y no en `marca` — un «−1,8%» a la izquierda del precio
      se lee como si el precio fuera negativo. */
  apoyo?: React.ReactNode
  /** punto de color o medidor, pegado a la izquierda del valor */
  marca?: React.ReactNode
}) {
  return (
    <div className="s-ficha-fila">
      <span className="s-etq min-w-0 flex-1">{rotulo}</span>
      {marca}
      <span className="s-cifra-sm text-right">{valor}</span>
      <span className="s-micro w-[86px] shrink-0 text-right" style={{ color: 'var(--ink-2)' }}>
        {apoyo}
      </span>
    </div>
  )
}
