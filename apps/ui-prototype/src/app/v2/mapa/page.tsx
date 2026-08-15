import { Seccion, Card, CardHead, FilaDato, Pie } from '../_ui/kit'
import { MapaV2 } from './MapaV2'
import { HEADLINE } from '@/fixtures/production'
import { WELLS } from '@/fixtures/wells'
import { formatInteger } from '@/lib/format'

/* MAPA — la excepción justificada.

   El sistema no tiene un componente de mapa, y un mapa es lo único de todo el
   producto que no puede reducirse a filas y barras. Lo que sí aplica es el
   envoltorio: va adentro del marco de 14px, con el anillo de 1px y sin
   controles flotantes translúcidos, porque el sistema no usa desenfoque.

   Los paneles que en Estrato flotaban SOBRE el mapa acá bajan a filas debajo.
   Es coherente con el sistema —que no superpone capas— y además evita el
   problema que teníamos de que los controles de zoom se solaparan. */

export default function V2Mapa() {
  return (
    <>
      <Seccion
        n="01"
        titulo="Mapa de actividad"
        desc="Pozos muestreados sobre la cuenca, agrupados por densidad."
      >
        <div className="h-[420px] overflow-hidden rounded-[10px]">
          <MapaV2 />
        </div>
        <Pie>
          El mapa es lo único que no se puede reducir a filas: va adentro del marco, pero
          sin controles flotantes encima.
        </Pie>
      </Seccion>

      <Seccion
        n="02"
        titulo="Pozos en el catálogo"
        desc="Tamaño del catálogo completo y de la muestra que se dibuja."
      >
        <Card>
          <CardHead titulo="Cobertura" />
          <FilaDato etiqueta="Pozos en el catálogo" valor={formatInteger(HEADLINE.catalogWells)} />
          <FilaDato etiqueta="Muestreados en el mapa" valor={formatInteger(WELLS.length)} />
          <FilaDato etiqueta="Pozos activos del mes" valor={formatInteger(HEADLINE.activeWells)} />
        </Card>
        <Pie>
          La muestra es una fracción del catálogo: dibujar 85.593 puntos no agrega
          información y sí cuesta cuadros por segundo.
        </Pie>
      </Seccion>
    </>
  )
}
