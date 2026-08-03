import { getTranslations } from 'next-intl/server'

/** Operators shown beside the news hero, per the design kit. */
const SPONSORS = [
  { name: 'YPF', src: '/logos/ypf.svg' },
  { name: 'Pan American Energy', src: '/logos/pan-american.svg' },
  { name: 'Vista', src: '/logos/vista.svg' },
  { name: 'Pampa Energía', src: '/logos/pampa.svg' },
  { name: 'Shell', src: '/logos/shell.svg' },
  { name: 'Chevron', src: '/logos/chevron.svg' },
]

export async function NewsSponsors() {
  const t = await getTranslations('noticias')

  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-[9.5px] font-medium uppercase tracking-[0.25em] text-nd-text-disabled sm:self-end font-mono">
        {t('sponsorsLabel')}
      </span>
      <div className="grid grid-cols-3 gap-2.5">
        {SPONSORS.map((s) => (
          <span
            key={s.name}
            className="group flex items-center justify-center rounded-[9px] border border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#fafafa_50%,#f2f2f0_100%)] px-3 py-3.5 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-[linear-gradient(135deg,#20242a_0%,#1b1f24_50%,#16191d_100%)] dark:hover:border-white/20"
          >
            {/* Static local marks — plain img keeps the intrinsic aspect ratio.
                The SVGs are solid black ink, so dark mode inverts them to white. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.src}
              alt={s.name}
              className="h-6 w-[78px] object-contain opacity-55 grayscale transition-opacity group-hover:opacity-95 dark:opacity-45 dark:invert dark:group-hover:opacity-85"
            />
          </span>
        ))}
      </div>
    </div>
  )
}
