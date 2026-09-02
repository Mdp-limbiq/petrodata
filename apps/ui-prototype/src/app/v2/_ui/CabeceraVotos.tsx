'use client'

import { useEffect, useState } from 'react'
import { Icono, PATH } from './iconos'
import { LIMITE, proximoCorte } from './voto-reglas'
import { useVotos } from './votos'

/* LA CABECERA DE LA CARD DEL RANKING.

   Era una línea de texto plano: «1.284 votos de 377 personas · se reordena en
   8 h 10 min». Todo del mismo peso y del mismo gris, así que no se leía nada
   —ni las cifras ni la cuenta regresiva—.

   Tres piezas del sistema y ninguna nueva:

   · el punto que late (s-pixel, §7). Dice que el conteo está abierto. Es el
     único movimiento permanente de la card, y el sistema pide que haya alguno.
   · las cifras en mono y tinta plena, las palabras en ink-2 (§8.6: la mono es
     para lo que se cuenta). La jerarquía la hace el peso y el color, nunca el
     tamaño — todo sigue a 11,5.
   · el corte en un chip con reloj y su riel de 4px (s-chip--mini + s-barra),
     que muestra cuánto del día ya pasó. El riel es lo que convierte «8 h 10
     min» en algo que se mira en vez de leerse.

   El chip DICE «se actualiza en». Sin esas palabras era un reloj, una barra y
   una hora sueltos, y lo que faltaba era justamente el sujeto: qué es lo que
   pasa cuando el reloj llega.

   LOS VOTOS QUE TE QUEDAN vuelven acá (pedido de Mariano, 2026-09-01). Cuando
   se sacó la card 01 se perdió el único lugar donde se veía el presupuesto: la
   mecánica seguía andando —los chevrones se apagan solos al quinto voto— pero
   el que llegaba al límite se enteraba cuando un botón dejaba de responder.

   Son los puntos de `.s-creditos`, que quedaron en el CSS sin usar desde que
   se fue el panel: cinco marcas se cuentan de un vistazo y un «3 de 5» hay que
   leerlo. El gastado se llena con la tinta media, el que queda es el riel
   vacío. Es la misma gramática de .s-medidor.

   EL RÓTULO ES «Créditos» Y NO «tuyos». Es el nombre que el propio CSS le da
   —«Los créditos: un punto por voto»— y es un sustantivo, que es como rotula
   todo el sitio: El ranking, La lista, Operadores principales, Cobertura. La
   §8.1 lo pide y la §1.5 aclara que no es opcional. «tuyos» además le hablaba
   al lector, cosa que ningún otro rótulo de v2 hace.

   El presupuesto sale del storage, así que en el servidor son cinco puntos
   vacíos y los gastados aparecen al hidratar. `useVotos` tiene su snapshot de
   servidor justamente para que el HTML servido y el primer render coincidan. */
export function CabeceraVotos({ votos, personas }: { votos: number; personas: number }) {
  const { usados, restantes } = useVotos()
  const [corte, setCorte] = useState<{ txt: string; pct: number } | null>(null)

  useEffect(() => {
    const tic = () => {
      const falta = Math.max(0, proximoCorte().getTime() - Date.now())
      const h = Math.floor(falta / 3_600_000)
      const m = Math.floor((falta % 3_600_000) / 60_000)
      setCorte({
        txt: h > 0 ? `${h} h ${m} min` : `${m} min`,
        /* Cuánto del día ya transcurrió. El riel se llena hacia el corte. */
        pct: Math.min(100, Math.max(0, 100 - (falta / 86_400_000) * 100)),
      })
    }
    tic()
    const id = setInterval(tic, 30_000)
    return () => clearInterval(id)
  }, [])

  const n = (v: number) => v.toLocaleString('es-AR')

  return (
    <span className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-2">
      <span className="flex items-center gap-1.5">
        <i
          className="s-pixel block size-1.5 shrink-0 rounded-full"
          style={{ background: 'var(--accent)' }}
          aria-hidden
        />
        <span style={{ color: 'var(--ink-2)' }}>
          <b className="s-mono font-medium" style={{ color: 'var(--ink)' }}>
            {n(votos)}
          </b>{' '}
          votos ·{' '}
          <b className="s-mono font-medium" style={{ color: 'var(--ink)' }}>
            {n(personas)}
          </b>{' '}
          personas
        </span>
      </span>

      {/* LOS VOTOS QUE TE QUEDAN. Va entre las cifras de todos y el corte,
          que es su orden lógico: cuántos votaron, cuántos te quedan a vos,
          cuándo se cuenta. */}
      <span
        className="flex items-center gap-1.5"
        title={`${restantes} de ${LIMITE} créditos. Se renuevan el lunes.`}
      >
        {/* SIN EL NÚMERO AL LADO. Con el número la cabecera se iba a dos
            renglones, que es más alta y no más ancha. Y repetía lo que los
            puntos ya dicen: el CSS de .s-creditos lo tiene escrito —«cinco
            marcas se cuentan de un vistazo y un 3 de 5 hay que leerlo». Queda
            el rótulo, que es lo que los puntos no pueden decir solos. */}
        <span style={{ color: 'var(--ink-2)' }}>Créditos</span>
        <span className="s-creditos" aria-hidden>
          {Array.from({ length: LIMITE }, (_, i) => (
            <i key={i} className={i < usados ? 'usado' : undefined} />
          ))}
        </span>
        {/* Para quien no ve los puntos. */}
        <span className="sr-only">
          Créditos: {restantes} de {LIMITE} disponibles esta semana
        </span>
      </span>

      {/* El chip aparece recién con el reloj del cliente: en el servidor no hay
          hora del visitante y pintarlo haría que el primer render no coincida
          con el HTML servido. */}
      {corte && (
        <span
          className="s-chip s-chip--neutro s-chip--mini"
          title="El orden del ranking se recalcula una vez por día"
        >
          <Icono d={PATH.reloj} size={11} grosor={2.2} />
          <span className="s-barra hidden w-7 sm:block" aria-hidden>
            <i style={{ width: `${corte.pct}%`, background: 'var(--ink-3)' }} />
          </span>
          {/* Sin estas dos palabras el chip es un reloj, una barra y una hora:
              nadie sabe qué pasa dentro de 8 horas. */}
          se actualiza en <span className="s-mono">{corte.txt}</span>
        </span>
      )}
    </span>
  )
}
