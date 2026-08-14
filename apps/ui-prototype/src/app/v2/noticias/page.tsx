import Link from 'next/link'
import { Seccion, Card, CardHead, Chip, Pie } from '../_ui/kit'
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
        titulo="Cobertura"
        desc="Cuántas notas hay por categoría en el período cargado."
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
        titulo="Publicaciones"
        desc="Todas las notas por fecha, con su fuente y su categoría."
        ancho="suelto"
      >
        <Card>
          <CardHead titulo="Últimas primero" nota={`${orden.length} notas`} />
          {orden.map((n) => (
            <Link
              key={n.id}
              href={`/noticias/${n.id}`}
              className="s-fila s-fila-hover items-start no-underline"
              style={{ color: 'inherit' }}
            >
              <span
                className="s-mono w-[74px] shrink-0 pt-0.5 text-[10.5px]"
                style={{ color: 'var(--ink-3)' }}
              >
                {n.date.slice(0, 10)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="s-cuerpo block font-medium">{n.title}</span>
                <span className="s-desc mt-0.5 block">{n.summary}</span>
                <span
                  className="s-micro mt-1 block"
                  style={{ color: 'var(--ink-2)' }}
                >
                  {n.source}
                  {n.readingMin ? ` · ${n.readingMin} min` : ''}
                </span>
              </span>
              <Chip>{n.category}</Chip>
            </Link>
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
