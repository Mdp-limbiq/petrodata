import { Seccion, Card, CardHead, Dato, Pie, Chip } from '../_ui/kit'
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
        titulo="Concentración"
        desc="Cuánto del total nacional explican las diez primeras del ranking."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Empresas seguidas" valor={String(COMPANIES.length)} grande />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Peso de las 10 primeras" valor={`${formatDecimal(top10, 1)}%`} />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Con cotización pública" valor={String(cotizan)} nota={`de ${COMPANIES.length}`} />
            </div>
          </Card>
        </div>
      </Seccion>

      <Seccion
        n="02"
        titulo="Ranking"
        desc="Las 52 empresas por participación en la producción nacional."
        ancho="suelto"
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
                    className="sticky top-0 z-[5] w-20 text-right"
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
                    <td className="text-right">{formatDecimal(c.pctNacional, 1)}%</td>
                    <td className="text-right">{formatDecimal(c.pctValor, 1)}%</td>
                    <td className="text-right">{formatInteger(c.proyectos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Pie>
          La cabecera queda fija sobre fondo opaco: el sistema no usa desenfoque de fondo en
          ninguna parte, así que una cabecera translúcida lo contradiría.
        </Pie>
      </Seccion>

      <Seccion n="03" titulo="Proyectos" desc="Total de proyectos declarados por el conjunto.">
        <Card>
          <div className="px-3 py-3">
            <Dato rotulo="Proyectos en el conjunto" valor={formatInteger(proyectos)} grande />
          </div>
        </Card>
      </Seccion>
    </>
  )
}
