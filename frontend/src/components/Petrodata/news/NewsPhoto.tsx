import Image from 'next/image'
import { cn } from '@/utilities/ui'

/**
 * Card artwork. Local design photos go through next/image; source images live on
 * arbitrary hosts that aren't in `remotePatterns`, so those render as plain img.
 */
export function NewsPhoto({
  src,
  sizes,
  className,
}: {
  src: string
  sizes: string
  className?: string
}) {
  if (src.startsWith('/')) {
    // quality 100 is the only value allowed by next.config's `images.qualities`.
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        quality={100}
        className={cn('object-cover', className)}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
    />
  )
}
