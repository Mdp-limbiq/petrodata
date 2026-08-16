import Link from 'next/link'
import {
  Seccion,
  Dato,
  FilaDato,
  FilaRanking,
  Card,
  CardBarra,
  CardHead,
  CardPie,
  Medidor,
  Tag,
  FLUIDO,
  Pie,
  FilaNoticia,
} from './_ui/kit'
import { Cifras } from './_ui/Cifras'
import { Serie } from './_ui/Serie'
import { VM } from '@/fixtures/indicadores'
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
  /* La contracara de la card: Vaca Muerta pone el 27,7% de los pozos del país
     y saca el 69,3% del petróleo. En crudo, con el corte de abril: 155 bbl/d
     por pozo contra 26 del resto. Todo sale de cifras del sitio; lo único que
     hago es dividir. */
  const pctPozosVM = (VM.wells / HEADLINE.activeWells) * 100
  const paisOil = VM.oilBbld / (VM.oilSharePct / 100)
  const rinde =
    VM.oilBbld / VM.wells / ((paisOil - VM.oilBbld) / (HEADLINE.activeWells - VM.wells))
  const minOil = Math.min(...doceMeses.map((p) => p.oil))
  const maxOil = Math.max(...doceMeses.map((p) => p.oil))

  return (
    <>
      <Seccion
        n="01"
        titulo="Vaca Muerta"
        desc="Petróleo y gas de la formación, y cuánto pesan en el total del país."
      >
        {/* La card como TABLA. Las dos escalas quedan separadas por columna
            —"En Vaca Muerta" y "Del total del país"— porque el problema de
            fondo era ése: bajo un título que dice «Vaca Muerta» convivían
            cifras de la formación con una del país sin avisar.

            Los 14.441 pozos que mostraba antes son NACIONALES: es la suma
            exacta de las once provincias del fixture, Jujuy y Formosa
            incluidas. Los de Vaca Muerta son 3.996. Esa fila salió de la tabla
            y sus dos números viven ahora en la conclusión, que es donde
            significan algo: solos no explicaban nada.

            Piezas: barra de card medida, tabla del sistema con su cabecera de
            12/500, tag categórico por fluido, chip, medidor de tres barras y
            —extensión nuestra— la serie y la barra de proporción. */}
        <Card>
          <CardBarra>
            <span className="s-titulo shrink-0">
              {formatInteger(HEADLINE.boeMonth)}{' '}
              <span className="text-[11px] font-normal" style={{ color: 'var(--ink-3)' }}>
                BOE
              </span>
            </span>
            <span className="s-chip s-chip--neutro s-chip--mini shrink-0">
              {formatPercent(HEADLINE.vmShare)} del BOE nacional
            </span>
            <span className="flex-1" />
            <span className="s-micro shrink-0" style={{ color: 'var(--ink-3)' }}>
              Vaca Muerta · {periodo}
            </span>
          </CardBarra>

          <table className="s-tabla">
            <thead>
              <tr>
                <th>Fluido</th>
                <th className="text-right">En Vaca Muerta</th>
                <th className="hidden text-right sm:table-cell">Doce meses</th>
                <th className="text-right">Del total del país</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Tag color={FLUIDO.petroleo}>Petróleo</Tag>
                </td>
                <td className="text-right">
                  {formatInteger(HEADLINE.oil)}{' '}
                  <span className="text-[11px] font-normal" style={{ color: 'var(--ink-3)' }}>
                    bbl/d
                  </span>
                </td>
                <td className="hidden text-right sm:table-cell">
                  {/* justify-end y no inline-flex: .s-serie es display:flex y le gana a
                      la utilidad, así que el text-right de la celda no la movía y las
                      barras quedaban pegadas a la izquierda mientras el resto de la
                      columna iba a la derecha. */}
                  <Serie
                    valores={doceMeses.map((p) => p.oil)}
                    textos={doceMeses.map(
                      (p) => `${formatMonth(`${p.period}-01`)} · ${formatInteger(p.oil)} bbl/d`,
                    )}
                    className="justify-end"
                  />
                </td>
                <td className="text-right">
                  <span className="inline-flex items-center gap-2">
                    {/* la barra toma el color de SU fluido, el mismo del tag y
                        el mismo en toda la web */}
                    <span
                      className="s-barra hidden w-13 sm:block"
                      aria-hidden
                      style={{ ['--barra-color' as string]: FLUIDO.petroleo }}
                    >
                      <i style={{ width: `${VM.oilSharePct}%` }} />
                    </span>
                    <span className="w-11 text-right">{formatDecimal(VM.oilSharePct, 1)}%</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <Tag color={FLUIDO.gas}>Gas natural</Tag>
                </td>
                <td className="text-right">
                  {formatDecimal(HEADLINE.gas, 1)}{' '}
                  <span className="text-[11px] font-normal" style={{ color: 'var(--ink-3)' }}>
                    MMm³/d
                  </span>
                </td>
                <td className="hidden text-right sm:table-cell">
                  <Serie
                    valores={doceMeses.map((p) => p.gas)}
                    textos={doceMeses.map(
                      (p) => `${formatMonth(`${p.period}-01`)} · ${formatDecimal(p.gas, 1)} MMm³/d`,
                    )}
                    className="justify-end"
                  />
                </td>
                <td className="text-right">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="s-barra hidden w-13 sm:block"
                      aria-hidden
                      style={{ ['--barra-color' as string]: FLUIDO.gas }}
                    >
                      <i style={{ width: `${VM.gasSharePct}%` }} />
                    </span>
                    <span className="w-11 text-right">{formatDecimal(VM.gasSharePct, 1)}%</span>
                  </span>
                </td>
              </tr>
              {/* La conclusión es la última FILA y no un pie aparte. Los 3.996
                  pozos y los 14.441 del país viven acá, que es donde explican
                  algo: la fila suelta no decía nada. */}
              <tr className="s-cierre">
                <td colSpan={4}>
                  <span className="flex items-center gap-3">
                    <Medidor nivel={3} />
                    <span className="s-micro font-normal" style={{ color: 'var(--ink-2)' }}>
                      Con el <strong className="font-semibold">{formatDecimal(pctPozosVM, 1)}%</strong>{' '}
                      de los pozos aporta el{' '}
                      <strong className="font-semibold">{formatDecimal(VM.oilSharePct, 1)}%</strong> del
                      petróleo: un pozo rinde{' '}
                      <strong className="font-semibold">{formatDecimal(rinde, 1)}×</strong> uno del resto.
                    </span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
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
                    {/* El color del petróleo, el mismo que en la card 01 y en
                        toda la web. Antes el mes de corte iba en acento, y el
                        acento es para foco, enlaces y detalles: no para decir
                        "esto es petróleo". Los meses anteriores lo llevan
                        mezclado al 40% para que el de corte siga saltando sin
                        cambiar de color, que era lo que rompía la identidad. */}
                    <span
                      className="s-barra flex-1"
                      style={{
                        ['--barra-color' as string]: ultimo
                          ? FLUIDO.petroleo
                          : `color-mix(in srgb, ${FLUIDO.petroleo} 40%, var(--line-strong))`,
                      }}
                    >
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
              marca
              unidad="BOE"
              nota={formatPercent(op.boeMonth / HEADLINE.boeMonth)}
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
        {/* Eran tres cards, una por número: tres planos separados para tres
            lecturas del mismo resumen. La referencia usa UNA card con columnas
            flex-1 —es el único lugar donde pone cifras grandes— y eso es lo que
            estas tres son: partes de un mismo apunte sobre el tamaño de los
            datos que alimentan la página. */}
        <Cifras
          items={[
            {
              rotulo: 'Pozos en el catálogo',
              valor: formatInteger(HEADLINE.catalogWells),
              apoyo: `${formatInteger(HEADLINE.activeWells)} activos`,
            },
            {
              rotulo: 'Meses de serie',
              valor: String(NATIONAL_SERIES.length),
              apoyo: `hasta ${periodo}`,
            },
            {
              rotulo: 'Operadoras seguidas',
              valor: String(TOP_OPERATORS.length),
              apoyo: 'del ranking del mes',
            },
          ]}
        />
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
