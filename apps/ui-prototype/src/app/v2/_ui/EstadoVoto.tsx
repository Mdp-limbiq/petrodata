'use client'

import { useEffect, useState } from 'react'
import { Icono, PATH } from './iconos'
import { LIMITE, proximoCorte } from './voto-reglas'
import { useVotos } from './votos'

/* LOS DOS CHIPS DE ESTADO, en la segunda línea de la cabecera (pedido de
   Mariano, 2026-09-02).

   Son la misma pieza dos veces y por eso van juntos: .s-chip--mini con ícono,
   riel de .s-barra y una cifra en mono. El del corte ya estaba armado así y era
   el que se veía bien; el del presupuesto lo copia en vez de inventar una
   segunda forma de decir lo mismo.

   LO QUE MIDE CADA RIEL es lo que los emparenta: cuánto va consumido de algo
   que se agota y se repone. En el corte, cuánto del día pasó; en los votos,
   cuántos gastaste de los cinco. En los dos crece hacia el límite.

   EL CHEVRÓN DEL PRESUPUESTO es el mismo path que el botón de votar a favor de
   cada fila. Un ícono que ya significa «voto» en esta pantalla dice de qué son
   los que quedan sin tener que rotularlo dos veces.

   POR QUÉ NO VAN EN LA NOTA. La nota de la card describe la CARD —cuántos
   votaron, cuánta gente— y estos dos describen el estado del voto: uno es de
   quien mira y el otro es del reloj. Colgados del rótulo dicen de qué hablan.

   El presupuesto sale del storage: en el servidor son cinco y el gastado
   aparece al hidratar. `useVotos` tiene su snapshot de servidor para que el
   HTML servido y el primer render coincidan. */
export function EstadoVoto() {
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

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span
        className="s-chip s-chip--neutro s-chip--mini"
        title={`${restantes} de ${LIMITE} votos. Se renuevan el lunes.`}
      >
        <Icono d="M18 15l-6-6-6 6" size={11} grosor={2.2} />
        <span className="s-barra hidden w-7 sm:block" aria-hidden>
          <i style={{ width: `${(usados / LIMITE) * 100}%`, background: 'var(--ink-3)' }} />
        </span>
        Votos disponibles{' '}
        {/* tabular-nums aunque sea un dígito: al bajar de 5 a 4 el ancho no
            cambia y el chip de al lado no se corre. */}
        <span className="s-mono">{restantes}</span>
      </span>

      {/* El chip del corte aparece recién con el reloj del cliente: en el
          servidor no hay hora del visitante y pintarlo haría que el primer
          render no coincida con el HTML servido. */}
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
              nadie sabe qué pasa dentro de 13 horas. */}
          se actualiza en <span className="s-mono">{corte.txt}</span>
        </span>
      )}
    </span>
  )
}
