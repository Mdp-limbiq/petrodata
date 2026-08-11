'use client'

import { useState } from 'react'

/* Logo de empresa: favicon de Google resuelto desde el dominio, con
   fallback a la inicial en caja. Radio 4px — el mismo de la bandera
   argentina de Indicadores, que es el otro gráfico chico embebido del
   sistema (8px sería demasiado sobre 28px). El fondo blanco de la placa
   es funcional, no decorativo: los favicons se diseñan asumiendo fondo
   claro y un PNG transparente desaparecería en tema oscuro. */

const DIM: Record<'sm' | 'md' | 'lg', string> = { sm: 'size-7', md: 'size-9', lg: 'size-12' }
const TXT: Record<'sm' | 'md' | 'lg', string> = { sm: 'text-[11px]', md: 'text-sm', lg: 'text-lg' }

function faviconFrom(website: string | null | undefined): string | null {
  if (!website) return null
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  } catch {
    return null
  }
}

export function CompanyLogo({
  name,
  website,
  size = 'md',
  className = '',
}: {
  name: string
  website?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = faviconFrom(website)

  if (!src || failed) {
    return (
      <span
        className={`grid ${DIM[size]} ${TXT[size]} shrink-0 place-items-center rounded-[4px] border border-line-strong font-display font-semibold text-primary ${className}`}
        aria-hidden
      >
        {(name.trim().charAt(0) || '?').toUpperCase()}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className={`${DIM[size]} shrink-0 rounded-[4px] border bg-white object-contain p-0.5 ${className}`}
    />
  )
}
