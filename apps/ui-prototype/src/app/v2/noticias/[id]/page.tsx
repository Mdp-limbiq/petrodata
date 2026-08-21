import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Card,
  FilaNoticia,
  Seccion,
  Tag,
  colorCategoria,
} from '../../_ui/kit'
import { Icono, PATH } from '../../_ui/iconos'
import { CATEGORY_LABEL, NEWS } from '@/fixtures/news'
import { formatDate } from '@/lib/format'

/* LA NOTA — el cuerpo del artículo, rederivado.

   Lo que había en la ruta vieja: hero con foto, entradilla, caja de puntos
   clave, cinco párrafos con una cita en el medio, un rail derecho con video y
   un espacio publicitario, y tres relacionadas en cards con foto.

   Lo que cambia y por qué:

   · SE VA EL RAIL. No es una decisión de gusto: la columna de contenido del
     sistema mide 672 y el rail de la ruta vieja necesita 336 más el cuerpo en
     44rem, o sea unos 1.040. No entra. El video —cuando la nota lo trae— sube
     al cuerpo, que es donde ya iba en móvil.

   · SE VA EL ESPACIO PUBLICITARIO. Era un rectángulo gris de 336×280 con la
     palabra «publicidad». En un prototipo de sistema no mide nada: no hay
     ninguna decisión de diseño ahí que verificar.

   · SE VA LA CITA DESTACADA. La elegía un buscador de oraciones que prefería
     la que tuviera un número, y con el cuerpo simulado eso daba relleno: en
     media docena de notas eligió «En los despachos de Shale24 y de las
     operadoras de la cuenca, la lectura es la misma» —el «número» es el 24 de
     la marca— o cayó al título. Una cita destacada existe para levantar UNA
     frase real de un artículo real; sin artículo real no levanta nada, y es
     decoración con forma de énfasis editorial. Vuelve el día que el pipeline
     traiga el cuerpo.

   · LAS RELACIONADAS PASAN DE CARDS A FILAS. Es la misma fila que el listado
     y el dashboard. Tres tratamientos para una noticia era el problema que ya
     se arregló en el listado; traer las cards de vuelta acá lo reabría.

   El cuerpo sigue siendo SIMULADO, como en la ruta vieja, y sigue estando
   declarado al pie. Lo real del fixture son el título, el resumen, la fuente,
   la fecha, la categoría y el tiempo de lectura. */

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const item = NEWS.find((n) => n.id === id)
  return { title: item ? item.title : 'Noticia', description: item?.summary }
}

export function generateStaticParams() {
  return NEWS.map((n) => ({ id: n.id }))
}

/* Cuerpo simulado: párrafos cortos, de dos a cuatro oraciones, que es la
   práctica editorial del rubro. Se genera igual que en la ruta vieja —misma
   forma y mismo ritmo— porque lo que se está probando acá es la composición,
   no el texto. */
function cuerpo(resumen: string, categoria: string, fuente: string): string[] {
  return [
    resumen,
    `El dato consolida una tendencia que el sector venía anticipando desde comienzos de año. En los despachos de ${fuente} y de las operadoras de la cuenca, la lectura es la misma.`,
    'La curva de aprendizaje del shale argentino sigue comprimiendo costos y tiempos de perforación. Y eso se traduce directamente en los números del mes.',
    `Puertas adentro de la industria, el capítulo de ${categoria.toLowerCase()} concentra las conversaciones. Cada licitación y cada anuncio de inversión se sigue de cerca.`,
    'Los equipos técnicos apuntan a tres cuellos de botella: disponibilidad de sets de fractura, capacidad de evacuación y logística de arena.',
    'Hacia adelante, los analistas coinciden en que el ritmo dependerá menos de la geología —ya probada— y más de la macro: financiamiento, reglas estables e infraestructura terminada.',
  ]
}

/* Los puntos clave NO incluyen el resumen. En la ruta vieja el primero era el
   resumen tal cual, y el resumen es además la entradilla del cuerpo: la misma
   frase aparecía dos veces con doscientos píxeles de distancia. Quedan los dos
   derivados, que es lo que aporta algo distinto de la entradilla. */
function puntosClave(categoria: string): string[] {
  return [
    `El capítulo de ${categoria.toLowerCase()} concentra la conversación del sector: sets de fractura, evacuación y logística de arena son los cuellos de botella a vigilar.`,
    'El ritmo hacia adelante depende menos de la geología y más de la macro: financiamiento, reglas estables e infraestructura en marcha.',
  ]
}

export default async function V2Nota({ params }: { params: Params }) {
  const { id } = await params
  const item = NEWS.find((n) => n.id === id)
  if (!item) notFound()

  const rot = CATEGORY_LABEL[item.category]
  const color = colorCategoria(item.category)
  const cuerpos = cuerpo(item.summary, rot, item.source)
  const puntos = puntosClave(rot)

  /* Primero las de la misma categoría y después las más recientes, para que
     siempre haya tres aunque la categoría tenga una sola nota. */
  const mismaCat = NEWS.filter((n) => n.id !== item.id && n.category === item.category)
  const resto = NEWS.filter(
    (n) => n.id !== item.id && n.category !== item.category,
  ).sort((a, b) => b.date.localeCompare(a.date))
  const relacionadas = [...mismaCat, ...resto].slice(0, 3)

  return (
    <>
      {/* La nota NO va numerada. La plantilla del sistema numera secciones
          porque una página es una lista de secciones; acá la página es UNA
          cosa y el número diría «01 de 1». Las relacionadas sí, porque ahí
          vuelve a haber una sección. */}
      <section className="s-seccion">
        <div className="s-marco">
          <nav aria-label="Miga de pan" className="mb-3">
            <Link href="/v2/noticias" className="s-pill">
              <span aria-hidden>←</span> Noticias
            </Link>
          </nav>

          <Card>
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch">
              {/* La misma placa de 161 que la destacada del listado: una nota
                  no cambia de identidad visual por estar abierta. */}
              <span
                className="s-placa s-placa--grande shrink-0 overflow-hidden"
                style={{ padding: 0 }}
                aria-hidden
              >
                <img
                  src={item.image ?? '/images/news/news-produccion-rig.jpg'}
                  alt=""
                  width={640}
                  height={640}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(1) contrast(0.9)',
                  }}
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="mb-1.5 flex items-center gap-2">
                  <Tag color={color}>{rot}</Tag>
                  <span className="s-mono text-[10.5px]" style={{ color: 'var(--ink-2)' }}>
                    {item.date}
                  </span>
                </span>
                {/* 21/600, que es .s-titular: el sistema lo reserva para el
                    título de la página y el titular de una nota ES el título
                    de la página. Es el único 21 de todo v2. */}
                <h1 className="s-titular m-0">{item.title}</h1>
                <span
                  className="s-micro mt-auto flex flex-wrap items-center gap-1.5 pt-2"
                  style={{ color: 'var(--ink-2)' }}
                >
                  {item.source}
                  {item.readingMin ? (
                    <>
                      <span style={{ color: 'var(--ink-3)' }}>·</span>
                      {item.readingMin} min de lectura
                    </>
                  ) : null}
                </span>
              </span>
            </div>
          </Card>

          {/* PUNTOS CLAVE. En la ruta vieja era una caja con un borde de color
              a la izquierda; acá es el riel de desglose que ya usan provincias
              y empresas —.s-rama con un .s-paso por línea—. Es la pieza del
              sistema para «esto se desprende de aquello», que es exactamente
              lo que un punto clave es respecto de la nota. */}
          <Card className="mt-3">
            <div className="px-3 py-3">
              <span className="s-etq mb-2 block">Puntos clave</span>
              <div className="s-rama">
                {puntos.map((p) => (
                  <div key={p} className="s-paso s-paso--intro">
                    <span className="mt-[3px] shrink-0" style={{ color: 'var(--ink-3)' }}>
                      <Icono d={PATH.lista} size={14} grosor={2} />
                    </span>
                    <span className="s-cuerpo min-w-0">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="s-prosa mt-4 px-1">
            <p className="entrada">{cuerpos[0]}</p>
            <p>{cuerpos[1]}</p>
            <p>{cuerpos[2]}</p>
            <p>{cuerpos[3]}</p>
            <p>{cuerpos[4]}</p>
            <p>{cuerpos[5]}</p>
          </div>

          {/* El pie de card medido —fondo --inset— pero SIN filete arriba: no
              hay cuerpo de card encima del que separarlo, la card es sólo
              este pie. Es la misma jugada que el reparto de la red de gas. */}
          <div className="s-card mt-4">
            <div className="s-pie-card" style={{ borderTop: 0 }}>
              <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
                {item.source} · {formatDate(item.date)} · el cuerpo de la nota está simulado;
                del fixture salen el título, el resumen, la fuente, la fecha, la categoría y el
                tiempo de lectura.
              </span>
            </div>
          </div>
        </div>
      </section>

      <Seccion n="01" titulo="Relacionadas" desc={`Otras notas de ${rot.toLowerCase()}.`}>
        <Card>
          {relacionadas.map((n) => (
            <FilaNoticia
              key={n.id}
              id={n.id}
              href={`/v2/noticias/${n.id}`}
              titulo={n.title}
              fuente={n.source}
              fecha={n.date}
              categoria={n.category}
              rotulo={CATEGORY_LABEL[n.category]}
              minutos={n.readingMin}
              imagen={n.image}
            />
          ))}
        </Card>
      </Seccion>
    </>
  )
}
