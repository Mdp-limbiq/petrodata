'use client'

import { useState } from 'react'

/* Port 1:1 de CompanyLogo de producción: favicon de Google resuelto
   desde el dominio de la empresa, con fallback a la inicial en caja. */

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
        className={`grid ${DIM[size]} ${TXT[size]} shrink-0 place-items-center border ${className}`}
        style={{ borderColor: 'var(--nd-border-visible)', color: 'var(--nd-text-display)' }}
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
      className={`${DIM[size]} shrink-0 border bg-white object-contain p-0.5 ${className}`}
      style={{ borderColor: 'var(--nd-border)' }}
    />
  )
}
