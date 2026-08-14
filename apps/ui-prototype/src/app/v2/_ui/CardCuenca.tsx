import Link from 'next/link'
import { HEADLINE } from '@/fixtures/production'
import { formatCompact, formatInteger, formatPercent } from '@/lib/format'

/* Mini card de la cuenca — el mismo esqueleto que las cards de provincia de
   vacamuerta.io, comprimido al ancho del índice (232px).

   Anatomía portada de esa card: punto de color + volanta → nombre grande →
   dos cifras con su rótulo → enlace → barra de participación al pie.

   El fondo simula una foto con dos degradados en vez de traer una imagen:
   el sistema trata la imagen como accesorio y una foto real de 232px sería
   ilegible. El velo diagonal hace lo que hace el velo sobre la foto original
   —bajar el fondo para que el texto se lea— sin depender de qué haya en la
   imagen. */

const FONDO =
  'linear-gradient(155deg, rgba(20,22,26,0.55) 0%, rgba(14,16,19,0.86) 58%, rgba(10,11,13,0.96) 100%),' +
  'radial-gradient(125% 95% at 74% 10%, #6b6f76 0%, #454951 32%, #24272c 66%, #131518 100%)'

export function CardCuenca() {
  return (
    <div
      className="relative overflow-hidden rounded-[10px] p-3"
      style={{ background: FONDO, boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
    >
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: '#f0a52a', boxShadow: '0 0 6px rgba(240,165,42,0.7)' }}
        />
        <span
          className="text-[10px] font-medium uppercase"
          style={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.12em' }}
        >
          Cuenca Neuquina
        </span>
      </span>

      <p className="m-0 mt-1.5 text-[19px] font-semibold leading-tight" style={{ color: '#fff' }}>
        Vaca Muerta
      </p>

      <div className="mt-2.5 flex items-end gap-4">
        <span>
          <span className="s-num block text-[15px] font-semibold" style={{ color: '#fff' }}>
            {formatInteger(HEADLINE.activeWells)}
          </span>
          <span
            className="block text-[9.5px] uppercase"
            style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}
          >
            Pozos
          </span>
        </span>
        <span>
          <span className="s-num block text-[15px] font-semibold" style={{ color: '#fff' }}>
            {formatCompact(HEADLINE.boeMonth)}
          </span>
          <span
            className="block text-[9.5px] uppercase"
            style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}
          >
            BOE del mes
          </span>
        </span>
      </div>

      <Link
        href="/v2/mapa"
        className="mt-2.5 block text-[11px] no-underline"
        style={{ color: 'rgba(255,255,255,0.86)' }}
      >
        Ver el mapa <span aria-hidden>→</span>
      </Link>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span
          className="text-[9.5px] uppercase"
          style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}
        >
          Part. nacional
        </span>
        <span className="s-num text-[11.5px] font-semibold" style={{ color: '#fff' }}>
          {formatPercent(HEADLINE.vmShare)}
        </span>
      </div>
      <span
        className="mt-1.5 block h-1 w-full overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.18)' }}
      >
        <i
          className="block h-full rounded-full"
          style={{ width: `${HEADLINE.vmShare * 100}%`, background: '#f0a52a' }}
        />
      </span>
    </div>
  )
}
