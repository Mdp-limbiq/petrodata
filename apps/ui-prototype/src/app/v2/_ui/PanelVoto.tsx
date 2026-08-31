'use client'

import { LIMITE, useVotos } from './votos'
import { formatInteger } from '@/lib/format'

/* EL PANEL DEL VOTO — tu presupuesto y la actividad de la semana, como tres
   figuras en fila. Es la opción 2 de indice-voto-propuestas.html.

   Lee el MISMO store que la lista de la sección 02: al votar allá abajo, el
   crédito de acá arriba baja en el mismo frame.

   QUÉ ES REAL Y QUÉ NO. El presupuesto sale del storage del navegador y es tu
   voto de esta semana. Las otras dos figuras sólo puede darlas el servidor y
   acá son inventadas. Llevaban un chip «simulado» que Mariano pidió sacar; la
   aclaración no se pierde, baja al pie de la sección, que es donde el sistema
   pone lo que califica a la sección entera. Conviene que quede escrito: si el
   pie se recorta, estos dos números pasan a leerse como ciertos. */

/* Actividad simulada de la semana. Los tres números son coherentes entre sí:
   1.284 votos sobre 377 personas dan 3,4 por cabeza, que es lo esperable con
   un tope de 5 —casi nadie usa todos—, y 33 de 48 recibiendo al menos un voto
   deja 15 sin ninguno, que es la cola larga de cualquier ranking. */
const VOTOS_SEMANA = 1_284
const PERSONAS_SEMANA = 377
const VOTADAS_SEMANA = 33

export function PanelVoto({ total }: { total: number }) {
  const { usados, restantes } = useVotos()

  return (
    <div className="s-pvoto">
      {/* TU PRESUPUESTO. Es el único dato real del bloque y el único accionable,
          así que se lleva el 21 —.s-titular— y las otras dos van en 17. El
          sistema reserva el 21 para el título de página, uno por página; acá la
          página no tiene otro, y usarlo dos veces en la misma card, como estaba
          en la propuesta, sí habría sido de más. */}
      <div className="s-pvoto-col">
        <span className="s-micro flex items-center gap-1.5" style={{ color: 'var(--ink-2)' }}>
          <i
            aria-hidden
            className="block size-2 shrink-0 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          Te quedan
        </span>
        <span className="mt-0.5 flex items-baseline gap-1.5">
          <b className="s-titular">{restantes}</b>
          <span className="s-micro" style={{ color: 'var(--ink-3)' }}>
            {restantes === 1 ? 'voto esta semana' : 'votos esta semana'}
          </span>
        </span>
        {/* Un punto por voto: cinco marcas se cuentan de un vistazo y un «3 de
            5» hay que leerlo. */}
        <span className="s-creditos mt-2" aria-hidden>
          {Array.from({ length: LIMITE }, (_, i) => (
            <i key={i} className={i < usados ? 'usado' : undefined} />
          ))}
        </span>
      </div>

      <div className="s-pvoto-col">
        <span className="s-micro block" style={{ color: 'var(--ink-2)' }}>
          Van esta semana
        </span>
        <span className="mt-0.5 flex items-baseline gap-1.5">
          <b className="s-cifra">{formatInteger(VOTOS_SEMANA)}</b>
          <span className="s-micro" style={{ color: 'var(--ink-3)' }}>
            votos
          </span>
        </span>
        <span className="s-micro mt-2 block" style={{ color: 'var(--ink-2)' }}>
          de {formatInteger(PERSONAS_SEMANA)} personas
        </span>
      </div>

      {/* LA TERCERA MÉTRICA: cuántas de las 48 recibieron al menos un voto.

          Se eligió ésta porque dice algo que las otras dos NO dicen. «Cuántos
          votos» y «cuánta gente» son las dos caras del mismo hecho —el volumen
          de participación—; ésta habla de cómo se REPARTE: si la atención se
          concentra en cuatro nombres o se derrama por la lista. Y es la que le
          importa a alguien que se busca a sí mismo: dice si quedar afuera es lo
          normal o la excepción.

          Se descartaron dos: el promedio de votos por persona —3,4 de 5— y el
          porcentaje del cupo usado, que son las dos derivables dividiendo los
          números de al lado. Agregan una lectura, no un hecho. */}
      <div className="s-pvoto-col">
        <span className="s-micro block" style={{ color: 'var(--ink-2)' }}>
          Recibieron votos
        </span>
        <span className="mt-0.5 flex items-baseline gap-1.5">
          <b className="s-cifra">{VOTADAS_SEMANA}</b>
          <span className="s-micro" style={{ color: 'var(--ink-3)' }}>
            de {total}
          </span>
        </span>
        <span className="s-micro mt-2 block" style={{ color: 'var(--ink-2)' }}>
          {total - VOTADAS_SEMANA} sin ninguno
        </span>
      </div>
    </div>
  )
}
