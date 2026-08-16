import { Seccion, Card, CardHead, Pie, Chip } from '../_ui/kit'
import { Cifras } from '../_ui/Cifras'
import { COMPANIES } from '@/fixtures/companies'
import { formatDecimal, formatInteger } from '@/lib/format'

/* EMPRESAS — 52 filas.

   Acá el sistema se pone a prueba: la referencia nunca tuvo que resolver una
   tabla de 52 filas. Lo que aporta es la receta de "records table": celdas de
   10×12, cabecera de 12px en la tinta más tenue, celdas de 13px en peso 500,
   divisorias SÓLIDAS (estamos adentro de un componente, no separando
   secciones) y hover de 400ms.

   Dos decisiones que tuve que tomar porque el sistema no las trae:
   · La cabecera va sticky sobre fondo OPACO, no translúcido. El sistema no
     usa blur en ninguna parte, así que una cabecera semitransparente lo
     contradiría.
   · El ranking no lleva barra en cada fila. Con 52 filas, 52 barras se leen
     como ruido; el número con tabular-nums ya ordena. La barra queda para
     listas cortas, donde la magnitud relativa es el mensaje. */

export default function V2Empresas() {
  const orden = COMPANIES.slice().sort((a, b) => b.pctNacional - a.pctNacional)
  const cotizan = COMPANIES.filter((c) => c.isPublic).length
  const proyectos = COMPANIES.reduce((s, c) => s + c.proyectos, 0)
  const top10 = orden.slice(0, 10).reduce((s, c) => s + c.pctNacional, 0)

  return (
    <>
      <Seccion
        n="01"
        titulo="Aporte al país"
        desc="Cuánto del total nacional explican las diez primeras."
      >
        <Cifras
          items={[
            {
              rotulo: 'Empresas seguidas',
              valor: String(COMPANIES.length),
              apoyo: `${cotizan} con cotización`,
            },
            {
              rotulo: 'Peso de las 10 primeras',
              valor: `${formatDecimal(top10, 1)}%`,
              apoyo: 'de la producción del país',
            },
            {
              rotulo: 'Proyectos',
              valor: formatInteger(proyectos),
              apoyo: 'pozos sumados',
            },
          ]}
        />
      </Seccion>

      <Seccion
        n="02"
        titulo="Empresas de petróleo y gas"
        desc="Las 52, por participación en la producción nacional."
      >
        <Card>
          <CardHead titulo="Participación nacional" nota={`${COMPANIES.length} empresas`} />
          <div className="max-h-[560px] overflow-auto">
            <table className="s-tabla">
              <thead>
                <tr>
                  <th
                    className="sticky top-0 z-[5] w-10"
                    style={{ background: 'var(--surface)', boxShadow: '0 1px 0 var(--line)' }}
                  >
                    #
                  </th>
                  <th
                    className="sticky top-0 z-[5]"
                    style={{ background: 'var(--surface)', boxShadow: '0 1px 0 var(--line)' }}
                  >
                    Empresa
                  </th>
                  <th
                    className="s-sep sticky top-0 z-[5] w-20 text-right"
                    style={{ background: 'var(--surface)', boxShadow: '0 1px 0 var(--line)' }}
                  >
                    Nacional
                  </th>
                  <th
                    className="sticky top-0 z-[5] w-20 text-right"
                    style={{ background: 'var(--surface)', boxShadow: '0 1px 0 var(--line)' }}
                  >
                    Valor
                  </th>
                  <th
                    className="sticky top-0 z-[5] w-16 text-right"
                    style={{ background: 'var(--surface)', boxShadow: '0 1px 0 var(--line)' }}
                  >
                    Proyectos
                  </th>
                </tr>
              </thead>
              <tbody>
                {orden.map((c, i) => (
                  <tr key={c.slug}>
                    <td className="s-mono text-[11px]" style={{ color: 'var(--ink-3)', fontWeight: 400 }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td>
                      <span className="flex items-center gap-2">
                        <span className="truncate">{c.name}</span>
                        {c.isPublic && c.exchange && (
                          <Chip tono="neutro">{c.ticker ?? c.exchange}</Chip>
                        )}
                      </span>
                    </td>
                    <td className="s-sep text-right">{formatDecimal(c.pctNacional, 1)}%</td>
                    <td className="text-right">{formatDecimal(c.pctValor, 1)}%</td>
                    <td className="text-right">{formatInteger(c.proyectos)}</td>
                  </tr>
                ))}
              </tbody>
              {/* Pie con el agregado, como la Records Table del catálogo: allá
                  dice "26 count" bajo la columna que cuenta. Con 52 filas y
                  scroll, es lo único que dice de qué tamaño es lo que estás
                  recorriendo sin llegar al final. */}
              <tfoot>
                <tr className="s-cierre">
                  <td />
                  <td>
                    {COMPANIES.length} <span style={{ color: 'var(--ink-3)' }}>empresas</span>
                  </td>
                  <td className="s-sep text-right">
                    {formatDecimal(
                      COMPANIES.reduce((a, c) => a + c.pctNacional, 0),
                      1,
                    )}
                    %
                  </td>
                  <td className="text-right">
                    {formatDecimal(
                      COMPANIES.reduce((a, c) => a + c.pctValor, 0),
                      1,
                    )}
                    %
                  </td>
                  <td className="text-right">{formatInteger(proyectos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
        <Pie>
          «Nacional» es la participación en la producción del país y «Valor» en el valor en
          dólares: una empresa puede pesar más en una que en otra.
        </Pie>
      </Seccion>

    </>
  )
}
