'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HEADLINE } from '@/fixtures/production'
import { formatMonth } from '@/lib/format'

/* Índice — el panel de la izquierda. Sigue la anatomía medida: marca arriba,
   titular, filete punteado, lista de secciones, y al pie el bloque de autoría
   con un pill. Es sticky y de alto de viewport desde 1024px; abajo de eso se
   apila con borde inferior punteado, que es el único reordenamiento que el
   sistema hace en todo el responsive.

   La lista se desvanece por abajo con una máscara, como la referencia: es lo
   que avisa que hay más sin poner una barra de scroll. */

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
      className="flex flex-col px-7 pt-10 pb-7 lg:sticky lg:top-0 lg:h-dvh lg:overflow-hidden lg:pt-[clamp(2.5rem,8vh,5rem)]"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          {/* La marca es un cuadrado con el radio de card: el sistema no tiene
              logotipos, tiene piezas con el mismo vocabulario que el resto. */}
          <span
            className="grid size-11 shrink-0 place-items-center rounded-[10px] text-[15px] font-semibold"
            style={{ background: 'var(--accent)', color: '#fff', letterSpacing: '-0.02em' }}
          >
            VM
          </span>
          <span className="s-chip s-chip--neutro s-mono mt-0.5">
            {formatMonth(`${HEADLINE.period}-01`)}
          </span>
        </div>

        <h1 className="s-titular mt-7 text-balance">
          La cuenca en números, actualizada cada mes.
        </h1>
      </div>

      <div className="my-6 shrink-0" />

      <nav
        className="relative min-h-0 flex-1 lg:overflow-hidden"
        style={{
          maskImage: 'linear-gradient(180deg,#000 82%,transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg,#000 82%,transparent 100%)',
        }}
      >
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

      <div className="mt-8 shrink-0">
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
