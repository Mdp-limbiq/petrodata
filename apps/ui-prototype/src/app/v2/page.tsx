import Link from 'next/link'
import { Seccion, Dato, FilaDato, FilaRanking, Card, CardHead, Pie, FilaNoticia } from './_ui/kit'
import { Pulso } from './_ui/Pulso'
import { HEADLINE, PREV, NATIONAL_SERIES } from '@/fixtures/production'
import { TOP_OPERATORS } from '@/fixtures/operators'
import { NEWS } from '@/fixtures/news'
import { formatCompactAR, formatDecimal, formatInteger, formatMonth, formatPercent } from '@/lib/format'

/* PRODUCCIÓN — el inicio, rederivado.

   La decisión de fondo: acá la cifra del mes NO es un cartel. El sistema topea
   la tipografía en 21px y resuelve la jerarquía por peso y tinta, así que el
   BOE del mes es una lectura de 21px en peso 600 dentro de una card con
   anillo, no un número de 77px. Lo que lo hace el titular no es el tamaño: es
   estar primero, estar solo en su card y ser el único con la tinta plena.

   Las secciones van numeradas y separadas por línea punteada, sin margen
   entre ellas. Cada una tiene un título de una o dos palabras y una línea que
   dice qué muestra —el mecanismo— y no por qué conviene mirarla. */

export default function V2Inicio() {
  const periodo = formatMonth(`${HEADLINE.period}-01`)
  const previo = formatMonth(`${PREV.period}-01`)
  const maxOp = Math.max(...TOP_OPERATORS.map((o) => o.boeMonth))
  const ultimas = NEWS.slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
  const doceMeses = NATIONAL_SERIES.slice(-12)
  const minOil = Math.min(...doceMeses.map((p) => p.oil))
  const maxOil = Math.max(...doceMeses.map((p) => p.oil))

  return (
    <>
      <Seccion
        n="01"
        titulo="Vaca Muerta"
        desc={`BOE del mes con su desglose en petróleo, gas y pozos, contra ${previo}.`}
      >
        <Card>
          {/* El titular. Único 21px de la página y única tinta plena grande. */}
          <div className="flex items-end justify-between gap-4 px-3 py-3">
            <Dato
              rotulo={`Barriles equivalentes · ${periodo}`}
              valor={formatInteger(HEADLINE.boeMonth)}
              unidad="BOE"
              grande
            />
            <Pulso />
          </div>
          <div className="border-t" style={{ borderColor: 'var(--line)' }}>
            <FilaDato
              etiqueta="Petróleo"
              valor={formatInteger(HEADLINE.oil)}
              unidad="bbl/d"
              delta={HEADLINE.momOil}
            />
            <FilaDato
              etiqueta="Gas natural"
              valor={formatDecimal(HEADLINE.gas, 1)}
              unidad="MMm³/d"
              delta={HEADLINE.momGas}
            />
            <FilaDato
              etiqueta="Pozos activos"
              valor={formatInteger(HEADLINE.activeWells)}
              delta={HEADLINE.momWells}
            />
            <FilaDato
              etiqueta="Participación en el BOE nacional"
              valor={formatPercent(HEADLINE.vmShare)}
            />
          </div>
        </Card>
        <Pie>
          Variación contra {previo}. La participación es sobre producción nacional de
          hidrocarburos, sin variación mensual publicada.
        </Pie>
      </Seccion>

      <Seccion
        n="02"
        titulo="Producción mensual"
        desc="Doce meses de petróleo por día, con el mes de corte al final."
      >
        <Card>
          <CardHead
            titulo="Petróleo · bbl/d"
            nota={`${formatCompactAR(minOil)} – ${formatCompactAR(maxOil)}`}
          />
          <div className="px-3 py-3">
            {/* Barras horizontales y no un gráfico de área: el sistema no tiene
                superficies de color grandes, y una lista de barras finas es la
                forma que sí tiene de mostrar magnitud.

                Se comparan DENTRO del rango del período y no desde cero: los
                doce meses están entre 468k y 650k, así que barras desde cero
                se verían todas iguales y el gráfico no diría nada. Queda
                aclarado al pie, que es la única forma honesta de hacerlo. */}
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {doceMeses.map((p, i) => {
                const ultimo = i === doceMeses.length - 1
                const pct = (p.oil - minOil) / (maxOil - minOil || 1)
                return (
                  <li key={p.period} className="flex items-center gap-2.5">
                    <span
                      className="s-mono w-16 shrink-0 text-[10.5px]"
                      style={{ color: ultimo ? 'var(--ink-2)' : 'var(--ink-3)' }}
                    >
                      {formatMonth(`${p.period}-01`)}
                    </span>
                    <span className={`s-barra flex-1 ${ultimo ? 's-barra--lider' : ''}`}>
                      <i style={{ width: `${6 + pct * 94}%` }} />
                    </span>
                    <span
                      className="s-num w-16 shrink-0 text-right text-[11.5px]"
                      style={{
                        color: ultimo ? 'var(--ink)' : 'var(--ink-2)',
                        fontWeight: ultimo ? 500 : 400,
                      }}
                    >
                      {formatInteger(p.oil)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Card>
        <Pie>
          Las barras comparan dentro del rango del período ({formatInteger(minOil)} a{' '}
          {formatInteger(maxOil)} bbl/d), no desde cero. Serie ilustrativa escalada para
          terminar en el valor real de {periodo}.
        </Pie>
      </Seccion>

      <Seccion
        n="03"
        titulo="Operadores principales"
        desc="Las cinco del mes, por BOE y con su peso relativo."
      >
        <Card>
          <CardHead titulo="Ranking del mes" nota="BOE" />
          {TOP_OPERATORS.map((op, i) => (
            <FilaRanking
              key={op.slug}
              n={i + 1}
              nombre={op.name}
              valor={formatCompactAR(op.boeMonth)}
              pct={op.boeMonth / maxOp}
              lider={i === 0}
              nota={`${formatPercent(op.boeMonth / HEADLINE.boeMonth)} del BOE del mes`}
            />
          ))}
        </Card>
        <Pie>
          Las cinco suman exactamente el BOE del mes, así que los porcentajes cierran en 100.
        </Pie>
      </Seccion>

      <Seccion
        n="04"
        titulo="Mapa de actividad"
        desc="Tamaño del catálogo y de las series que alimentan estas pantallas."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Pozos en el catálogo" valor={formatInteger(HEADLINE.catalogWells)} />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Meses de serie" valor={String(NATIONAL_SERIES.length)} />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Operadoras seguidas" valor={String(TOP_OPERATORS.length)} />
            </div>
          </Card>
        </div>
      </Seccion>

      <Seccion
        n="05"
        titulo="Últimas noticias"
        desc="Con fecha, fuente y categoría."
      >
        <Card>
          {ultimas.map((n) => (
            <FilaNoticia
              key={n.id}
              id={n.id}
              href={`/noticias/${n.id}`}
              titulo={n.title}
              fuente={n.source}
              fecha={n.date}
              categoria={n.category}
              imagen={n.image}
            />
          ))}
        </Card>
        <div className="mt-3">
          <Link href="/v2/noticias" className="s-pill">
            Todas las noticias <span aria-hidden>→</span>
          </Link>
        </div>
      </Seccion>
    </>
  )
}
