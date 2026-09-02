'use client'

import { useEffect, useRef, useState } from 'react'
import { Icono, PATH } from './iconos'

/* AVISAR QUE UN DATO ESTÁ MAL.

   Reemplaza al renglón «Fuente» de la ficha. El link a la fuente era la prueba
   de que el cargo se verificó, pero dieciocho de los cuarenta y ocho no tienen
   —y de los que tienen, varios salen de registros de 2018—. Mostrarlo sólo en
   algunas filas marcaba justamente lo que Mariano pidió no marcar cuando se
   sacó el chip de «sin confirmar». El canal de corrección lo reemplaza y sirve
   para las cuarenta y ocho por igual.

   ES UN <dialog> NATIVO. Trae el foco atrapado, el cierre con Escape y el
   ::backdrop sin una línea de JS ni una librería, que es lo que pide la §7:
   movimiento en CSS y nada más.

   EL CORREO ES OBLIGATORIO (pedido de Mariano). No es una traba de formulario:
   un aviso de «el cargo de fulano está mal» sin forma de repreguntar no se
   puede verificar, y verificar es todo el trabajo de esta sección. Por eso el
   botón nace apagado y sólo se enciende con las dos cosas cargadas.

   ⚠️ TODAVÍA NO SE ENVÍA A NINGUNA PARTE. Falta el destino: un endpoint o una
   casilla. Hasta que exista, el aviso se guarda en localStorage y nada sale
   del navegador —igual que el voto, y por la misma razón: se puede ver la
   interacción sin inventar un backend—. Con una dirección esto se resuelve en
   una línea, cambiando el `guardar` por un mailto o un fetch. Antes de
   publicar TIENE que estar conectado: un canal de correcciones que no llega a
   nadie es peor que no ofrecerlo. */

const CLAVE = 'v2-directivos-avisos'

/** Suficiente para descartar un tipeo, sin pretender validar que exista. */
const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function AvisoDato({ nombre, empresa }: { nombre: string; empresa: string }) {
  const [abierto, setAbierto] = useState(false)
  const [correo, setCorreo] = useState('')
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)

  /* showModal() y no el atributo `open`: es lo único que activa el backdrop y
     el foco atrapado. Por eso el estado abre el diálogo con un efecto en vez
     de renderizarlo condicionalmente. */
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  const valido = CORREO_OK.test(correo.trim()) && texto.trim().length > 0

  function cerrar() {
    setAbierto(false)
    /* Se limpia al cerrar, no al enviar: si el envío falla y el diálogo sigue
       abierto, lo escrito tiene que seguir ahí. */
    setTimeout(() => {
      setEnviado(false)
      setCorreo('')
      setTexto('')
    }, 200)
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!valido) return
    try {
      const previos = JSON.parse(localStorage.getItem(CLAVE) || '[]')
      previos.push({
        persona: nombre,
        empresa,
        correo: correo.trim(),
        texto: texto.trim(),
        cuando: new Date().toISOString(),
      })
      localStorage.setItem(CLAVE, JSON.stringify(previos))
    } catch {
      /* storage bloqueado: el aviso se pierde, y hoy se perdería igual */
    }
    setEnviado(true)
  }

  return (
    <>
      <button
        type="button"
        className="s-pill"
        onClick={(e) => {
          e.stopPropagation()
          setAbierto(true)
        }}
      >
        <Icono d={PATH.info} size={13} grosor={2} />
        Avisanos
      </button>

      <dialog
        ref={ref}
        className="s-modal"
        onClose={cerrar}
        /* El clic en el backdrop cae en el propio <dialog>, no en su
           contenido: comparando el objetivo se cierra sin envolver todo en una
           capa extra. Y se corta la propagación para que no llegue a la fila,
           que abre y cierra la ficha. */
        onClick={(e) => {
          e.stopPropagation()
          if (e.target === ref.current) cerrar()
        }}
      >
        <form onSubmit={enviar}>
          <div className="s-barra-card">
            <span className="s-titulo">
              {enviado ? 'Gracias' : 'Avisanos si hay algo mal'}
            </span>
            <button type="button" className="s-modal-x" onClick={cerrar} aria-label="Cerrar">
              <Icono d={PATH.cerrar} size={14} grosor={2} />
            </button>
          </div>

          {enviado ? (
            <div className="s-modal-cuerpo">
              <p className="s-cuerpo" style={{ color: 'var(--ink-2)' }}>
                Anotamos tu aviso sobre <b style={{ color: 'var(--ink)' }}>{nombre}</b>. Si hace
                falta, escribimos a <span className="s-mono">{correo.trim()}</span>.
              </p>
            </div>
          ) : (
            <div className="s-modal-cuerpo">
              <p className="s-desc">
                Estás avisando sobre <b style={{ color: 'var(--ink)' }}>{nombre}</b>, de {empresa}.
                Contanos qué está mal —el cargo, el nombre, la foto— y lo corregimos.
              </p>

              <label className="s-modal-campo">
                <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
                  Tu correo
                </span>
                <span className="s-campo">
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="nombre@empresa.com"
                    autoComplete="email"
                    required
                  />
                </span>
                {/* Se dice el PORQUÉ, no que es obligatorio: el botón apagado
                    ya dice que falta algo, y «para poder repreguntar» explica
                    qué se gana dándolo. */}
                <span className="s-micro" style={{ color: 'var(--ink-3)' }}>
                  Lo necesitamos para poder repreguntarte.
                </span>
              </label>

              <label className="s-modal-campo">
                <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
                  Qué está mal
                </span>
                <span className="s-campo">
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={4}
                    placeholder="Dejó el cargo en marzo; el actual es…"
                    required
                  />
                </span>
              </label>
            </div>
          )}

          <div className="s-pie-card s-modal-pie">
            {enviado ? (
              <button type="button" className="s-pill" onClick={cerrar}>
                Cerrar
              </button>
            ) : (
              <>
                <button type="button" className="s-modal-cancel" onClick={cerrar}>
                  Cancelar
                </button>
                {/* Apagado hasta que haya correo Y texto. El title dice qué
                    falta: un botón que no responde y no explica por qué se lee
                    como que se rompió. */}
                <button
                  type="submit"
                  className="s-pill"
                  disabled={!valido}
                  title={valido ? undefined : 'Hace falta tu correo y el mensaje'}
                >
                  Enviar
                </button>
              </>
            )}
          </div>
        </form>
      </dialog>
    </>
  )
}
