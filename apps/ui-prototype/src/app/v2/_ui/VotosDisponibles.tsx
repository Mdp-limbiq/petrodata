'use client'

import { LIMITE } from './voto-reglas'
import { useVotos } from './votos'

/* VOTOS DISPONIBLES — el presupuesto de quien mira, debajo del rótulo de la
   card (pedido de Mariano, 2026-09-02).

   Estaba a la derecha, adentro de la nota, como los cinco puntos de
   .s-creditos. Dos problemas: la nota describe la card entera —cuántos votaron,
   cuándo es el corte— y esto es del que mira, así que colgaba del rótulo
   equivocado; y los puntos obligaban a contarlos. El número se lee de una.

   EL NÚMERO VA EN .s-idx, que es la pastilla numérica del sistema: 22 de alto,
   radio de chip, fondo --field, 13 en peso 600 y tabular-nums. Es la misma que
   lleva Puntos en cada fila, así que un número en pastilla ya significa algo
   acá adentro y no hay que inventarle una caja nueva.

   `tabular-nums` importa aunque sea un dígito: al bajar de 5 a 4 el ancho no
   cambia y el rótulo de al lado no se mueve.

   Sale del storage, así que en el servidor son 5 y el gastado aparece al
   hidratar. `useVotos` tiene su snapshot de servidor para que el HTML servido y
   el primer render coincidan. */
export function VotosDisponibles() {
  const { restantes } = useVotos()
  return (
    <span
      className="s-micro flex items-center gap-2"
      style={{ color: 'var(--ink-2)' }}
      title={`${restantes} de ${LIMITE} votos. Se renuevan el lunes.`}
    >
      Votos disponibles
      <span className="s-idx">{restantes}</span>
    </span>
  )
}
