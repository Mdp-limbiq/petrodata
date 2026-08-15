import { Seccion, Card, CardHead, FilaRanking, Dato, Pie, Tag, asignarColores } from '../_ui/kit'
import { FilaProvincia } from './FilaProvincia'
import { COMPANIES } from '@/fixtures/companies'
import { PROVINCES } from '@/fixtures/provinces'
import { formatCompactAR, formatDecimal, formatInteger } from '@/lib/format'

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
  const cuencas = [...PROVINCES.reduce((m, p) => {
    const x = m.get(p.basin) ?? { nombre: p.basin, provincias: 0, pozos: 0 }
    x.provincias++
    x.pozos += p.wells
    return m.set(p.basin, x)
  }, new Map<string, { nombre: string; provincias: number; pozos: number }>()).values()]
    .sort((a, b) => b.pozos - a.pozos)
  /* El color se asigna por posición sobre las cuencas ordenadas por pozos,
     así cada una tiene el suyo y no cambia entre secciones ni pantallas. */
  const colorCuenca = asignarColores(cuencas.map((c) => c.nombre))
  /* slug de operadora → nombre, para las empresas que operan en cada provincia */
  const NOMBRES = new Map(COMPANIES.map((c) => [c.slug, c.name]))

  return (
    <>
      <Seccion
        n="01"
        titulo="Provincias de Argentina"
        desc="Pozos y exportaciones sumados sobre las que tienen actividad."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Pozos" valor={formatInteger(totalPozos)} grande />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Exportaciones" valor={formatCompactAR(totalExpo)} unidad="MUSD" />
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
        titulo="Pozos activos"
        desc="Cuántos aporta cada provincia, sobre el total del país."
      >
        <Card>
          <CardHead titulo="Por cantidad de pozos" nota={formatInteger(totalPozos)} />
          {porPozos.map((p, i) => (
            <FilaProvincia
              key={p.slug}
              p={p}
              n={i + 1}
              pct={p.wells / maxPozos}
              lider={i === 0}
              tagColor={colorCuenca.get(p.basin)!}
              operadoras={(p.operators ?? []).map((s) => NOMBRES.get(s) ?? s)}
              pctPozos={(p.wells / totalPozos) * 100}
              puestoPozos={i + 1}
              puestoExpo={porExpo.findIndex((x) => x.slug === p.slug) + 1}
              total={PROVINCES.length}
            />
          ))}
        </Card>
        <Pie>
          Cada fila se despliega en el lugar en vez de llevarte a otra página: la ficha de
          una provincia son cuatro datos, y perder el contexto de la lista para verlos
          cuesta más de lo que aporta. Las operadoras que se listan son las tres primeras por
          producción, no todas las que operan: el dato completo por provincia todavía no
          lo tenemos.
        </Pie>
      </Seccion>

      <Seccion
        n="03"
        titulo="Perfil exportador"
        desc="Millones de dólares exportados y su peso en el total nacional."
      >
        <Card>
          <CardHead titulo="Por exportaciones" nota={`${formatCompactAR(totalExpo)} MUSD`} />
          {porExpo.map((p, i) => (
            <FilaRanking
              key={p.slug}
              n={i + 1}
              nombre={p.name}
              valor={formatCompactAR(p.exportsMUSD)}
              pct={p.exportsMUSD / maxExpo}
              lider={i === 0}
              marca
              nota={`${formatDecimal(p.expSharePct, 1)}% del total nacional`}
            />
          ))}
        </Card>
        <Pie>
          El orden cambia entre las dos listas: quien pone más pozos no es quien más exporta.
        </Pie>
      </Seccion>

      <Seccion
        n="04"
        titulo="Cuencas"
        desc="Las cinco cuencas con actividad y cuántas provincias abarca cada una."
      >
        <Card>
          <CardHead titulo="Por cuenca" nota={`${cuencas.length} cuencas`} />
          {cuencas.map((c) => (
            <div key={c.nombre} className="s-fila s-fila-hover">
              <span className="min-w-0 flex-1">
                <Tag color={colorCuenca.get(c.nombre)!}>{c.nombre}</Tag>
              </span>
              <span className="s-micro shrink-0" style={{ color: 'var(--ink-2)' }}>
                {c.provincias} {c.provincias === 1 ? 'provincia' : 'provincias'}
              </span>
              <span className="s-num w-16 shrink-0 text-right text-[13px] font-medium">
                {formatInteger(c.pozos)}
              </span>
            </div>
          ))}
        </Card>
        <Pie>
          El color de cada cuenca es el mismo en toda la web: es categórico, no dice si algo
          está bien o mal. Los colores que sí significan —verde, naranja y rojo— quedan
          reservados para eso.
        </Pie>
      </Seccion>
    </>
  )
}
