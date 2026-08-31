import { Card, CardHead, CardPie, Pie, Seccion, Dato } from '../_ui/kit'
import { ListaPersonas } from '../_ui/ListaPersonas'
import { PERSONAS, PESOS, PISO_POZOS } from '@/fixtures/personas'
import { formatDecimal, formatInteger } from '@/lib/format'

/* PERSONALIDADES — quién dirige la cuenca, ordenado por un índice.

   La sección sale de CEOS/, el pipeline que busca y confirma al CEO actual de
   las 50 primeras empresas del sitio. Cruzan 48 con el ranking de COMPANIES.

   LA DECISIÓN DE FONDO, y conviene que esté escrita porque condiciona todo lo
   demás: no hay ninguna métrica de la PERSONA en el dato. El pipeline trae
   nombre, cargo y fuente. Así que el índice es de la EMPRESA, atribuido a quien
   la dirige, y la página lo dice en la bajada y en el pie. Cualquier otra
   lectura sería inventarle a una persona real un número que nadie midió.

   Dos cosas que quedan pendientes de decisión y no de código:

   · LAS CARAS ESTÁN GENERADAS CON IA. Salen de CEOS/data/headshots/, que las
     produce con Higgsfield desde una foto real y el prompt «Recreate this exact
     person as a professional corporate executive cover portrait». Son
     fotorrealistas, sin marca de agua, de personas con nombre y apellido. Están
     en public/images/ceos/ para poder ver la maqueta y NO se versionan —hay un
     .gitignore ahí que explica por qué—. La lista cae al monograma sola si el
     archivo no está, así que publicar sin resolver la foto ya funciona.

   · EL VOTO ES UNA MAQUETA. El enunciado es «uno por semana por IP» y eso vive
     en el servidor; acá se guarda en localStorage para poder ver la
     interacción. Además una IP no es una persona: una oficina o una operadora
     móvil son miles detrás de una sola, y cualquiera con VPN vota lo que
     quiera. Está dicho al pie. */

export default function V2Personalidades() {
  const total = PERSONAS.length
  const confirmados = PERSONAS.filter((p) => p.confirmado).length
  const cobertura = PERSONAS.reduce((s, p) => s + p.pctValor, 0)

  return (
    <>
      <Seccion
        n="01"
        titulo="Quiénes dirigen la cuenca"
        desc="Las personas al frente de las empresas que producen el país."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="px-3 py-3">
              <Dato rotulo="Personas" valor={String(total)} nota="de las 50 primeras empresas" grande />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato
                rotulo="Del valor del país"
                valor={`${formatDecimal(cobertura, 1)}%`}
                nota="suman sus empresas"
              />
            </div>
          </Card>
          <Card>
            <div className="px-3 py-3">
              <Dato
                rotulo="Cargo confirmado"
                valor={`${confirmados}`}
                nota={`de ${total}, contra más de una fuente`}
              />
            </div>
          </Card>
        </div>
      </Seccion>

      <Seccion
        n="02"
        titulo="Índice Vaca Muerta"
        desc="Escala, rendimiento y prima, en un número por persona."
      >
        <Card>
          <CardHead titulo="El ranking" nota="tu voto se renueva cada lunes" />
          <ListaPersonas personas={PERSONAS} base={0} />
          <CardPie>
            {/* Las tres barritas no llevan leyenda de color porque no tienen
                color: son tres, siempre en el mismo orden, y el pie las nombra.
                Una leyenda con tres puntos grises no distinguiría nada. */}
            <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
              Las tres barras de cada fila son los componentes del índice, en orden:{' '}
              <b className="font-semibold">escala</b> ({formatDecimal(PESOS.escala * 100, 0)}%),{' '}
              <b className="font-semibold">rendimiento</b> ({formatDecimal(PESOS.rinde * 100, 0)}%) y{' '}
              <b className="font-semibold">prima</b> ({formatDecimal(PESOS.prima * 100, 0)}%).
            </span>
          </CardPie>
        </Card>
        <Pie>
          <b className="font-semibold">Escala</b> es el porcentaje del valor de la producción del
          país que aporta su empresa; <b className="font-semibold">rendimiento</b>, cuánto valor
          saca por pozo que opera; <b className="font-semibold">prima</b>, cuánto más valor captura
          del que le tocaría por volumen. Los tres salen de datos públicos y se normalizan de 0 a
          100. El rendimiento se divide por los pozos más un piso de{' '}
          {formatInteger(PISO_POZOS)}: sin ese piso una empresa de nueve pozos entraba séptima con
          el 0,1% del valor, que es el artefacto del denominador chico.
        </Pie>
        <Pie>
          El índice <b className="font-semibold">empata</b> abajo: dieciséis personas comparten
          el 7,3 porque sus empresas aportan el 0,1% del valor y ninguno de los tres componentes
          las separa. Los empatados llevan un «=» y comparten puesto, como en cualquier tabla de
          posiciones — numerarlos 30, 31, 32 afirmaría un orden que el dato no tiene.
        </Pie>
        <Pie>
          El índice mide a la <b className="font-semibold">empresa</b> y se atribuye a quien la
          dirige: en el dato no hay ninguna métrica de la persona. El voto de esta maqueta se
          guarda en tu navegador — en producción va del lado del servidor, y conviene saber que
          una IP no es una persona: una oficina o una operadora móvil son miles detrás de una
          sola, y cualquiera con VPN vota las veces que quiera.
        </Pie>
      </Seccion>
    </>
  )
}
