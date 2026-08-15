'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CardCuenca } from './CardCuenca'
import { HEADLINE } from '@/fixtures/production'
import { formatMonth } from '@/lib/format'

/* Índice — el panel de la izquierda: marca arriba, lista de secciones, la
   card de la cuenca y el bloque de cierre. Es sticky y de alto de viewport
   desde 1024px; abajo de eso se apila, que es el único reordenamiento que el
   sistema hace en todo el responsive.

   El padding superior es 16px, el mismo que el de las secciones, para que la
   fila de la marca arranque a la misma altura que el primer marco de la
   página. Antes era un clamp de 40 a 80px heredado de la referencia —donde el
   panel no tenía nada con qué alinearse— y dejaba la columna 58px más abajo
   que el contenido. */

const SECCIONES = [
  { href: '/v2', n: '01', label: 'Producción' },
  { href: '/v2/operadoras', n: '02', label: 'Operadoras' },
  { href: '/v2/empresas', n: '03', label: 'Empresas' },
  { href: '/v2/provincias', n: '04', label: 'Provincias' },
  { href: '/v2/indicadores', n: '05', label: 'Indicadores' },
  { href: '/v2/mapa', n: '06', label: 'Mapa' },
  { href: '/v2/noticias', n: '07', label: 'Noticias' },
]

export function Indice() {
  const ruta = usePathname()

  return (
    <aside
      className="flex flex-col px-7 pt-4 pb-7 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
      style={{ borderColor: 'var(--line)' }}
    >
      {/* La marca de vacamuerta.io, la misma de Estrato: rombo monocromo más
          la palabra. Va en card, como el resto de la columna: superficie,
          radio 10 y anillo de 1px.

          La fila entera pedía 216px sobre 208 disponibles, así que la palabra
          se truncaba en "VACAMUERTA...". En vez de forzar un solo valor al
          límite, se recortan cuatro: padding de 12 a 10, los dos gaps de 12 y
          10 a 8, el tracking de 0,14 a 0,10em y el chip a 10,5px. Con eso
          entra con margen y no depende de que la fuente cargue. */}
      <div className="s-card flex shrink-0 items-center justify-between gap-2 px-2.5 py-2.5">
        <Link href="/v2" className="flex min-w-0 items-center gap-2 no-underline">
          <span
            aria-hidden
            className="size-2 shrink-0 rotate-45"
            style={{ background: 'var(--ink)' }}
          />
          <span
            className="s-micro truncate font-medium uppercase"
            style={{ color: 'var(--ink-2)', letterSpacing: '0.10em' }}
          >
            Vacamuerta.io
          </span>
        </Link>
        <span className="s-chip s-chip--neutro s-mono shrink-0 !px-2 !text-[10.5px]">
          {formatMonth(`${HEADLINE.period}-01`)}
        </span>
      </div>

      <div className="mt-7 shrink-0" />

      {/* Sin flex-1: con siete ítems, estirar la lista abría un hueco de 400px
          entre el último ítem y la card. Ahora todo se apila arriba y el aire
          sobrante queda al pie, que es como se lee una columna normal.
          Se va también la máscara de desvanecido: servía cuando la lista
          desbordaba, y sobre una lista corta lo único que hacía era borronear
          el último ítem. */}
      <nav className="relative shrink-0">
        <p className="s-etq mb-1 pl-1.5">Secciones</p>
        {SECCIONES.map((s) => {
          const activa = s.href === '/v2' ? ruta === '/v2' : ruta.startsWith(s.href)
          return (
            <Link key={s.href} href={s.href} className="s-item" aria-current={activa ? 'page' : undefined}>
              <span className="s-mono w-4 shrink-0 text-[11px]" style={{ color: 'var(--ink-3)' }}>
                {s.n}
              </span>
              {s.label}
            </Link>
          )
        })}
      </nav>

      {/* La card va entre el índice y el bloque de datos: cierra la columna
          con la cifra que resume todo, en el lugar donde antes había un
          titular que no aportaba dato. */}
      <div className="mt-7 shrink-0">
        <CardCuenca />
      </div>

      <div className="mt-6 shrink-0">
        <p className="m-0 text-[12.5px] font-medium">Datos públicos</p>
        <p className="s-desc m-0 mt-0.5">
          Secretaría de Energía y balances de las operadoras. Corte mensual.
        </p>
        <Link href="/" className="s-pill mt-2.5">
          Ver el prototipo Estrato <span aria-hidden>→</span>
        </Link>
      </div>
    </aside>
  )
}
