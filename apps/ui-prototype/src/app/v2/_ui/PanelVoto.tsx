'use client'

import { LIMITE, useVotos } from './votos'
import { formatInteger } from '@/lib/format'

/* EL PANEL DEL VOTO — el presupuesto de quien mira y la actividad de la semana.

   Vive en la sección 01 y lee el MISMO store que la lista de la 02: al votar
   allá abajo, el crédito de acá arriba baja en el mismo frame.

   Conviene separar bien qué es real y qué no, porque en esta card conviven las
   dos cosas y mezclarlas sería el peor lugar para hacerlo:

   · TU PRESUPUESTO es real. Sale del storage del navegador, es tu voto de esta
     semana y caduca el lunes.
   · LA ACTIVIDAD DE LA SEMANA —cuántos votos y cuántas personas— es SIMULADA.
     Son números que sólo puede dar el servidor: cuántos votaron en total y
     cuántos usuarios únicos hubo. Van rotulados como maqueta, porque una cifra
     de participación inventada al lado de un ranking de personas reales es
     justo lo que no se puede publicar sin aclarar.

   Los dos números simulados son fijos y no aleatorios: si cambiaran en cada
   carga se notaría que no son ciertos, pero también se notaría que la maqueta
   no se puede leer dos veces igual. */

/* Actividad simulada de la semana. Un valor por votante de unos 3,4 votos, que
   es coherente con un tope de 5: casi nadie usa todos. */
const VOTOS_SEMANA = 1_284
const PERSONAS_SEMANA = 377

export function PanelVoto() {
  const { usados, restantes } = useVotos()

  return (
    <div className="s-pvoto">
      {/* El presupuesto, que es el único dato real de este bloque. Los puntos
          se dibujan uno por voto: cinco marcas se cuentan de un vistazo y un
          «3 de 5» hay que leerlo. */}
      <div className="s-pvoto-mio">
        <span className="s-etq block">Tus votos de esta semana</span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="s-creditos" aria-hidden>
            {Array.from({ length: LIMITE }, (_, i) => (
              <i key={i} className={i < usados ? 'usado' : undefined} />
            ))}
          </span>
          <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
            {restantes === 0
              ? 'sin votos hasta el lunes'
              : `${restantes} de ${LIMITE} disponibles`}
          </span>
        </span>
      </div>

      <div className="s-pvoto-sem">
        <span className="s-etq block">Actividad de la semana</span>
        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="flex items-baseline gap-1.5">
            <b className="s-cifra-sm">{formatInteger(VOTOS_SEMANA)}</b>
            <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
              votos
            </span>
          </span>
          <span className="flex items-baseline gap-1.5">
            <b className="s-cifra-sm">{formatInteger(PERSONAS_SEMANA)}</b>
            <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
              personas votaron
            </span>
          </span>
          <span className="s-chip s-chip--neutro s-chip--mini">simulado</span>
        </span>
      </div>
    </div>
  )
}
