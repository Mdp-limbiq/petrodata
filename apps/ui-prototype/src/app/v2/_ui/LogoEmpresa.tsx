'use client'

import { useState } from 'react'

/* Logo de empresa. Tres escalones de disponibilidad, los mismos que usa el
   prototipo Estrato y producción:

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

   El logo es lo ÚNICO de esta página que lleva color de marca, y a diferencia
   de las miniaturas de noticias no va lavado a blanco y negro. No contradice la
   regla de que sólo el dato lleva color: un logo no es un dato coloreado, es
   identidad, y lavarlo lo volvería irreconocible, que es lo único que tiene que
   hacer. */

function faviconDe(website?: string): string | null {
  if (!website) return null
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname
    /* sz=128 pide lo mejor que Google tenga, aunque para varias no haya nada
       mejor: YPF y TotalEnergies devuelven 16x16 con cualquier tamaño pedido, y
       sus propios sitios tampoco sirven otra cosa —verificado contra
       ypf.com/favicon.ico y el favicon.png de totalenergies.com, los dos de
       16—. Pedir 128 sigue valiendo la pena para las que sí tienen un ícono
       grande, como PAE. */
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
  caja = 20,
}: {
  nombre: string
  website?: string
  logoUrl?: string
  /** lado de la placa en px. 20 es la caja de .s-marca; 56, la de la miniatura
      de noticias. Va en píxeles y no en aspect-ratio, que el sistema prohíbe. */
  caja?: number
}) {
  const [falló, setFalló] = useState(false)
  /* El ancho natural del archivo, para no estirarlo. Casi todos los favicons
     son de 16px y una placa de 56 los ampliaría 3,5 veces: quedan como un
     borrón. Dibujados hasta el DOBLE de su tamaño natural se ven chicos dentro
     de la placa, pero nítidos, que es lo único que hace falta para reconocer
     una marca. Los que sí traen un ícono grande —PAE, 128px— la llenan. */
  const [natural, setNatural] = useState<number | null>(null)
  const src = logoUrl ?? faviconDe(website)
  const útil = caja - 8 // el aire de la placa: 4px por lado

  const placa = {
    display: 'inline-flex' as const,
    width: caja,
    height: caja,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    /* El radio sube con la caja, como manda la regla: 6 es el del chip y 8 el
       del control, que es el que usan las miniaturas de noticias. */
    borderRadius: caja >= 40 ? 'var(--radius-control)' : 6,
  }

  if (!src || falló) {
    return (
      <span
        aria-hidden
        className="shrink-0"
        style={{
          ...placa,
          background: 'var(--field)',
          color: 'var(--ink-2)',
          /* 650 es la compensación óptica medida del sistema: a este tamaño un
             600 se ve más liviano de lo que corresponde. */
          fontSize: Math.round(caja / 2),
          fontWeight: 650,
        }}
      >
        {monograma(nombre)}
      </span>
    )
  }
  return (
    <span
      className="shrink-0"
      style={{ ...placa, background: '#fff', boxShadow: 'var(--shadow-hairline)', overflow: 'hidden' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={(e) => setNatural(e.currentTarget.naturalWidth || null)}
        onError={() => setFalló(true)}
        style={{
          width: natural ? Math.min(útil, natural * 2) : útil,
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </span>
  )
}
