'use client'

import { useEffect, useRef } from 'react'
import maplibregl, { Map as MLMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/* MapShell — wrapper único de MapLibre (absorbe el boilerplate ×6 de producción:
   basemap Carto por tema, atribución, sin copias del mundo). El caller recibe
   la instancia en onReady y agrega sources/layers. */

const STYLE = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

export function MapShell({
  center = [-68.78, -38.6],
  zoom = 6.4,
  className = 'h-full w-full',
  onReady,
  label,
}: {
  center?: [number, number]
  zoom?: number
  className?: string
  onReady?: (map: MLMap) => void
  label: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    if (!container.current || mapRef.current) return
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLE[theme],
      center,
      zoom,
      renderWorldCopies: false,
      attributionControl: { compact: true },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => onReadyRef.current?.(map))
    mapRef.current = map

    // sigue el toggle de tema en vivo
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      map.setStyle(STYLE[t])
      map.once('styledata', () => onReadyRef.current?.(map))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    /* MapLibre sólo escucha el resize de la ventana, así que si el
       contenedor cambia de alto sin que cambie el viewport —el mapa vive
       en un flex-1 y el panel móvil lo achica al abrirse— el canvas queda
       del tamaño viejo y el mapa se ve recortado. */
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(container.current)

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={container} role="application" aria-label={label} className={className} />
}

export function MapLegend({ items, title }: { items: { color: string; label: string }[]; title?: string }) {
  return (
    <div className="rounded-[10px] border bg-surface/90 px-4 py-3 backdrop-blur-md shadow-[var(--elevation-overlay)]">
      {title && <p className="type-label mb-2">{title}</p>}
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2 text-[11.5px] text-secondary">
            <span aria-hidden className="size-2 rounded-full" style={{ background: it.color }} />
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
