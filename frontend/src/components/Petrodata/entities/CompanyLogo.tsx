'use client'

import { useState } from 'react'

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

/** Company logo: favicon (or provided logo_url) with a first-letter fallback. */
export function CompanyLogo({
  name,
  logoUrl,
  website,
  size = 'md',
  className = '',
}: {
  name: string
  logoUrl?: string | null
  website?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = logoUrl || faviconFrom(website)

  if (!src || failed) {
    return (
      <span
        className={`grid ${DIM[size]} ${TXT[size]} shrink-0 place-items-center border border-nd-border-visible font-display text-nd-text-display ${className}`}
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
      className={`${DIM[size]} shrink-0 border border-nd-border bg-white object-contain p-0.5 ${className}`}
    />
  )
}
