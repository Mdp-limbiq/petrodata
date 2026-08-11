import { COMPANIES, type Company } from '@/fixtures/companies'

/* Cifras derivadas del ranking de empresas. TODAS salen de sumas sobre
   src/fixtures/companies.ts (scrape del 2026-08-11): no hay ningún número
   inventado ni traído de otra fuente.

   Tres guardas de honestidad, porque son los únicos lugares donde este
   dataset puede hacernos mentir:
   1. El múltiplo valor/producción sólo se calcula para las que tienen
      ≥1% nacional: abajo de eso el redondeo a un decimal fabrica ratios
      falsos (0,3 → 0,6 se leería "×2,00" y es puro ruido de redondeo).
   2. Las columnas NO suman 100 (producción 99,0 · valor 98,0) por
      redondeo: cualquier acumulada declara su base, nunca inventa el resto.
   3. No existe la categoría "extranjera vs local": no es un campo de la
      fixture y clasificar a mano sería inventar dato. */

/** Umbral para considerar a una empresa "grande" y comparar sus ratios. */
export const UMBRAL_GRANDE = 1

const suma = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** El ranking se ordena por participación en la producción nacional
    (decisión de Mariano, 2026-08-11: antes ordenaba por cantidad de pozos,
    lo que dejaba a la 2ª productora del país en la fila 19). */
export const RANKED: Company[] = [...COMPANIES].sort((a, b) => b.pctNacional - a.pctNacional)

/** Puesto por empresa, calculado sobre el set COMPLETO: no se renumera
    al filtrar ni al buscar (el puesto es de la empresa, no de la vista). */
export const RANK_BY_SLUG: Record<string, number> = Object.fromEntries(
  RANKED.map((c, i) => [c.slug, i + 1]),
)

const grandes = RANKED.filter((c) => c.pctNacional >= UMBRAL_GRANDE)
const cola = RANKED.filter((c) => c.pctNacional < UMBRAL_GRANDE)
const cotizan = RANKED.filter((c) => c.isPublic)
const pozosTotales = suma(COMPANIES.map((c) => c.proyectos))

/* Mediana, no promedio: la distribución de pozos está tan sesgada que el
   promedio (512) no describe a ninguna empresa real — la mitad del padrón
   opera 102 pozos o menos, y una sola opera 5.725. */
const pozosOrdenados = COMPANIES.map((c) => c.proyectos).sort((a, b) => a - b)
const mitad = Math.floor(pozosOrdenados.length / 2)
const pozosMediana =
  pozosOrdenados.length % 2
    ? pozosOrdenados[mitad]
    : (pozosOrdenados[mitad - 1] + pozosOrdenados[mitad]) / 2

export const STATS = {
  empresas: COMPANIES.length,
  pozosTotales,
  pozosMediana,
  pozosMax: pozosOrdenados[pozosOrdenados.length - 1],
  /** las que superan el umbral: 11 empresas */
  grandes: grandes.length,
  pctGrandes: suma(grandes.map((c) => c.pctNacional)),
  /** la cola larga: 41 empresas */
  cola: cola.length,
  pctCola: suma(cola.map((c) => c.pctNacional)),
  pozosCola: suma(cola.map((c) => c.proyectos)),
  pctPozosCola: (suma(cola.map((c) => c.proyectos)) / pozosTotales) * 100,
  /** sin producción declarada pero con pozos operados */
  sinProduccion: RANKED.filter((c) => c.pctNacional === 0).length,
  pozosSinProduccion: suma(RANKED.filter((c) => c.pctNacional === 0).map((c) => c.proyectos)),
  cotizan: cotizan.length,
  pctCotizan: suma(cotizan.map((c) => c.pctNacional)),
  pctValorCotizan: suma(cotizan.map((c) => c.pctValor)),
  top5: suma(RANKED.slice(0, 5).map((c) => c.pctNacional)),
  top10: suma(RANKED.slice(0, 10).map((c) => c.pctNacional)),
  /** base real de cada columna: no suman 100 por redondeo */
  baseNacional: suma(COMPANIES.map((c) => c.pctNacional)),
  baseValor: suma(COMPANIES.map((c) => c.pctValor)),
  lider: RANKED[0],
  segunda: RANKED[1],
}

/** Curva de concentración acumulada sobre las primeras N empresas. */
export const ACUMULADA = RANKED.slice(0, 12).map((c, i) => ({
  n: i + 1,
  name: c.name,
  slug: c.slug,
  pct: c.pctNacional,
  acum: suma(RANKED.slice(0, i + 1).map((x) => x.pctNacional)),
}))

export type Brecha = {
  slug: string
  name: string
  pctNacional: number
  pctValor: number
  /** >1 = captura más valor del que produce (crudo) · <1 = menos (gas) */
  ratio: number
  /** diferencia en puntos porcentuales, el dato sin normalizar */
  puntos: number
}

/** Brecha entre lo que una empresa produce y el valor que captura: es la
    huella de su mezcla crudo/gas. Sólo las grandes (ver guarda 1). */
export const BRECHAS: Brecha[] = grandes
  .map((c) => ({
    slug: c.slug,
    name: c.name,
    pctNacional: c.pctNacional,
    pctValor: c.pctValor,
    ratio: c.pctValor / c.pctNacional,
    puntos: c.pctValor - c.pctNacional,
  }))
  .sort((a, b) => b.ratio - a.ratio)

export type Productividad = {
  slug: string
  name: string
  pozos: number
  pctNacional: number
  /** puntos de producción nacional por cada 100 pozos operados */
  por100: number
}

/** Cuánta producción aporta cada 100 pozos: entre las grandes varía casi
    veinte veces, que es la razón por la que "más pozos" no es "más producción". */
export const PRODUCTIVIDAD: Productividad[] = grandes
  .map((c) => ({
    slug: c.slug,
    name: c.name,
    pozos: c.proyectos,
    pctNacional: c.pctNacional,
    por100: (c.pctNacional / c.proyectos) * 100,
  }))
  .sort((a, b) => b.por100 - a.por100)

/** Las que cotizan, ordenadas por producción. */
export const COTIZAN = cotizan
