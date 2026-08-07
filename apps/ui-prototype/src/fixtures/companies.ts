/* EMPRESAS REALES de vacamuerta.io/companies (2026-08-05): las 52 del ranking,
   con sector, % nacional, % del valor (US$) y proyectos. Los precios de cotización
   son ilustrativos (el listado real no los muestra; la ficha real sí). */

export type Company = {
  rank: number
  slug: string
  name: string
  listing: 'NYSE' | 'BCBA' | 'Privada'
  sector: string
  pctNacional: number
  pctValor: number
  proyectos: number
  ticker?: string
  price?: number
  change?: number
  blurb?: string
}

const c = (
  rank: number,
  name: string,
  listing: Company['listing'],
  pctNacional: number,
  pctValor: number,
  proyectos: number,
  extra?: Partial<Company>,
): Company => ({
  rank,
  slug:
    extra?.slug ??
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
  name,
  listing,
  sector: 'Petróleo & Gas',
  pctNacional,
  pctValor,
  proyectos,
  ...extra,
})

export const COMPANIES: Company[] = [
  c(1, 'YPF S.A.', 'NYSE', 34.2, 45.6, 5725, { slug: 'ypf', ticker: 'YPF', price: 27.4, change: 0.021, blurb: 'La mayor operadora del país y ancla del desarrollo de Vaca Muerta.' }),
  c(2, 'PAN AMERICAN ENERGY SL', 'Privada', 10.9, 10.9, 4471, { slug: 'pan-american-energy', blurb: 'Integrada privada líder, del Golfo San Jorge al gas de Vaca Muerta.' }),
  c(3, 'CGC (Compañía General de Combustibles)', 'Privada', 2.6, 1.9, 1521, { slug: 'cgc' }),
  c(4, 'PETROQUIMICA COMODORO RIVADAVIA S.A.', 'Privada', 0.6, 0.9, 1312),
  c(5, 'PATAGONIA RESOURCES S.A.', 'Privada', 0.3, 0.5, 1256),
  c(6, 'Clear Petroleum S.A.', 'Privada', 0.3, 0.6, 1177),
  c(7, 'ROCH S.A.', 'Privada', 0.3, 0.4, 1123),
  c(8, 'PETROLEOS SUDAMERICANOS S.A.', 'Privada', 0.9, 1.7, 1083),
  c(9, 'QUINTANA E&P ARGENTINA S.R.L.', 'Privada', 0.9, 0.8, 859),
  c(10, 'Pluspetrol S.A.', 'Privada', 8.4, 7.7, 840, { slug: 'pluspetrol', blurb: 'Gas rico en La Calera y expansión en la ventana húmeda.' }),
  c(11, 'CAPEX S.A.', 'BCBA', 1.2, 1.3, 740, { ticker: 'CAPX' }),
  c(12, 'Petrolera Aconcagua Energía S.A.', 'Privada', 0.5, 0.7, 722),
  c(13, 'CROWN POINT ENERGIA S.A.', 'Privada', 0.3, 0.6, 697),
  c(14, 'COMPAÑÍAS ASOCIADAS PETROLERAS S.A.', 'Privada', 0.7, 1.3, 673),
  c(15, 'PECOM SERVICIOS ENERGIA SAU', 'Privada', 0.7, 1.4, 618, { slug: 'pecom-servicios-energia' }),
  c(16, 'OILSTONE ENERGIA S.A.', 'Privada', 0.3, 0.2, 491),
  c(17, 'BENTIA ENERGY S.A.', 'Privada', 0.3, 0.4, 418),
  c(18, 'Vista Energy', 'NYSE', 4.4, 7.7, 400, { slug: 'vista', ticker: 'VIST', price: 52.8, change: 0.034, blurb: 'Pure play de shale oil con la mejor curva de eficiencia de la cuenca.' }),
  c(19, 'TotalEnergies', 'NYSE', 11.7, 0.9, 366, { slug: 'totalenergies', ticker: 'TTE', price: 68.3, change: -0.012 }),
  c(20, 'Tecpetrol S.A.', 'Privada', 7.7, 2.4, 349, { slug: 'tecpetrol', blurb: 'Fortín de Piedra: el desarrollo de gas más rápido de la cuenca.' }),
  c(21, 'FLXS OGE S.A', 'Privada', 0.3, 0.0, 314),
  c(22, 'Pampa Energía S.A.', 'NYSE', 5.8, 2.2, 277, { slug: 'pampa', ticker: 'PAM', price: 84.2, change: 0.015 }),
  c(23, 'BREST S.A. DE SERVICIOS PETROLEROS', 'Privada', 0.1, 0.1, 175),
  c(24, 'Shell Argentina', 'NYSE', 2.4, 3.9, 162, { slug: 'shell', ticker: 'SHEL', price: 71.2, change: -0.008, blurb: 'Bandurria Sur y Sierras Blancas, foco en crudo de exportación.' }),
  c(25, 'VENOIL S.A.', 'Privada', 0.2, 0.2, 137),
  c(26, 'Chevron Argentina', 'NYSE', 1.5, 2.1, 122, { slug: 'chevron', ticker: 'CVX', price: 158.9, change: 0.005, blurb: 'Socio histórico de YPF en Loma Campana.' }),
  c(27, 'PETROLERA EL TREBOL S.A.', 'Privada', 0.4, 0.7, 82),
  c(28, 'PETROLERA SANTA MARIA SAU', 'Privada', 0.6, 0.2, 58),
  c(29, 'PAMPETROL S.A.P.E.M', 'Privada', 0.0, 0.0, 46),
  c(30, 'EDHIPSA', 'Privada', 0.0, 0.0, 41),
  c(31, 'MADALENA ENERGY ARGENTINA SRL', 'Privada', 0.0, 0.0, 41),
  c(32, 'Pilgrim Energy S.A.', 'Privada', 0.0, 0.0, 38),
  c(33, 'COLHUE HUAPI S.A.', 'Privada', 0.0, 0.0, 32),
  c(34, 'E.M.E.S.A', 'Privada', 0.0, 0.0, 29),
  c(35, 'HATTRICK ENERGY SAS', 'Privada', 0.1, 0.1, 29),
  c(36, 'INGENIERIA ALPA S.A.', 'Privada', 0.0, 0.0, 27),
  c(37, 'INTEROIL ARGENTINA S A', 'Privada', 0.1, 0.0, 26),
  c(38, 'COPESA CIA CONSTRUCTORA PETROLERA SA', 'Privada', 0.0, 0.0, 25),
  c(39, 'AZRUGE S.A.', 'Privada', 0.0, 0.0, 20),
  c(40, 'VACA MUERTA INVERSIONES SAU', 'Privada', 0.3, 0.4, 18),
  c(41, 'MEDANITO S.A.', 'Privada', 0.0, 0.0, 15),
  c(42, 'JUJUY HIDROCARBUROS SAU', 'Privada', 0.0, 0.0, 11),
  c(43, 'RECURSOS Y ENERGIA FORMOSA S.A.', 'Privada', 0.0, 0.1, 10),
  c(44, 'ALIANZA PETROLERA ARGENTINA S.A.', 'Privada', 0.0, 0.0, 9),
  c(45, 'GeoPark Argentina', 'NYSE', 0.0, 0.1, 9, { slug: 'geopark', ticker: 'GPRK', price: 9.8, change: 0.042 }),
  c(46, 'PATAGONIA ENERGY S.A.', 'Privada', 0.0, 0.0, 9),
  c(47, 'PETROLSUR ENERGIA S.A.', 'Privada', 0.0, 0.0, 9),
  c(48, 'FOMICRUZ S.E.', 'Privada', 0.0, 0.0, 3),
  c(49, 'G Y G OIL SERVICE SRL', 'Privada', 0.0, 0.0, 3),
  c(50, 'GEOPETROL DRILLING S.A.', 'Privada', 0.0, 0.0, 2),
  c(51, 'PETROFARO S.A.', 'Privada', 0.0, 0.0, 2),
  c(52, 'HIGH LUCK GROUP LTD. - SUCURSAL ARGENTINA', 'Privada', 0.0, 0.0, 1),
]
