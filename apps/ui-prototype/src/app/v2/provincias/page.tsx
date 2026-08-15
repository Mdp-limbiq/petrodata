import { Seccion, Card, CardHead, Dato, Pie, Tag, asignarColores } from '../_ui/kit'
import { FilaProvincia } from './FilaProvincia'
import { COMPANIES } from '@/fixtures/companies'
import { PROVINCES, SOLO_PROVINCIAS } from '@/fixtures/provinces'
import { NATIONAL_SERIES, serieProvincia } from '@/fixtures/production'
import { formatCompactAR, formatDecimal, formatInteger, formatMonth } from '@/lib/format'

/* PROVINCIAS — pocas filas, así que acá SÍ va la barra en cada una: con ocho
   ítems la magnitud relativa es el mensaje, y una barra lo dice más rápido
   que ocho números. Es la contracara de la decisión de Empresas. */

export default function V2Provincias() {
  const porPozos = PROVINCES.slice().sort((a, b) => b.wells - a.wells)
  const porExpo = PROVINCES.slice().sort((a, b) => b.exportsMUSD - a.exportsMUSD)
  const maxPozos = Math.max(...PROVINCES.map((p) => p.wells))
  const maxExpo = Math.max(...PROVINCES.map((p) => p.exportsMUSD))
  /* Los totales SÍ incluyen al Estado Nacional: son el total del país. Los
     denominadores que dicen "provincias" no, ver SOLO_PROVINCIAS. */
  const totalPozos = PROVINCES.reduce((s, p) => s + p.wells, 0)
  const totalExpo = PROVINCES.reduce((s, p) => s + p.exportsMUSD, 0)
  /* Ranking de exportaciones sólo entre provincias, que es el que se muestra
     en el desplegable. Sacar al Estado Nacional corre un puesto para arriba a
     todo lo que estaba debajo suyo: La Pampa era 7ª de 11 y es 6ª de 10. */
  const puestoExpoDe = new Map(
    SOLO_PROVINCIAS.slice()
      .sort((a, b) => b.exportsMUSD - a.exportsMUSD)
      .map((p, i) => [p.slug, i + 1]),
  )
  const puestoPozosProvDe = new Map(
    SOLO_PROVINCIAS.slice()
      .sort((a, b) => b.wells - a.wells)
      .map((p, i) => [p.slug, i + 1]),
  )
  const cuencas = [...SOLO_PROVINCIAS.reduce((m, p) => {
    const x = m.get(p.basin) ?? { nombre: p.basin, provincias: 0, pozos: 0 }
    x.provincias++
    x.pozos += p.wells
    return m.set(p.basin, x)
  }, new Map<string, { nombre: string; provincias: number; pozos: number }>()).values()]
    .sort((a, b) => b.pozos - a.pozos)
  const pozosEnCuencas = cuencas.reduce((s, c) => s + c.pozos, 0)
  /* La vara de intensidad exportadora: MUSD por pozo activo en todo el país. */
  const promedioPorPozo = totalExpo / totalPozos
  /* Los doce rótulos de mes son los mismos para todas las filas: se formatean
     una vez acá, en el servidor, y no once veces en el cliente. */
  const meses = NATIONAL_SERIES.slice(-12).map((m) => formatMonth(`${m.period}-01`))
  /* Cuántos puestos se mueve cada fila entre los dos rankings de la página.
     Positivo = sube al ordenar por exportaciones. El pie de esta sección venía
     AFIRMANDO que el orden cambia, sin mostrarlo: había que acordarse de la
     lista de la sección 02 y compararla de memoria. */
  const puestoPozosDe = new Map(porPozos.map((p, i) => [p.slug, i + 1]))
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
              <Dato rotulo="Provincias" valor={String(SOLO_PROVINCIAS.length)} />
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
              valor={formatInteger(p.wells)}
              pct={p.wells / maxPozos}
              lider={i === 0}
              tagColor={colorCuenca.get(p.basin)}
              operadoras={(p.operators ?? []).map((s) => NOMBRES.get(s) ?? s)}
              metrica="pozos"
              pctPozos={(p.wells / totalPozos) * 100}
              pctExpo={(p.exportsMUSD / totalExpo) * 100}
              promedioPorPozo={promedioPorPozo}
              puestoPozos={puestoPozosProvDe.get(p.slug)}
              puestoExpo={puestoExpoDe.get(p.slug)}
              totalProvincias={SOLO_PROVINCIAS.length}
              serie={serieProvincia(p.slug, p.wells)}
              meses={meses}
            />
          ))}
        </Card>
        {/* El pie dice de dónde sale cada dato y nada más. Llegó a tener 824
            caracteres —siete veces la mediana de los otros veinte pies de v2—
            porque le fui apilando cosas, y la mitad no le hablaba al lector:

            - por qué la fila se despliega en el lugar en vez de navegar: es la
              justificación de una decisión de diseño, o sea un comentario de
              código que se me escapó a la pantalla;
            - que las barras se comparan dentro del rango y no desde cero: si
              ya dije que la serie es inventada, cómo la escalé no cambia nada;
            - qué es «Estado Nacional»: la propia fila lo dice al desplegarse
              («Áreas bajo administración del Estado Nacional») y su tag es
              neutro justamente porque no es una categoría;
            - que «sin dato» es un hueco nuestro: lo dice el badge, en su fila.

            Una advertencia va donde está lo que advierte. Al pie sólo queda lo
            que no tiene dónde vivir en la pantalla: la procedencia. */}
        <Pie>
          Pozos y exportaciones salen del sitio. La producción mensual no: no se publica
          por provincia y esta serie es ilustrativa. Las operadoras son las destacadas,
          no todas las que operan.
        </Pie>
      </Seccion>

      <Seccion
        n="03"
        titulo="Perfil exportador"
        desc="Cuánto exporta cada una y cuántos puestos se mueve respecto de pozos."
      >
        <Card>
          <CardHead titulo="Por exportaciones" nota={`${formatCompactAR(totalExpo)} MUSD`} />
          {/* La MISMA fila que la sección 02. Antes era FilaRanking con la nota
              en un segundo renglón, y entre las dos listas no coincidía nada:
              60px de alto contra 40, dos renglones contra uno, sin tag de
              cuenca y las cinco columnas corridas entre 24 y 28px. El "% del
              total nacional" que estaba en ese segundo renglón no se pierde:
              ya vivía adentro del desglose, como badge del paso de
              exportaciones. */}
          {porExpo.map((p, i) => (
            <FilaProvincia
              key={p.slug}
              p={p}
              n={i + 1}
              valor={formatCompactAR(p.exportsMUSD)}
              pct={p.exportsMUSD / maxExpo}
              lider={i === 0}
              delta={(puestoPozosDe.get(p.slug) ?? i + 1) - (i + 1)}
              tagColor={colorCuenca.get(p.basin)}
              operadoras={(p.operators ?? []).map((s) => NOMBRES.get(s) ?? s)}
              metrica="exportaciones"
              pctPozos={(p.wells / totalPozos) * 100}
              pctExpo={(p.exportsMUSD / totalExpo) * 100}
              promedioPorPozo={promedioPorPozo}
              puestoPozos={puestoPozosProvDe.get(p.slug)}
              puestoExpo={puestoExpoDe.get(p.slug)}
              totalProvincias={SOLO_PROVINCIAS.length}
              serie={serieProvincia(p.slug, p.wells)}
              meses={meses}
            />
          ))}
        </Card>
        <Pie>
          El número de color son los puestos que gana o pierde respecto del ranking por
          pozos: quien más perfora no es quien más exporta.
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
        {/* Misma poda que el pie de la sección 02, que es de donde salió el
            problema: la explicación de por qué el color es categórico y no
            semántico es una regla del sistema, no un dato de esta tabla. Vive
            en SISTEMA.md, que es donde alguien la va a buscar. Acá queda la
            reconciliación de la suma, que es lo único que el lector no puede
            deducir mirando. */}
        <Pie>
          Suman {formatInteger(pozosEnCuencas)} pozos y no {formatInteger(totalPozos)}: los{' '}
          {totalPozos - pozosEnCuencas} del Estado Nacional no están asignados a una cuenca.
        </Pie>
      </Seccion>
    </>
  )
}
