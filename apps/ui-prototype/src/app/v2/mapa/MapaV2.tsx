'use client'

import type { Map as MLMap } from 'maplibre-gl'
import { MapShell } from '@/ui/map-shell'
import { WELLS } from '@/fixtures/wells'

/* El mapa se reusa tal cual —MapShell ya absorbe el boilerplate de MapLibre—
   y lo único que cambia es la paleta de los clusters, que pasa a los colores
   de estado del sistema: verde, naranja y rojo según la densidad. */

const SOURCE = 'v2-wells'
const VERDE = '#189a4d'
const NARANJA = '#ef720c'
const ROJO = '#e3474c'

export function MapaV2() {
  const handleReady = (map: MLMap) => {
    if (map.getSource(SOURCE)) return
    map.addSource(SOURCE, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: WELLS },
      cluster: true,
      clusterRadius: 40,
      clusterMaxZoom: 12,
    })
    map.addLayer({
      id: `${SOURCE}-clusters`,
      type: 'circle',
      source: SOURCE,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], VERDE, 50, NARANJA, 250, ROJO],
        'circle-radius': ['step', ['get', 'point_count'], 10, 50, 15, 250, 20],
        'circle-opacity': 0.8,
      },
    })
    map.addLayer({
      id: `${SOURCE}-count`,
      type: 'symbol',
      source: SOURCE,
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 10 },
      paint: { 'text-color': '#fff' },
    })
    map.addLayer({
      id: `${SOURCE}-point`,
      type: 'circle',
      source: SOURCE,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': VERDE,
        'circle-radius': 3,
        'circle-opacity': 0.85,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(255,255,255,0.6)',
      },
    })
  }

  return (
    <MapShell
      className="h-full w-full"
      label="Mapa de actividad de la cuenca Neuquina"
      zoom={5.6}
      controlPosition="bottom-right"
      onReady={handleReady}
    />
  )
}
