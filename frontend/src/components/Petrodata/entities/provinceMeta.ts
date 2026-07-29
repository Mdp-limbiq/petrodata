// Static per-province design data: basin, accent colour and reference coords.
// Provinces missing from the map render without a photo or accent.
// Photos live at /images/provinces/prov-<slug>.jpg for every slug listed here.
export type ProvinceMeta = { basin: string; accent: string; coords: string }

export const PROVINCE_META: Record<string, ProvinceMeta> = {
  neuquen: { basin: 'neuquina', accent: '#3fb883', coords: '38.95°S 68.06°W' },
  chubut: { basin: 'golfoSanJorge', accent: '#e2a33f', coords: '45.86°S 67.48°W' },
  'santa-cruz': { basin: 'golfoSanJorge', accent: '#38b6b6', coords: '46.44°S 68.53°W' },
  mendoza: { basin: 'cuyana', accent: '#9b7ede', coords: '32.89°S 68.85°W' },
  'rio-negro': { basin: 'neuquina', accent: '#4a90e2', coords: '40.81°S 62.99°W' },
  'estado-nacional': { basin: 'pais', accent: '#e2703f', coords: '39.50°S 60.50°W' },
  'la-pampa': { basin: 'neuquina', accent: '#9b7ede', coords: '36.62°S 64.29°W' },
  'tierra-del-fuego': { basin: 'austral', accent: '#38b6b6', coords: '53.79°S 67.70°W' },
  salta: { basin: 'noroeste', accent: '#e2a33f', coords: '24.78°S 65.41°W' },
  formosa: { basin: 'noroeste', accent: '#4a90e2', coords: '26.18°S 58.18°W' },
  jujuy: { basin: 'noroeste', accent: '#e2703f', coords: '24.19°S 65.30°W' },
}

export const provincePhoto = (slug: string): string | null =>
  PROVINCE_META[slug] ? `/images/provinces/prov-${slug}.jpg` : null
