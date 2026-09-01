'use client'

import { useEffect, useState } from 'react'
import { Icono, PATH } from './iconos'
import { proximoCorte } from './voto-reglas'

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
   pasa cuando el reloj llega. */
export function CabeceraVotos({ votos, personas }: { votos: number; personas: number }) {
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
    <span className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1.5">
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
          votos de{' '}
          <b className="s-mono font-medium" style={{ color: 'var(--ink)' }}>
            {n(personas)}
          </b>{' '}
          personas
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
