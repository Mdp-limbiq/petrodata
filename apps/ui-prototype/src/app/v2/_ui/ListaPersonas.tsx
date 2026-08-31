'use client'

import { useEffect, useMemo, useState } from 'react'
import { Icono } from './iconos'
import type { Persona } from '@/fixtures/personas'
import { formatDecimal } from '@/lib/format'

/* LA LISTA DE PERSONALIDADES — el índice, y el voto por fila.

   El voto acá es una MAQUETA. En producción tiene que vivir en el servidor: el
   enunciado es «un voto por semana por IP», y eso no se puede sostener desde el
   navegador —quien vota puede borrar el storage y volver a votar—. Se guarda en
   localStorage para poder ver la interacción, y la card lo dice.

   Y conviene dejar escrito lo que una IP no resuelve, porque es la parte que se
   descubre tarde: una oficina, una universidad o una operadora móvil son miles
   de personas detrás de UNA IP, así que el límite semanal bloquea a todos menos
   al primero; y cualquiera con una VPN vota las veces que quiera. Sirve como
   fricción, no como control. Si el ranking va a significar algo, el voto
   necesita una cuenta.

   La semana arranca el lunes, que es lo que dice la cabecera. El identificador
   de semana se calcula del lado del cliente y con eso se descartan los votos
   viejos: sin eso, «se renueva cada lunes» sería una frase y no un
   comportamiento. */

const CLAVE = 'v2-personalidades-votos'

/** Lunes de la semana en curso, en ISO. Es la clave con la que caducan los
    votos: al cambiar de lunes, el objeto guardado deja de coincidir y se
    descarta entero. */
function semana(): string {
  const d = new Date()
  const dia = (d.getDay() + 6) % 7 // lunes = 0
  d.setDate(d.getDate() - dia)
  return d.toISOString().slice(0, 10)
}

type Voto = 1 | -1
type Guardado = { semana: string; votos: Record<string, Voto> }

export function ListaPersonas({ personas, base }: { personas: Persona[]; base: number }) {
  const [votos, setVotos] = useState<Record<string, Voto>>({})
  const [listo, setListo] = useState(false)

  /* Se lee después de montar y no en el primer render: el servidor no tiene
     localStorage, y pintar un voto en el cliente que el HTML servido no tiene
     es un desajuste de hidratación. Hasta que carga, los botones van sin
     marcar, que es el estado del HTML del servidor. */
  useEffect(() => {
    try {
      const g: Guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}')
      if (g.semana === semana()) setVotos(g.votos || {})
    } catch {
      /* storage bloqueado o basura adentro: se arranca sin votos */
    }
    setListo(true)
  }, [])

  function votar(slug: string, v: Voto) {
    setVotos((prev) => {
      const sig = { ...prev }
      /* Clickear el voto que ya está puesto lo saca. Sin eso, quien se
         equivoca queda atrapado con su voto hasta el lunes. */
      if (sig[slug] === v) delete sig[slug]
      else sig[slug] = v
      try {
        localStorage.setItem(CLAVE, JSON.stringify({ semana: semana(), votos: sig }))
      } catch {
        /* si no se puede guardar, el voto vale para esta sesión y nada más */
      }
      return sig
    })
  }

  /* El conteo de muestra es determinista por slug: la maqueta tiene que verse
     igual en cada carga, o parece que los números se inventan solos. */
  const conteo = useMemo(() => {
    const m: Record<string, number> = {}
    for (const p of personas) {
      let h = 0
      for (const c of p.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
      m[p.slug] = (h % 61) - 24
    }
    return m
  }, [personas])

  /* POSICIÓN CON EMPATES. Numerar 30, 31, 32… cuando dieciséis personas tienen
     el mismo 7,3 afirma un orden que el dato no tiene, y en un ranking donde
     cada uno se busca a sí mismo ese es el peor error posible: nadie acepta
     estar 44.º empatado con el 30.º. Se usa la numeración de competencia —los
     empatados comparten puesto y el siguiente salta— que es la convención de
     cualquier tabla deportiva. */
  const puestos = useMemo(() => {
    const m: Record<string, number> = {}
    let ultimo = 0
    personas.forEach((p, i) => {
      if (i === 0 || p.indice !== personas[i - 1].indice) ultimo = i + 1
      m[p.slug] = ultimo
    })
    return m
  }, [personas])

  return (
    <>
      {/* Los rótulos de columna. Sin ellos el número y los chevrones no se
          sabe qué son — el badge podía leerse como un precio o un porcentaje.
          Los anchos repiten los de la fila para que caigan a plomo. */}
      <div className="s-pcab hidden sm:flex">
        <span className="w-7 shrink-0" />
        <span className="w-[60px] shrink-0" />
        <span className="min-w-0 flex-1">Persona</span>
        <span className="w-[56px] shrink-0 text-right">Índice</span>
        <span className="w-[100px] shrink-0 text-right">Votación semanal</span>
      </div>
      {personas.map((p, i) => {
        const mio = votos[p.slug]
        const empata =
          (i > 0 && personas[i - 1].indice === p.indice) ||
          (i < personas.length - 1 && personas[i + 1].indice === p.indice)
        const n = conteo[p.slug] + (mio ?? 0)
        return (
          <div key={p.slug} className="s-persona">
            <span
              className="s-mono w-7 shrink-0 text-[11px]"
              style={{ color: 'var(--ink-3)' }}
              /* El «=» delante marca el empate. Es la notación de las tablas
                 de posiciones y ocupa un carácter, así que la columna no
                 cambia de ancho entre una fila y la siguiente. */
              title={empata ? 'Empatado en este puesto' : undefined}
            >
              {empata ? '=' : '\u00a0'}
              {String(puestos[p.slug]).padStart(2, '0')}
            </span>

            {/* La cara es un ancla de identidad, no una foto: 32px, que es lo
                que deja la fila en la altura del resto de las listas del sitio.
                Cuando no hay imagen cae al monograma, que es la misma pieza que
                usa la lista de empresas. */}
            <Cara slug={p.slug} nombre={p.nombre} />

            {/* Tres renglones —nombre, cargo, empresa— y no dos: 19,5 + 17,25
                + 17,25 llenan el alto de la foto de 60. En dos, la foto quedaba
                23px más alta que la columna que acompaña. */}
            <span className="s-pcuerpo">
            <span className="flex min-w-0 flex-1 flex-col justify-center">
              <span className="s-cuerpo flex items-center gap-1.5 font-medium">
                <span className="truncate">{p.nombre}</span>
                {/* El cargo sin confirmar se marca. Es más honesto que
                    esconderlo y que publicarlo como si estuviera verificado. */}
                {!p.confirmado && (
                  <span
                    className="s-chip s-chip--neutro s-chip--mini shrink-0"
                    title="El cargo lo sugiere una sola fuente y no está verificado"
                  >
                    sin confirmar
                  </span>
                )}
              </span>
              <span className="s-micro block truncate" style={{ color: 'var(--ink-2)' }}>
                {p.cargo || '—'}
              </span>
              {/* La empresa en ink-2 y no en ink-3: medido daba 2,72 en claro.
                  ink-3 es para metadata que nadie necesita leer —un número de
                  sección, una unidad— y qué empresa dirige esta persona es el
                  dato que sostiene toda la fila. Queda del mismo tono que el
                  cargo, que es correcto: los dos son el contexto del nombre. */}
              <span className="s-micro block truncate" style={{ color: 'var(--ink-2)' }}>
                {p.empresa}
              </span>
            </span>

            <span className="s-pcontrol">
            <span className="s-idx shrink-0">{formatDecimal(p.indice, 1)}</span>

            <span className="s-voto shrink-0">
              <span className="n">
                {n > 0 ? '+' : ''}
                {n}
              </span>
              <span className="par">
                <button
                  type="button"
                  className="arriba"
                  aria-pressed={listo && mio === 1}
                  aria-label={`Votar a favor de ${p.nombre}`}
                  onClick={() => votar(p.slug, 1)}
                >
                  <Icono d="M18 15l-6-6-6 6" size={14} grosor={2.4} />
                </button>
                <button
                  type="button"
                  className="abajo"
                  aria-pressed={listo && mio === -1}
                  aria-label={`Votar en contra de ${p.nombre}`}
                  onClick={() => votar(p.slug, -1)}
                >
                  <Icono d="M6 9l6 6 6-6" size={14} grosor={2.4} />
                </button>
              </span>
            </span>
            </span>
            </span>
          </div>
        )
      })}
    </>
  )
}

/** La cara, con caída al monograma. El `onError` es la caída de verdad: el
    archivo puede no estar —las imágenes no se versionan— y una cara rota es
    peor que dos iniciales. */
function Cara({ slug, nombre }: { slug: string; nombre: string }) {
  const [rota, setRota] = useState(false)
  const ini = nombre
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('')
    .toUpperCase()

  if (rota) return <span className="s-cara s-cara--mono">{ini}</span>
  return (
    <img
      className="s-cara"
      src={`/images/ceos/${slug}.jpg`}
      alt=""
      width={200}
      height={200}
      loading="lazy"
      decoding="async"
      onError={() => setRota(true)}
    />
  )
}
