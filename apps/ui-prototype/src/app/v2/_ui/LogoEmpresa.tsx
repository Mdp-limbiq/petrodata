'use client'

import { useState } from 'react'

/* Logo de empresa, en la caja de .s-marca: 20×20 con radio 6. Los tres
   escalones son los mismos que usa el prototipo Estrato y producción:

   1. `logoUrl` — el ícono resuelto a mano del sitio de la empresa. Hace falta
      porque el servicio de favicons de Google devuelve 404 para casi todos los
      .com.ar chicos: tener sitio no alcanza, Google además tiene que haberlo
      indexado.
   2. favicon de Google derivado de `website`, que sí funciona para las marcas
      grandes —YPF, Shell, Chevron, TotalEnergies—.
   3. Monograma. No es un "logo faltante": es la marca por defecto, con el mismo
      peso visual que un logo real para que la fila no se vea rota.

   El fondo blanco de la placa es funcional y no decorativo: los favicons se
   dibujan asumiendo fondo claro, y un PNG con transparencia desaparecería en
   tema oscuro. Es la única superficie del sistema que no cambia entre temas, y
   por eso va con el color literal y no con --surface.

   El logo es lo ÚNICO de esta página que lleva color de marca. No contradice la
   regla de que sólo el dato lleva color: un logo no es un dato coloreado, es
   identidad, y a 20px no compite con nada. */

function faviconDe(website?: string): string | null {
  if (!website) return null
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname
    /* sz=128 pide lo mejor que Google tenga, aunque para varias no haya nada
       mejor: YPF y TotalEnergies devuelven 16x16 con cualquier tamaño pedido, y
       sus propios sitios tampoco sirven otra cosa —lo verifiqué contra
       ypf.com/favicon.ico y el favicon.png de totalenergies.com, los dos de
       16—. A 20px de placa se ven algo blandos y no hay nada que hacerle sin
       inventar una fuente de logos. Pedir 128 sigue valiendo la pena: las que
       sí tienen un ícono grande, como PAE, lo aprovechan. */
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  } catch {
    return null
  }
}

/** Inicial de marca: saltea la forma societaria (S.A., SRL, SAU…) y toma la
    primera letra útil del nombre. */
function monograma(nombre: string): string {
  const limpio = nombre
    .replace(/\b(S\.?A\.?S?|S\.?R\.?L\.?|SAU|SAPEM|S\.?E\.?|LTD\.?)\b/gi, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
  return (limpio.charAt(0) || nombre.charAt(0) || '?').toUpperCase()
}

export function LogoEmpresa({
  nombre,
  website,
  logoUrl,
}: {
  nombre: string
  website?: string
  logoUrl?: string
}) {
  const [falló, setFalló] = useState(false)
  const src = logoUrl ?? faviconDe(website)

  if (!src || falló) {
    return (
      <span className="s-marca" aria-hidden>
        {monograma(nombre)}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      onError={() => setFalló(true)}
      className="shrink-0"
      style={{
        width: 20,
        height: 20,
        padding: 2,
        borderRadius: 6,
        background: '#fff',
        boxShadow: 'var(--shadow-hairline)',
        objectFit: 'contain',
      }}
    />
  )
}
