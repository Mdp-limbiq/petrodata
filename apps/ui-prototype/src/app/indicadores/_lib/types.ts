/* Tipos de la API de inversiones (espejo de frontend/src/api/inversiones.ts
   y del OperatorContributionDto), acotados a lo que la página consume. */

export type InvSource = { label: string; url?: string; asOf: string }

export type InvKpi = {
  id: string
  label: string
  tier: string
  figure: { kind: string; value: number }
  delta?: { pct: number; base: string } | null
  format: { prefix?: string; suffix?: string; decimals: number }
  source: InvSource
}

export type InvSeriePoint = {
  period: string
  oilBblD: number
  gasMm3D?: number | null
  preliminary: boolean
}

export type InvBreakeven = {
  brentUsd: number
  brentAsOf?: string
  referenceUsd: number
  headroomUsd: number
  tier?: string
  series?: { date: string; value: number }[]
  source: InvSource
  referenceSource: { label: string; url?: string }
}

export type InvActividad = {
  unit: string
  source: InvSource
  points: { period: string; nuevosPozos: number; preliminary: boolean }[]
}

export type InvCruce = {
  id: string
  title: string
  unit: string
  source: InvSource
  gdpSource?: { label: string; url?: string } | null
  points: {
    period: string
    agroUsd: number | null
    energiaUsd: number | null
    gdpUsd?: number | null
    agroPctGdp: number | null
    energiaPctGdp: number | null
    tier?: string
  }[]
}

export type InvOperador = {
  slug: string
  name: string
  oilBblD: number
  boe?: number
  sharePct: number
}

export type InvMundoRanking = {
  product: string
  label: string
  unit: string
  year: number
  countries: number
  source: InvSource
  argentina: { rank: number; value: number } | null
  projected: { value: number; rank: number; year: number; tier?: string }
  top: { rank: number; iso3: string; country: string; value: number; isArgentina: boolean }[]
  history?: unknown
}

export type InvMundoGrowth = {
  product: string
  label: string
  unit: string
  sinceYear: number
  toYear: number
  leaders: {
    iso3: string
    country: string
    from: number
    to: number
    growthPct: number
    isArgentina: boolean
  }[]
  argentinaRank: number | null
  source: InvSource
}

export type InvPolicyChart = {
  id: string
  title: string
  unit: string
  kind: 'area' | 'line' | 'bar'
  source: InvSource
  points: { period: string; value: number }[]
}

export type InvPolicyLever = {
  tag: string
  title: string
  chartId?: string | null
  indicator: {
    label: string
    value: number
    format: InvKpi['format']
    tier: string
    delta?: { pct: number; base: string } | null
    source: InvSource
  } | null
  milestone?: string | null
  source?: { label: string; url?: string; asOf?: string } | null
}

export type InvRigi = {
  title: string
  subtitle: string
  count: number
  totalMusd: number
  projects: {
    name: string
    sector: string
    operator?: string | null
    province?: string | null
    investmentMusd: number | null
    approvalDate?: string | null
    sourceUrl?: string | null
  }[]
  source: InvSource
}

export type InvPolitica = {
  intro: { title: string; text: string }
  levers: InvPolicyLever[]
  charts: InvPolicyChart[]
  rigi?: InvRigi | null
  impacto?: {
    headline: string
    items: { label: string; value: number; format: InvKpi['format']; tier: string }[]
    assumptions: {
      priceUsd?: number | null
      priceBasis?: string | null
      todayBblD?: number | null
      targetBblD?: number | null
      gdpUsd?: number | null
      gdpYear?: number | null
    }
    source: InvSource
  } | null
}

export type InvMundo = {
  source: { label: string; url?: string; asOf?: string }
  rankings: InvMundoRanking[]
  fastestGrowing: InvMundoGrowth[]
  shale?: unknown
  politica?: InvPolitica
}

export type Contribution = {
  window: { from: string; to: string; months: number }
  totals: {
    oil_bbl: number
    gas_mcf: number
    boe: number
    gross_value_usd: number
    gross_value_annualized_usd: number
    royalties_usd: number
    energy_exports_usd: number | null
    gdp_usd: number | null
    gdp_year: number | null
    value_share_of_gdp: number | null
  }
  assumptions: {
    brent_avg_usd_bbl: number | null
    oil_discount_usd_bbl: number
    gas_pist_avg_usd_mmbtu: number | null
    mcf_to_mmbtu: number
    royalty_rate: number
  }
  operators: {
    operator_slug: string
    operator_name: string
    oil_bbl: number
    gas_mcf: number
    boe: number
    share_boe: number
    share_oil: number
    share_gas: number
    oil_value_usd: number
    gas_value_usd: number
    gross_value_usd: number
    gross_value_annualized_usd: number
    attributed_exports_usd: number | null
    royalties_usd: number
    value_share_of_gdp: number | null
  }[]
}
