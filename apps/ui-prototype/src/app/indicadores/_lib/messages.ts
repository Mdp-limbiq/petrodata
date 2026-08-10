/* Textos ES de producción (frontend/src/messages/es.json → namespace
   "indicadores"), con un shim mínimo de la API de next-intl para que los
   componentes portados queden idénticos al código real. */

const MESSAGES = {
 "eyebrow": "Tesis de inversión",
 "title": "Indicadores",
 "blurb": "La oportunidad de Vaca Muerta en números: cada cifra se computa a partir de datos oficiales de producción y exportación, con su fuente y fecha de corte. Sin proyecciones sin respaldo.",
 "asOf": "Datos al {month}",
 "source": "Fuente",
 "computedBy": "Computado por vacamuerta.io a partir de {source}",
 "sourceLatest": "Computado por vacamuerta.io · último dato disponible {date}",
 "operatorsTitle": "Operadores principales",
 "contribution": {
  "title": "Contribución económica por operadora",
  "blurb": "Cuánto aporta la operación de cada empresa al país: valor bruto de producción en dólares, regalías provinciales y exportaciones de energía atribuidas según su participación en la producción.",
  "grossValue": "Valor bruto de producción",
  "annualizedNote": "anualizado",
  "windowNote": "últimos {months} meses",
  "ofGdp": "% del PBI ({year})",
  "royalties": "Regalías (12%)",
  "exports": "Exportaciones de energía",
  "colOperator": "Operadora",
  "colShare": "Part. BOE",
  "colValueShare": "Part. US$",
  "colGross": "Valor bruto",
  "colRoyalties": "Regalías",
  "colExports": "Expo. atribuidas",
  "methodology": "Metodología: volúmenes oficiales (Secretaría de Energía) por operadora, ventana {from} a {to}. Petróleo valuado a Brent (promedio US$ {brent}/bbl) menos US$ {discount}/bbl de descuento por calidad; gas al precio PIST promedio ponderado (US$ {pist}/MMBtu). Regalías a la alícuota legal del {royalty}% sobre el valor en boca de pozo. Exportaciones de energía (INDEC) atribuidas pro rata por participación en BOE: son estimaciones, no cifras contables de cada empresa."
 },
 "transportTitle": "Infraestructura de transporte",
 "transportBlurb": "La red troncal que evacúa la producción: gasoductos de transporte por operador y oleoductos troncales. Geometría y trazas oficiales — sin datos de caudal en la fuente.",
 "transportNetwork": "Red troncal",
 "transportGas": "Gasoductos",
 "transportOil": "Oleoductos",
 "transportSegments": "{count} tramos",
 "transportByOperator": "Gasoductos de transporte por operador",
 "kmUnit": "km",
 "worldTitle": "Argentina en el mundo",
 "worldBlurb": "Dónde está Argentina hoy entre los productores del mundo, y a dónde la lleva Vaca Muerta si la proyección se realiza. El salto en el ranking, con datos de la EIA.",
 "tiers": {
  "confirmado": "Confirmado",
  "en_marcha": "En marcha",
  "proyectado": "Proyectado",
  "referencia": "Referencia"
 },
 "charts": {
  "noProduction": "Sin datos de producción.",
  "noActivity": "Sin datos de actividad.",
  "noTrade": "Sin datos de comercio.",
  "noBrent": "Sin serie histórica de Brent.",
  "preliminary": "preliminar",
  "preliminaryPartial": "Dato preliminar (mes parcial)",
  "wells": "pozos",
  "agro": "Agro",
  "agroLegend": "Agro (primarios + MOA)",
  "energy": "Energía",
  "pctGdpSuffix": "% PBI",
  "breakevenHeadroom": "Headroom sobre breakeven"
 },
 "world": {
  "unitTbpd": "mil bbl/d",
  "unitBcf": "BCF/año",
  "worldProduction": "{label} · producción mundial",
  "countriesYear": "{countries} países · {year}",
  "today": "Hoy",
  "projectedYear": "Proyectado {year}",
  "placesJump": "+{jump} puestos",
  "computed": "Computado · {source}",
  "reference": "Referencia · {source}",
  "fastestGrowing": "{label} · productores de mayor crecimiento",
  "growthBlurb": "Entre los grandes productores, Argentina es de los que más rápido crece{rank} — el ritmo que la proyección extiende.",
  "growthRank": " (puesto {rank})",
  "impactKicker": "Impacto · si la proyección se realiza",
  "assumptions": "Supuestos:",
  "assumptionPrice": " precio de exportación US${price}/bbl ({basis});",
  "assumptionProd": " producción {from} → {to} bbl/d;",
  "assumptionGdp": " PBI US${gdp} B ({year}).",
  "illustrative": "Proyección ilustrativa, no es un pronóstico.",
  "seeChart": "↑ ver gráfico",
  "rigiCount": "{count} proyectos · US${total} B",
  "sectorOil": "petróleo",
  "sectorGas": "gas",
  "policyFallbackTitle": "La política que convierte potencial en producción",
  "policyFallbackText": "El recurso ya existe. Lo que cambió es el marco: las medidas actuales destraban la inversión necesaria para que la proyección se realice — y con ella, el salto en el ranking mundial.",
  "leverFxTag": "Cambiario",
  "leverFxTitle": "Normalización del tipo de cambio y acceso a divisas para exportadores",
  "leverExportsTag": "Exportación",
  "leverExportsTitle": "Fin de los cupos y retenciones a la exportación de crudo y gas",
  "leverRigiTag": "RIGI",
  "leverRigiTitle": "Régimen de Incentivo a Grandes Inversiones: estabilidad fiscal a 30 años",
  "leverFiscalTag": "Fiscal",
  "leverFiscalTitle": "Disciplina fiscal y desregulación que anclan la previsibilidad de inversión"
 },
 "breakevenTitle": "Margen sobre el breakeven",
 "actividadTitle": "Actividad: pozos nuevos por mes",
 "cruceBlurb": "Exportaciones anuales en dólares. La energía gana peso frente al agro a medida que Vaca Muerta escala.",
 "cruceModeLabel": "Unidad",
 "cruceModeUsd": "US$",
 "cruceModeGdp": "% del PBI",
 "ctaTitle": "¿Querés invertir o establecer operaciones?",
 "ctaBody": "Trabajamos con inversores y operadores que buscan exposición al shale argentino. Escribinos para coordinar una conversación.",
 "ctaContact": "Contacto",
 "ctaNewsletter": "O recibí actualizaciones",
 "noData": "Los indicadores de inversión no están disponibles en este momento.",
 "thesisLabel": "La tesis en seis datos",
 "dayValue": {
  "label": "Valor de un día de Vaca Muerta",
  "perDay": "por día",
  "perYear": "al año",
  "ofGdp": "del PBI",
  "anchorBasis": "Valor bruto de producción · últimos {months} meses · petróleo a Brent menos calidad + gas a PIST",
  "sliderLabel": "Escenario: precio del petróleo (Brent)",
  "scenarioLabel": "A ese precio, sólo el petróleo:",
  "margin": "Margen sobre el breakeven:",
  "avgChip": "Promedio del período US$ {price}",
  "spotChip": "Brent hoy US$ {price}",
  "note": "El escenario valúa sólo el petróleo a Brent menos US$ {discount}/bbl por calidad, sobre el volumen del período; no incluye gas ni descuenta costos o impuestos. Breakeven de referencia: US$ {breakeven}/bbl (YPF)."
 },
 "vmCard": {
  "label": "Formación",
  "title": "Vaca Muerta",
  "oilShare": "del petróleo nacional",
  "gasShare": "del gas nacional",
  "wells": "pozos activos"
 }
} as const

function lookup(key: string): string {
  let cur: unknown = MESSAGES
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part]
    } else return key
  }
  return typeof cur === 'string' ? cur : key
}

export type T = (key: string, values?: Record<string, string | number>) => string

/** Igual firma que next-intl: useTranslations('indicadores.dayValue') */
export function useTranslations(ns: string): T {
  const prefix = ns.replace(/^indicadores\.?/, '')
  return (key, values) => {
    let s = lookup(prefix ? `${prefix}.${key}` : key)
    if (values) for (const [k, v] of Object.entries(values)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
}

/** Versión server (misma cosa, async como en next-intl/server) */
export async function getTranslations(ns: string): Promise<T> {
  return useTranslations(ns)
}
