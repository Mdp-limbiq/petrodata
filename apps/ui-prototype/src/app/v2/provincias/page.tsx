import { Seccion, Card, CardHead, FilaRanking, Dato, Pie } from '../_ui/kit'
import { PROVINCES } from '@/fixtures/provinces'
import { formatCompact, formatDecimal, formatInteger } from '@/lib/format'

/* PROVINCIAS — pocas filas, así que acá SÍ va la barra en cada una: con ocho
   ítems la magnitud relativa es el mensaje, y una barra lo dice más rápido
   que ocho números. Es la contracara de la decisión de Empresas. */

export default function V2Provincias() {
  const porPozos = PROVINCES.slice().sort((a, b) => b.wells - a.wells)
  const porExpo = PROVINCES.slice().sort((a, b) => b.exportsMUSD - a.exportsMUSD)
  const maxPozos = Math.max(...PROVINCES.map((p) => p.wells))
  const maxExpo = Math.max(...PROVINCES.map((p) => p.exportsMUSD))
  const totalPozos = PROVINCES.reduce((s, p) => s + p.wells, 0)
  const totalExpo = PROVINCES.reduce((s, p) => s + p.exportsMUSD, 0)

  return (
    <>
      <Seccion
        n="01"
        titulo="Reparto"
        desc="Pozos y exportaciones sumados sobre las provincias con actividad."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Pozos" valor={formatInteger(totalPozos)} grande />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Exportaciones" valor={formatCompact(totalExpo)} unidad="MUSD" />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Provincias" valor={String(PROVINCES.length)} />
            </div>
          </Card>
        </div>
      </Seccion>

      <Seccion
        n="02"
        titulo="Pozos"
        desc="Cuántos pozos aporta cada provincia, sobre el total del país."
      >
        <Card>
          <CardHead titulo="Por cantidad de pozos" nota={formatInteger(totalPozos)} />
          {porPozos.map((p, i) => (
            <FilaRanking
              key={p.slug}
              n={i + 1}
              nombre={p.name}
              valor={formatInteger(p.wells)}
              pct={p.wells / maxPozos}
              lider={i === 0}
              nota={p.basin}
            />
          ))}
        </Card>
      </Seccion>

      <Seccion
        n="03"
        titulo="Exportaciones"
        desc="Millones de dólares exportados y su peso en el total nacional."
      >
        <Card>
          <CardHead titulo="Por exportaciones" nota={`${formatCompact(totalExpo)} MUSD`} />
          {porExpo.map((p, i) => (
            <FilaRanking
              key={p.slug}
              n={i + 1}
              nombre={p.name}
              valor={formatCompact(p.exportsMUSD)}
              pct={p.exportsMUSD / maxExpo}
              lider={i === 0}
              nota={`${formatDecimal(p.expSharePct, 1)}% del total nacional`}
            />
          ))}
        </Card>
        <Pie>
          El orden cambia entre las dos listas: quien pone más pozos no es quien más exporta.
        </Pie>
      </Seccion>
    </>
  )
}
