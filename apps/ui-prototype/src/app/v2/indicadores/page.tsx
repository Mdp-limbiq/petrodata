import { Seccion, Card, CardHead, FilaDato, FilaRanking, Dato, Pie, Chip } from '../_ui/kit'
import { DAY_VALUE, BRENT, VM, TESIS, RIGI, TRANSPORT, BREAKEVEN, EXPORTS_SUMMARY } from '@/fixtures/indicadores'
import { formatDecimal, formatInteger } from '@/lib/format'

/* INDICADORES — la sección más larga, y la que más se beneficia del sistema.

   Ocho secciones numeradas, todas con la misma plantilla y el mismo ritmo:
   mismo ancho, mismo padding, misma línea punteada al cierre. Es la apuesta
   del sistema —que la regularidad absoluta sea el efecto— y acá se nota:
   ocho bloques de datos distintos se leen como un documento continuo en vez
   de como ocho tarjetas peleando por atención. */

export default function V2Indicadores() {
  const maxKm = Math.max(...TRANSPORT.gasByOperator.map((o) => o.km))
  const maxRigi = Math.max(...RIGI.projects.map((p) => p.busd))
  const minBe = Math.min(...BREAKEVEN.map((b) => b.usdBbl))
  const maxBe = Math.max(...BREAKEVEN.map((b) => b.usdBbl))
  const maxExp = Math.max(...EXPORTS_SUMMARY.sectors.map((s) => s.busd))

  return (
    <>
      <Seccion
        n="01"
        titulo="Tesis"
        desc="Los seis datos que sostienen el caso, con su variación interanual."
      >
        <Card>
          {TESIS.map((t) => (
            <div key={t.label} className="s-fila s-fila-hover">
              <span className="s-etq min-w-0 flex-1">{t.label}</span>
              <span className="s-num shrink-0 text-[13px] font-medium">{t.value}</span>
              {t.yoy && <span className="s-micro s-num s-sube w-16 shrink-0 text-right">▲ {t.yoy.replace('+', '')}</span>}
              {!t.yoy && <span className="w-16 shrink-0" />}
              <span className="s-mono shrink-0 text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                {t.asOf}
              </span>
            </div>
          ))}
        </Card>
        <Pie>La columna de la derecha es el mes de corte de cada dato, no todos coinciden.</Pie>
      </Seccion>

      <Seccion
        n="02"
        titulo="Valor"
        desc="Cuánto genera la cuenca por día y por año, y su peso en el PBI."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Por día" valor={formatDecimal(DAY_VALUE.perDayMUSD, 1)} unidad="MUSD" grande />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Por año" valor={formatDecimal(DAY_VALUE.perYearBUSD, 1)} unidad="BUSD" />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato
                rotulo="Del PBI"
                valor={`${formatDecimal(DAY_VALUE.pbiPct, 1)}%`}
                nota={`base ${DAY_VALUE.pbiYear}`}
              />
            </div>
          </Card>
        </div>
      </Seccion>

      <Seccion
        n="03"
        titulo="Margen"
        desc="Brent contra el costo de equilibrio del barril en la formación."
      >
        <Card>
          <CardHead titulo="Precio y equilibrio" nota="US$/bbl" />
          <FilaDato etiqueta="Brent" valor={formatDecimal(BRENT.value, 1)} unidad="US$" />
          <FilaDato etiqueta="Promedio 12 meses" valor={formatDecimal(BRENT.avg12m, 1)} unidad="US$" />
          <FilaDato etiqueta="Costo de equilibrio" valor={formatInteger(BRENT.breakeven)} unidad="US$" />
          <FilaDato
            etiqueta="Margen sobre el equilibrio"
            valor={formatDecimal(BRENT.marginOverBreakeven, 1)}
            unidad="US$"
          />
        </Card>
        <Pie>
          El margen es la diferencia entre Brent y el equilibrio: lo que queda por barril
          antes de transporte e impuestos.
        </Pie>
      </Seccion>

      <Seccion
        n="04"
        titulo="Equilibrio"
        desc="Diez años de costo de equilibrio, comparados dentro de su rango."
      >
        <Card>
          <CardHead titulo="Costo de equilibrio por año" nota={`US$ ${maxBe} → ${minBe}`} />
          <div className="px-3 py-3">
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {BREAKEVEN.map((b, i) => {
                const ultimo = i === BREAKEVEN.length - 1
                /* invertido a propósito: acá bajar es mejorar, así que la barra
                   larga es el costo alto y la corta el logro */
                const pct = (b.usdBbl - minBe) / (maxBe - minBe || 1)
                return (
                  <li key={b.year} className="flex items-center gap-2.5">
                    <span className="s-mono w-10 shrink-0 text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                      {b.year}
                    </span>
                    <span className={`s-barra flex-1 ${ultimo ? 's-barra--lider' : ''}`}>
                      <i style={{ width: `${6 + pct * 94}%` }} />
                    </span>
                    <span
                      className="s-num w-12 shrink-0 text-right text-[11.5px]"
                      style={{ color: ultimo ? 'var(--ink)' : 'var(--ink-2)', fontWeight: ultimo ? 500 : 400 }}
                    >
                      {b.usdBbl}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Card>
        <Pie>
          Acá una barra corta es mejor: bajar el costo de equilibrio es el logro. Las barras
          comparan dentro del rango (US$ {minBe}–{maxBe}), no desde cero. Serie ilustrativa
          que termina en el valor real.
        </Pie>
      </Seccion>

      <Seccion
        n="05"
        titulo="Formación"
        desc="Peso de Vaca Muerta dentro de la producción nacional de cada fluido."
      >
        <Card>
          <CardHead titulo={`Corte ${VM.dataDate}`} />
          <FilaDato etiqueta="Participación en petróleo nacional" valor={`${formatDecimal(VM.oilSharePct, 1)}%`} />
          <FilaDato etiqueta="Participación en gas nacional" valor={`${formatDecimal(VM.gasSharePct, 1)}%`} />
          <FilaDato etiqueta="Petróleo" valor={formatInteger(VM.oilBbld)} unidad="bbl/d" delta={VM.oilYoY} />
          <FilaDato etiqueta="Pozos activos" valor={formatInteger(VM.wells)} delta={VM.wellsYoY} />
        </Card>
        <Pie>Las variaciones de esta sección son interanuales, no mensuales.</Pie>
      </Seccion>

      <Seccion
        n="06"
        titulo="Inversión"
        desc="Proyectos aprobados bajo el régimen, por monto comprometido."
      >
        <Card>
          <CardHead titulo="Proyectos RIGI" nota={`${formatDecimal(RIGI.totalBUSD, 1)} BUSD`} />
          {RIGI.projects.map((p, i) => (
            <FilaRanking
              key={p.name}
              n={i + 1}
              nombre={p.name}
              valor={`${formatDecimal(p.busd, 1)} B`}
              pct={p.busd / maxRigi}
              lider={i === 0}
              nota={p.sponsor}
            />
          ))}
        </Card>
      </Seccion>

      <Seccion
        n="07"
        titulo="Transporte"
        desc="Kilómetros de ducto de gas por operadora, sobre la red total."
      >
        <Card>
          <CardHead titulo="Red de gas" nota={`${formatInteger(TRANSPORT.gasKm)} km`} />
          {TRANSPORT.gasByOperator.map((o, i) => (
            <FilaRanking
              key={o.name}
              n={i + 1}
              nombre={o.name}
              valor={formatInteger(o.km)}
              pct={o.km / maxKm}
              lider={i === 0}
            />
          ))}
        </Card>
        <Pie>
          Red total {formatInteger(TRANSPORT.totalKm)} km: {formatInteger(TRANSPORT.gasKm)} de gas
          y {formatInteger(TRANSPORT.oilKm)} de petróleo.
        </Pie>
      </Seccion>

      <Seccion
        n="08"
        titulo="Exportaciones"
        desc="Miles de millones de dólares exportados por sector, y su reparto."
      >
        <Card>
          <CardHead titulo="Por sector" nota={`${formatDecimal(EXPORTS_SUMMARY.totalBUSD, 1)} BUSD`} />
          {EXPORTS_SUMMARY.sectors.map((s, i) => (
            <FilaRanking
              key={s.name}
              n={i + 1}
              nombre={s.name}
              valor={`${formatDecimal(s.busd, 1)} B`}
              pct={s.busd / maxExp}
              lider={i === 0}
              nota={`${formatDecimal(s.sharePct, 1)}% del total`}
            />
          ))}
        </Card>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip tono="info">Corte 2026-05</Chip>
          <Chip tono="neutro">Secretaría de Energía</Chip>
        </div>
      </Seccion>
    </>
  )
}
