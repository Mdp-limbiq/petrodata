import { Seccion, Card, CardBarra, CardPie, Medidor, Pie, Marca, FLUIDO } from '../_ui/kit'
import { Pila } from '../_ui/Pila'
import { ListaEmpresas, type FilaEmpresa, type GrupoFiltro } from '../_ui/ListaEmpresas'
import { COMPANIES, type Company } from '@/fixtures/companies'
import { formatDecimal, formatInteger } from '@/lib/format'

/* EMPRESAS — 52 registros.

   La sección va de lo general a lo particular y termina en la lista, no al
   revés: el dato de esta página no es que hay 52 empresas sino que tres
   explican el 56,8% y veintiuna el 0,0%. Una tabla de 52 filas iguales es
   justamente lo que esconde eso, así que la tabla llega tercera.

     01  cómo se reparte   → la pila partida por empresa + los tres tramos
     02  las tres primeras → una card de contexto por cada una
     03  la lista          → la Filter Table (§13) con el buscador de la §15

   La 03 tuvo antes la Records Table (§12), que es la otra receta del catálogo
   para una tabla larga y la que más se parece a esto —su demo es, literalmente,
   una tabla de empresas—. Se cambió por la §13 (pedido de Mariano, 2026-08-17):
   la §12 trae selección con checkbox, y una casilla que se marca sin que haya
   ninguna acción que aplicarle es una promesa que la página no cumple. La §13
   no promete nada de más y encima trae la única animación estructural del
   sistema, el colapso de fila al filtrar. */

/* ── El mix de fluido ────────────────────────────────────────────────────
   No es un dato de la fuente: es la RELACIÓN entre las dos columnas que la
   página ya tenía y que sueltas no decían nada. Si una empresa pesa más en el
   valor en dólares que en la producción, lo que saca es petróleo, que vale
   mucho más por unidad de energía; si pesa menos, es gas.

   TotalEnergies es el caso que lo demuestra: 11,7% de la producción del país y
   0,9% del valor. Vista, al revés: 4,4% y 7,7%.

   Los cortes en 1,2 y 0,8 son míos, y por eso van dichos en el pie de la
   sección. Las 21 empresas que están en 0,0% en las dos columnas no tienen
   relación calculable y quedan SIN clasificar: no se les inventa una categoría
   para que la columna quede completa. */
const MIXTO = '#9a5cff' // el violeta de la paleta categórica medida

function mixDe(c: Company): { rot: string; color?: string; razon?: string } {
  if (c.pctNacional === 0) return { rot: 'sin dato' }
  const r = c.pctValor / c.pctNacional
  const razon = `×${formatDecimal(r, 2)}`
  if (r >= 1.2) return { rot: 'Petróleo', color: FLUIDO.petroleo, razon }
  if (r <= 0.8) return { rot: 'Gas', color: FLUIDO.gas, razon }
  return { rot: 'Mixto', color: MIXTO, razon }
}

const TRAMOS = [
  { rot: 'Con peso propio', nota: '1% o más del país', nivel: 3, test: (c: Company) => c.pctNacional >= 1 },
  { rot: 'Con producción', nota: 'entre 0,1% y 0,9%', nivel: 2, test: (c: Company) => c.pctNacional > 0 && c.pctNacional < 1 },
  { rot: 'Bajo el redondeo', nota: '0,0% a un decimal', nivel: 1, test: (c: Company) => c.pctNacional === 0 },
]

export default function V2Empresas() {
  const orden = COMPANIES.slice().sort(
    (a, b) => b.pctNacional - a.pctNacional || b.proyectos - a.proyectos,
  )
  const pozosTotal = COMPANIES.reduce((s, c) => s + c.proyectos, 0)
  const nacionalTotal = COMPANIES.reduce((s, c) => s + c.pctNacional, 0)
  const cotizan = COMPANIES.filter((c) => c.isPublic)
  const top3 = orden.slice(0, 3).reduce((s, c) => s + c.pctNacional, 0)
  const top10Pct = orden.slice(0, 10).reduce((s, c) => s + c.pctNacional, 0)

  /* La pila lleva un segmento por empresa CON producción. Las 21 en 0,0% no
     tienen ancho —a cero no se puede dibujar nada— y van juntas en un resto
     gris que sí se puede señalar, igual que el Estado Nacional en la lista de
     provincias. */
  const conPeso = orden.filter((c) => c.pctNacional > 0)
  const enCero = COMPANIES.filter((c) => c.pctNacional === 0)
  const pozosEnCero = enCero.reduce((s, c) => s + c.proyectos, 0)

  const segmentos = [
    ...conPeso.map((c) => ({
      clave: c.slug,
      valor: c.pctNacional,
      texto: `${c.name} · ${formatDecimal(c.pctNacional, 1)}%`,
      color: mixDe(c).color,
    })),
    {
      clave: '__resto',
      /* Ancho arbitrario y declarado: su participación es cero, así que no hay
         proporción que respetar. 1 sobre 99 es lo mínimo para que se pueda
         señalar sin mentir sobre su tamaño. */
      valor: 1,
      texto: `${enCero.length} empresas en 0,0% · ${formatInteger(pozosEnCero)} pozos`,
    },
  ]

  const filas: FilaEmpresa[] = orden.map((c) => {
    const m = mixDe(c)
    return {
      slug: c.slug,
      nombre: c.name,
      grupo: m.rot,
      cotiza: c.isPublic,
      nacional: `${formatDecimal(c.pctNacional, 1)}%`,
      nacional_n: c.pctNacional,
      mix: { rot: m.rot, color: m.color },
      pozos: formatInteger(c.proyectos),
      pozos_n: c.proyectos,
    }
  })

  /* Los filtros llevan el recuento al lado, así la barra también es un
     resumen: se ve cuántas hay de cada fluido sin tocar nada. «Cotizan» cruza
     a los otros tres —una petrolera puede cotizar— y por eso va último y
     separado del punto de color, que ahí significa otra cosa. */
  const grupos: GrupoFiltro[] = [
    { id: 'todas', rot: 'Todas', n: COMPANIES.length },
    { id: 'Petróleo', rot: 'Petróleo', color: FLUIDO.petroleo, n: COMPANIES.filter((c) => mixDe(c).rot === 'Petróleo').length },
    { id: 'Gas', rot: 'Gas', color: FLUIDO.gas, n: COMPANIES.filter((c) => mixDe(c).rot === 'Gas').length },
    { id: 'Mixto', rot: 'Mixto', color: MIXTO, n: COMPANIES.filter((c) => mixDe(c).rot === 'Mixto').length },
    { id: 'sin dato', rot: 'Sin dato', n: enCero.length },
    { id: 'cotizan', rot: 'Cotizan', color: 'var(--green)', n: cotizan.length },
  ]

  return (
    <>
      <Seccion
        n="01"
        titulo="Cómo se reparte"
        desc="Tres empresas explican más de la mitad de la producción del país."
      >
        <Card>
          <CardBarra>
            <span className="s-etq">Producción nacional por empresa</span>
            <span className="s-contador ml-auto">{COMPANIES.length}</span>
          </CardBarra>
          <div className="p-3">
            <Pila segmentos={segmentos} />
            <p className="s-micro m-0 mt-2" style={{ color: 'var(--ink-2)' }}>
              Cada segmento es una empresa y su ancho, su participación. El color es el fluido
              que predomina:{' '}
              <b style={{ color: `color-mix(in srgb, ${FLUIDO.petroleo} 55%, var(--ink))`, fontWeight: 500 }}>
                petróleo
              </b>
              ,{' '}
              <b style={{ color: `color-mix(in srgb, ${FLUIDO.gas} 55%, var(--ink))`, fontWeight: 500 }}>
                gas
              </b>{' '}
              o{' '}
              <b style={{ color: `color-mix(in srgb, ${MIXTO} 55%, var(--ink))`, fontWeight: 500 }}>
                mixto
              </b>
              .
            </p>
          </div>
          {TRAMOS.map((t, i) => {
            const g = COMPANIES.filter(t.test)
            const pct = g.reduce((s, c) => s + c.pctNacional, 0)
            const pozos = g.reduce((s, c) => s + c.proyectos, 0)
            return (
              /* La fila envuelve, y las tres cifras viajan juntas en un bloque
                 que no se parte. Con anchos fijos sueltos cada pieza envolvía
                 por su cuenta y las tres filas medían distinto —44/43/64 en
                 escritorio, 192/148/212 a 375—, que es justo lo contrario del
                 ritmo invariante que pide el sistema. */
              <div
                key={t.rot}
                className="s-fila s-fila-hover flex-wrap gap-y-0.5"
                style={i === 0 ? { borderTop: '1px solid var(--line)' } : undefined}
              >
                <Medidor nivel={t.nivel} />
                <span className="min-w-[120px] flex-[1_1_180px]">
                  <span className="s-cuerpo font-medium">{t.rot}</span>
                  <span className="s-micro ml-1.5" style={{ color: 'var(--ink-2)' }}>
                    {t.nota}
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-3">
                  <span className="flex w-[82px] items-baseline justify-end gap-1">
                    <b className="s-num text-[13px] font-medium">{g.length}</b>
                    <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
                      empresas
                    </span>
                  </span>
                  <span className="s-num w-12 text-right text-[13px] font-medium">
                    {formatDecimal(pct, 1)}%
                  </span>
                  <span className="flex w-[86px] items-baseline justify-end gap-1">
                    <b className="s-num text-[13px] font-medium">{formatInteger(pozos)}</b>
                    <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
                      pozos
                    </span>
                  </span>
                </span>
              </div>
            )
          })}
          <CardPie>
            <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
              Las tres primeras explican{' '}
              <b className="s-num font-medium" style={{ color: 'var(--ink)' }}>
                {formatDecimal(top3, 1)}%
              </b>
              ; las diez primeras,{' '}
              <b className="s-num font-medium" style={{ color: 'var(--ink)' }}>
                {formatDecimal(top10Pct, 1)}%
              </b>
              .
            </span>
          </CardPie>
        </Card>
      </Seccion>

      <Seccion
        n="02"
        titulo="Las tres primeras"
        desc="Quiénes son y de qué está hecha su producción."
      >
        {/* Context Cards de la §10: barra con la identidad y la metadata a la
            derecha, la reseña en el cuerpo, y las píldoras de adjunto abajo
            —las del cuadradito de color, que allá dice el formato del archivo
            y acá el fluido, la bolsa o la unidad—. */}
        <div className="flex flex-col gap-2">
          {orden.slice(0, 3).map((c) => {
            const m = mixDe(c)
            const sigla = m.rot === 'Petróleo' ? 'PET' : m.rot === 'Gas' ? 'GAS' : 'MIX'
            return (
              <Card key={c.slug}>
                <CardBarra>
                  <span className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium">
                    <Marca nombre={c.name} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="s-num ml-auto shrink-0 text-[12px]" style={{ color: 'var(--ink-2)' }}>
                    {formatDecimal(c.pctNacional, 1)}% del país
                  </span>
                </CardBarra>
                <p className="s-desc m-0 px-3 pt-2 pb-1">
                  {c.blurb ??
                    `Sin reseña en la fuente. Aporta el ${formatDecimal(c.pctNacional, 1)}% de la producción del país con ${formatInteger(c.proyectos)} pozos.`}
                </p>
                <div className="flex flex-wrap gap-1.5 px-3 pt-1 pb-3">
                  <span className="s-adj">
                    <b style={{ background: m.color ?? 'var(--ink-3)' }}>{sigla}</b>
                    {m.rot}
                    {m.razon && (
                      <span className="s-num" style={{ color: 'var(--ink-2)' }}>
                        {m.razon}
                      </span>
                    )}
                  </span>
                  {c.isPublic && c.exchange ? (
                    <span className="s-adj">
                      <b style={{ background: 'var(--green)' }}>{c.exchange}</b>
                      {c.ticker}
                      <span className="s-num">US$ {formatDecimal(c.price ?? 0, 2)}</span>
                      {c.change != null && (
                        <span className={`s-delta ${c.change >= 0 ? 's-delta--sube' : 's-delta--baja'}`}>
                          {c.change >= 0 ? '+' : '−'}
                          {formatDecimal(Math.abs(c.change), 1)}%
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="s-adj">
                      <b style={{ background: 'var(--ink-3)' }}>—</b>
                      Privada
                    </span>
                  )}
                  <span className="s-adj">
                    <b style={{ background: 'var(--ink-2)' }}>POZ</b>
                    <span className="s-num">{formatInteger(c.proyectos)}</span> pozos
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </Seccion>

      <Seccion n="03" titulo="La lista" desc="Las 52, filtrables por fluido y buscables por nombre.">
        <ListaEmpresas
          filas={filas}
          grupos={grupos}
          totalPct={`${formatDecimal(nacionalTotal, 1)}%`}
          totalPozos={formatInteger(pozosTotal)}
        />
        <Pie>
          «Mix» no es un dato de la fuente: es la relación entre el % de producción y el % del
          valor en dólares. Por encima de 1,2 pesa el petróleo y por debajo de 0,8 el gas. La
          suma de «Nacional» da {formatDecimal(nacionalTotal, 1)}% y no 100 porque los 52
          valores vienen redondeados a un decimal.
        </Pie>
      </Seccion>
    </>
  )
}
