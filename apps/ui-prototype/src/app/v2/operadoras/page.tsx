import { Seccion, Card, CardHead, FilaRanking, Dato, Pie } from '../_ui/kit'
import { TOP_OPERATORS, OIL_PRODUCERS } from '@/fixtures/operators'
import { CONTRIBUTION } from '@/fixtures/indicadores'
import { HEADLINE } from '@/fixtures/production'
import { formatCompact, formatDecimal, formatInteger, formatPercent } from '@/lib/format'

/* OPERADORAS — quién produce y cuánto valor deja.

   Tres cortes del mismo conjunto, y el orden importa: primero producción
   —lo que se mide—, después valor —lo que se captura—, y al final la brecha
   entre las dos. El sistema pide que cada sección diga el mecanismo, y la
   tercera es la única que necesita explicarse, porque compara dos escalas. */

export default function V2Operadoras() {
  const maxBoe = Math.max(...TOP_OPERATORS.map((o) => o.boeMonth))
  const maxBbl = Math.max(...OIL_PRODUCERS.map((o) => o.bbld))
  const maxValor = Math.max(...CONTRIBUTION.map((c) => c.valorMUSD))
  const brecha = CONTRIBUTION.slice().sort(
    (a, b) => b.partUsdPct - b.partBoePct - (a.partUsdPct - a.partBoePct),
  )

  return (
    <>
      <Seccion
        n="01"
        titulo="Producción"
        desc="BOE del mes por operadora, con su peso sobre el total de la cuenca."
      >
        <Card>
          <CardHead titulo="Ranking del mes" nota="BOE" />
          {TOP_OPERATORS.map((op, i) => (
            <FilaRanking
              key={op.slug}
              n={i + 1}
              nombre={op.name}
              valor={formatCompact(op.boeMonth)}
              pct={op.boeMonth / maxBoe}
              lider={i === 0}
              nota={`${formatPercent(op.boeMonth / HEADLINE.boeMonth)} del BOE del mes`}
            />
          ))}
        </Card>
      </Seccion>

      <Seccion
        n="02"
        titulo="Petróleo"
        desc="Barriles por día de los principales productores del país."
      >
        <Card>
          <CardHead titulo="Productores de petróleo" nota="bbl/d" />
          {OIL_PRODUCERS.map((p, i) => (
            <FilaRanking
              key={p.name}
              n={i + 1}
              nombre={p.name}
              valor={formatInteger(p.bbld)}
              pct={p.bbld / maxBbl}
              lider={i === 0}
              nota={`${formatDecimal(p.sharePct, 1)}% del total nacional`}
            />
          ))}
        </Card>
        <Pie>
          El orden no coincide con el de BOE: quien más petróleo produce no es
          necesariamente quien más energía total aporta.
        </Pie>
      </Seccion>

      <Seccion
        n="03"
        titulo="Valor"
        desc="Millones de dólares generados, regalías y exportaciones por operadora."
      >
        <Card>
          <CardHead titulo="Contribución" nota="MUSD" />
          <div className="overflow-x-auto">
            <table className="s-tabla">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Operadora</th>
                  <th className="w-20 text-right">Valor</th>
                  <th className="w-20 text-right">Regalías</th>
                  <th className="w-20 text-right">Exportado</th>
                </tr>
              </thead>
              <tbody>
                {CONTRIBUTION.map((c, i) => (
                  <tr key={c.operator}>
                    <td className="s-mono text-[11px]" style={{ color: 'var(--ink-3)', fontWeight: 400 }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="truncate">{c.operator}</td>
                    <td className="text-right">{formatCompact(c.valorMUSD)}</td>
                    <td className="text-right">{formatCompact(c.regaliasMUSD)}</td>
                    <td className="text-right">{formatCompact(c.expoMUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Seccion>

      <Seccion
        n="04"
        titulo="Brecha"
        desc="Diferencia entre el peso en valor y el peso en producción, en puntos."
      >
        <Card>
          <CardHead titulo="Valor menos producción" nota="puntos porcentuales" />
          {brecha.map((c, i) => {
            const d = c.partUsdPct - c.partBoePct
            return (
              <div key={c.operator} className="s-fila s-fila-hover">
                <span className="s-mono w-5 shrink-0 text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="s-cuerpo min-w-0 flex-1 truncate font-medium">{c.operator}</span>
                <span className="s-micro s-num shrink-0" style={{ color: 'var(--ink-3)' }}>
                  {formatDecimal(c.partBoePct, 1)}% → {formatDecimal(c.partUsdPct, 1)}%
                </span>
                <span
                  className={`s-num w-14 shrink-0 text-right text-[13px] font-medium ${d >= 0 ? 's-sube' : 's-baja'}`}
                >
                  {d >= 0 ? '▲' : '▼'} {formatDecimal(Math.abs(d), 1)}
                </span>
              </div>
            )
          })}
        </Card>
        <Pie>
          Un valor positivo significa que la operadora captura más valor del que le
          correspondería por volumen. Compara dos participaciones, no dos magnitudes.
        </Pie>
      </Seccion>
    </>
  )
}
