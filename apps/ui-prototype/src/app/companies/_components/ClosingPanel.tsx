import Link from 'next/link'
import { formatDecimal, formatInteger } from '@/lib/format'
import { STATS } from '../_lib/stats'

/* Cierre de la página — card negra de la familia, igual que el impacto de
   Indicadores: la oscuridad es jerarquía. Afirma la conclusión del dataset
   en vez de terminar pidiendo un mail; la invitación a sumarse al listado
   baja a línea secundaria (en on-dark-2, que es un enlace y tiene que leerse). */

export function ClosingPanel() {
  const s = STATS
  const anclas = [
    { label: 'Operadoras', value: String(s.grandes) },
    { label: 'De la producción', value: `${formatDecimal(s.pctGrandes, 1)}%` },
    { label: 'Pozos en el país', value: formatInteger(s.pozosTotales) },
  ]
  return (
    <div className="rounded-[10px] border-4 border-black bg-inverse p-5 md:p-6">
      <span className="type-label block !text-oil">La conclusión del ranking</span>
      <p className="type-display mt-3 max-w-3xl text-balance !text-[1.5rem] !leading-[1.25] !text-white md:!text-[1.75rem]">
        La cuenca la mueven {s.grandes} operadoras.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
        {anclas.map((a) => (
          <div key={a.label}>
            <span className="type-label block !text-on-dark-2">{a.label}</span>
            <span className="type-kpi mt-1 block text-3xl !text-white md:text-4xl">{a.value}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-pretty text-[13px] leading-relaxed text-on-dark-2">
        Las otras {s.cola} empresas del listado suman {formatDecimal(s.pctCola, 1)}% de la producción
        y operan {formatInteger(s.pozosCola)} pozos, el {formatDecimal(s.pctPozosCola, 1)}% del
        parque del país: más de la mitad de los pozos aportan menos de una décima parte del crudo y
        el gas.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4">
        <Link
          href="/indicadores"
          className="text-[13px] text-on-dark-2 underline underline-offset-2 transition-colors hover:!text-white"
        >
          Ver la cuenca en números →
        </Link>
        <span className="text-[13px] text-on-dark-3">
          ¿Tenés un pozo o estás perforando en la zona?{' '}
          <a
            href="mailto:info@vacamuerta.io"
            className="text-on-dark-2 underline underline-offset-2 transition-colors hover:!text-white"
          >
            info@vacamuerta.io
          </a>
        </span>
      </div>

      <span className="mt-4 block text-[10px] text-on-dark-3">
        Ranking nacional de producción · Update 08-2026
      </span>
    </div>
  )
}
