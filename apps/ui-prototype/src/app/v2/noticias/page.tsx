import Link from 'next/link'
import { Seccion, Card, CardHead, Pie, FilaNoticia } from '../_ui/kit'
import { NEWS } from '@/fixtures/news'

/* NOTICIAS — el caso donde más se aparta de lo que teníamos.

   Estrato usa cards con foto en grilla. Este sistema no tiene ese componente:
   trata las imágenes como accesorio (nueve en todo el sitio de referencia, y
   siete son data-URI de 12px) y resuelve las listas con filas densas. Así que
   las noticias pasan de cards con foto a filas de fecha, título y fuente.

   No es una pérdida: en una lista de veinte notas, la foto no ayuda a elegir
   —todas son fotos de pozos— y la fecha sí. */

export default function V2Noticias() {
  const orden = NEWS.slice().sort((a, b) => b.date.localeCompare(a.date))
  const porCategoria = orden.reduce<Record<string, number>>((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1
    return acc
  }, {})
  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])

  return (
    <>
      <Seccion
        n="01"
        titulo="Cobertura de la cuenca"
        desc="Cuántas notas hay por tema en el período cargado."
      >
        <div className="flex flex-wrap gap-2">
          {categorias.map(([cat, n]) => (
            <span key={cat} className="s-chip s-chip--neutro">
              {cat}
              <span className="s-num" style={{ color: 'var(--ink-3)' }}>
                {n}
              </span>
            </span>
          ))}
        </div>
      </Seccion>

      <Seccion
        n="02"
        titulo="Principales noticias"
        desc="Todas, por fecha, con su fuente y su tema."
      >
        <Card>
          <CardHead titulo="Últimas primero" nota={`${orden.length} notas`} />
          {orden.map((n) => (
            <FilaNoticia
              key={n.id}
              id={n.id}
              href={`/noticias/${n.id}`}
              titulo={n.title}
              resumen={n.summary}
              fuente={n.source}
              fecha={n.date}
              categoria={n.category}
              minutos={n.readingMin}
              imagen={n.image}
            />
          ))}
        </Card>
        <Pie>
          La fuente va en la tinta media y no en la más tenue: es dato que hay que poder
          leer. En la tinta tenue quedan sólo la fecha y los conteos.
        </Pie>
      </Seccion>
    </>
  )
}
