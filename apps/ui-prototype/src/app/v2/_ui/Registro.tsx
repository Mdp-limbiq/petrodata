'use client'

import { useMemo, useState } from 'react'
import { Icono, PATH } from './iconos'
import { Tag } from './kit'

/* REGISTRO — la Records Table (§12) del catálogo, completa.

   Es la sección de la referencia que más se parece a lo que hay que resolver
   acá: literalmente una tabla de empresas, con las mismas columnas mixtas
   —identidad, categoría, cifra, nivel, enlace—. Lo que v2 estaba usando era la
   cabecera y las celdas; faltaban la barra de controles, las cabeceras
   ordenables, la columna congelada, la selección, la grilla completa, el nivel
   por punto, el enlace externo y el pie de dos renglones.

   Es cliente porque el orden y la selección son estado. Todo lo que se muestra
   llega ya formateado desde el servidor —los `*_n` son sólo para comparar— por
   la razón de siempre: una función de formato no cruza el límite de servidor a
   cliente y el error que tira Next no dice cuál era. */

export type FilaRegistro = {
  slug: string
  nombre: string
  /** sitio de la empresa. No tiene columna propia: el NOMBRE es el enlace.
      La referencia le da una columna porque allá el nombre no siempre linkea;
      acá sí, y una tabla que no entra en la sección no puede gastar 190px en
      repetir un enlace que ya está. */
  sitio?: string
  cotiza?: { ticker: string; bolsa: string }
  /** ya formateado, p. ej. "34,2%" */
  nacional: string
  nacional_n: number
  /** fluido que predomina; sin color, va en gris y se lee como sin dato */
  mix: { rot: string; color?: string; razon?: string }
  pozos: string
  pozos_n: number
}

export type AgregadoRegistro = {
  /** rótulo de la columna congelada, p. ej. "Las diez primeras" */
  rotulo: string
  cotiza?: string
  nacional?: string
  mix?: string
  pozos?: string
  /** true en el renglón de arriba, que va un peldaño más claro */
  secundario?: boolean
}

type Col = 'nacional' | 'pozos' | 'nombre'

export function Registro({
  filas,
  agregados,
  corte,
}: {
  filas: FilaRegistro[]
  /** de arriba hacia abajo; el último queda pegado al borde */
  agregados: AgregadoRegistro[]
  /** el mes del que habla la tabla, para el botón de la barra */
  corte: string
}) {
  const [orden, setOrden] = useState<{ col: Col; asc: boolean }>({ col: 'nacional', asc: false })
  const [soloConProduccion, setSoloConProduccion] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())

  const visibles = useMemo(() => {
    const base = soloConProduccion ? filas.filter((f) => f.nacional_n > 0) : filas
    const s = base.slice().sort((a, b) => {
      const d =
        orden.col === 'nombre'
          ? a.nombre.localeCompare(b.nombre, 'es')
          : orden.col === 'pozos'
            ? a.pozos_n - b.pozos_n
            : a.nacional_n - b.nacional_n
      /* Desempate estable por pozos: con 21 empresas en 0,0% el orden por
         participación las dejaría en cualquier posición entre sí, y la lista
         cambiaría de forma en cada render. */
      return (orden.asc ? d : -d) || b.pozos_n - a.pozos_n
    })
    return s
  }, [filas, orden, soloConProduccion])

  const todas = sel.size > 0 && sel.size === visibles.length

  function alternar(slug: string) {
    setSel((s) => {
      const n = new Set(s)
      if (n.has(slug)) n.delete(slug)
      else n.add(slug)
      return n
    })
  }

  function ordenar(col: Col) {
    /* El primer click de una columna nueva ordena descendente: en una tabla de
       participación lo que interesa es quién está arriba, no quién está último. */
    setOrden((o) => (o.col === col ? { col, asc: !o.asc } : { col, asc: false }))
  }

  const cab = (col: Col | null, icono: string, rot: string, ancho: number, alDerecha = false) => (
    <th style={{ width: ancho }}>
      {col ? (
        <button
          type="button"
          className="s-reg-th"
          onClick={() => ordenar(col)}
          aria-label={`Ordenar por ${rot}`}
        >
          <span className="s-reg-th-ico">
            <Icono d={icono} />
          </span>
          <span className="truncate">{rot}</span>
          <span
            className={`s-reg-orden ${orden.col === col ? 'on' : ''} ${
              orden.col === col && orden.asc ? 'asc' : ''
            }`}
          >
            <Icono d={PATH.abajo} size={12} />
          </span>
        </button>
      ) : (
        <span className="s-reg-th" style={{ cursor: 'default' }}>
          <span className="s-reg-th-ico">
            <Icono d={icono} />
          </span>
          <span className="truncate">{rot}</span>
        </span>
      )}
      {alDerecha ? null : null}
    </th>
  )

  return (
    <div className="s-reg">
      <div className="s-reg-barra">
        <div className="s-reg-grupo">
          <span className="inline-flex shrink-0" style={{ color: 'var(--green)' }}>
            <Icono d={PATH.base} size={16} />
          </span>
          <span className="shrink-0 px-1.5" style={{ fontSize: 12, fontWeight: 550 }}>
            {filas.length} empresas
          </span>
          <button
            type="button"
            className="s-reg-btn"
            aria-pressed={soloConProduccion}
            onClick={() => setSoloConProduccion((v) => !v)}
          >
            <Icono d={PATH.filtro} size={14} />
            <span className="hidden sm:inline">Con producción</span>
            {soloConProduccion && <i className="s-reg-punto" />}
          </button>
        </div>
        <div className="s-reg-grupo shrink-0">
          {/* El recuento de selección ocupa el lugar del botón secundario y sólo
              existe cuando hay algo seleccionado, como en la referencia. */}
          {sel.size > 0 && (
            <button type="button" className="s-reg-btn" onClick={() => setSel(new Set())}>
              {sel.size} seleccionada{sel.size > 1 ? 's' : ''} · limpiar
            </button>
          )}
          <span className="s-reg-btn s-reg-btn--marco hidden sm:inline-flex" style={{ cursor: 'default' }}>
            {corte}
          </span>
        </div>
      </div>

      <div className="s-reg-scroll" tabIndex={0} aria-label="Registro de empresas">
        <table className="s-reg-tabla">
          <thead>
            <tr>
              <th className="s-reg-fija" style={{ width: 228 }}>
                <div className="s-reg-cab-emp">
                  <label className="s-check" title="Seleccionar todas">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todas"
                      checked={todas}
                      onChange={() => setSel(todas ? new Set() : new Set(visibles.map((f) => f.slug)))}
                    />
                    <span className="s-check-caja">
                      {todas ? <Icono d={PATH.tilde} size={11} grosor={3} /> : <span className="s-check-guion" />}
                    </span>
                  </label>
                  <span>Empresa</span>
                </div>
              </th>
              {cab(null, PATH.etiqueta, 'Cotización', 110)}
              {cab('nacional', PATH.lista, 'Nacional', 120)}
              {cab(null, PATH.gota, 'Mix', 104)}
              {cab('pozos', PATH.pozo, 'Pozos', 108)}
            </tr>
          </thead>
          <tbody>
            {visibles.map((f) => (
              <tr key={f.slug} className={`s-reg-fila ${sel.has(f.slug) ? 'sel' : ''}`}>
                <td className="s-reg-celda s-reg-fija s-reg-emp">
                  <label className="s-check" title={`Seleccionar ${f.nombre}`}>
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${f.nombre}`}
                      checked={sel.has(f.slug)}
                      onChange={() => alternar(f.slug)}
                    />
                    <span className="s-check-caja">
                      <Icono d={PATH.tilde} size={11} grosor={3} />
                    </span>
                  </label>
                  <span className="s-marca" aria-hidden>
                    {f.nombre.trim().charAt(0).toUpperCase()}
                  </span>
                  {f.sitio ? (
                    <a
                      href={`https://${f.sitio}`}
                      className="s-reg-nombre"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {f.nombre}
                    </a>
                  ) : (
                    <span className="s-reg-nombre">{f.nombre}</span>
                  )}
                </td>
                <td className="s-reg-celda">
                  {f.cotiza ? (
                    /* Verde y no acento: el acento significa «esto está activo»
                       y una empresa que cotiza no está activa, pertenece a una
                       categoría. El verde es el mismo que lleva la píldora de
                       bolsa en la sección 02, así que «cotiza» es un color en
                       las dos y no dos colores para la misma cosa. */
                    <span title={`${f.cotiza.ticker} · ${f.cotiza.bolsa}`}>
                      <Tag color="var(--green)">{f.cotiza.ticker}</Tag>
                    </span>
                  ) : (
                    <span className="s-tag s-tag--neutro">
                      <i aria-hidden />
                      <span>Privada</span>
                    </span>
                  )}
                </td>
                <td className="s-reg-celda s-num text-right">{f.nacional}</td>
                <td className="s-reg-celda">
                  <span className="s-nivel">
                    <i style={{ background: f.mix.color ?? 'var(--line-strong)' }} />
                    <span
                      className="truncate"
                      style={f.mix.color ? undefined : { color: 'var(--ink-2)' }}
                      title={f.mix.razon ? `${f.mix.rot} · valor/producción ${f.mix.razon}` : undefined}
                    >
                      {f.mix.rot}
                    </span>
                  </span>
                </td>
                <td className="s-reg-celda s-num text-right">{f.pozos}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {agregados.map((a) => (
              <tr key={a.rotulo} className={a.secundario ? 's-reg-calc2' : undefined}>
                <td className="s-reg-celda s-reg-fija">
                  <span className="s-reg-rot">{a.rotulo}</span>
                </td>
                <td className="s-reg-celda">{a.cotiza ?? <span className="s-reg-vacio">—</span>}</td>
                <td className="s-reg-celda s-num text-right">
                  {a.nacional ? <span className="s-reg-cifra">{a.nacional}</span> : <span className="s-reg-vacio">—</span>}
                </td>
                <td className="s-reg-celda">{a.mix ?? <span className="s-reg-vacio">—</span>}</td>
                <td className="s-reg-celda s-num text-right">
                  {a.pozos ? <span className="s-reg-cifra">{a.pozos}</span> : <span className="s-reg-vacio">—</span>}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  )
}
