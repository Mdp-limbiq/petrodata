'use client'

import { useMemo, useState } from 'react'
import { Icono, PATH } from './iconos'

/* LISTA FILTRABLE — la Filter Table (§13) con el buscador de la §15.

   Nadie lee 52 filas: busca una, o mira un grupo. Antes acá vivía la Records
   Table (§12) completa, que es la otra receta que el catálogo tiene para una
   tabla larga. Se cambió por ésta (pedido de Mariano, 2026-08-17) y el motivo
   es sano: la §12 trae selección con checkbox, y la selección sólo significa
   algo si hay acciones que aplicarle. Acá no las hay, así que era una casilla
   que se marca y no pasa nada. La §13 no promete nada que no cumpla.

   Lo que se gana de paso es la única animación ESTRUCTURAL del sistema: al
   filtrar, las filas que salen se colapsan con `grid-template-rows: 1fr → 0fr`
   en vez de desaparecer de un frame al otro. Con 52 filas, ver cuáles se van
   es la mitad de entender el filtro.

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
  /** rótulo del fluido; sin color, se lee como sin dato */
  mix: { rot: string; color?: string }
  pozos: string
  pozos_n: number
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
  const [grupo, setGrupo] = useState('todas')
  const [q, setQ] = useState('')

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
            onChange={(e) => setQ(e.target.value)}
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
            onClick={() => setGrupo(g.id)}
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
        </div>
        <div className="max-h-[392px] overflow-auto">
          {filas.map((f) => (
            <div key={f.slug} className="s-colapsa" data-abierto={visible.has(f.slug) ? 'si' : 'no'}>
              <div>
                <div className="s-gfila">
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
                </div>
              </div>
            </div>
          ))}
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
