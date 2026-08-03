/**
 * Design-kit news categories: six visual buckets (colour, glyph, stock photo).
 * The backend emits finer-grained topics, so each topic maps onto a bucket.
 */
export type NewsCategoryKey =
  | 'produccion'
  | 'regulacion'
  | 'infraestructura'
  | 'gnl'
  | 'empresas'
  | 'mercado'

export type NewsCategoryStyle = {
  color: string
  /** 24×24 stroke path, drawn with stroke-width 1.7 and round caps. */
  icon: string
  photo: string
}

export const NEWS_CATEGORIES: Record<NewsCategoryKey, NewsCategoryStyle> = {
  produccion: {
    color: '#3fb883',
    icon: 'M4 16l5-5 4 4 7-8',
    photo: '/images/news/news-produccion-rig.jpg',
  },
  regulacion: {
    color: '#4a90e2',
    icon: 'M7 4h8l3 3v13H7z M15 4v4h3',
    photo: '/images/news/news-regulacion-pumpjacks.jpg',
  },
  infraestructura: {
    color: '#e2a33f',
    icon: 'M3 12h4a3 3 0 016 0h8 M17 9v6',
    photo: '/images/news/news-infraestructura-oleoducto.jpg',
  },
  gnl: {
    color: '#38b6b6',
    icon: 'M12 3c3 4 5 6 5 10a5 5 0 01-10 0c0-2 1-3 2-4',
    photo: '/images/news/news-gnl-buque.jpg',
  },
  empresas: {
    color: '#9b7ede',
    icon: 'M5 20V6l7-3 7 3v14 M9 20v-4h6v4',
    photo: '/images/news/news-empresas-refineria.jpg',
  },
  mercado: {
    color: '#e2703f',
    icon: 'M5 20V10 M12 20V5 M19 20v-7',
    photo: '/images/news/news-mercado-noche.jpg',
  },
}

/** Glyph for the "all topics" chip. */
export const ALL_TOPICS_ICON = 'M12 3l9 9-9 9-9-9z'

const TOPIC_BUCKET: Record<string, NewsCategoryKey> = {
  produccion: 'produccion',
  ambiente: 'produccion',
  regulacion: 'regulacion',
  rigi: 'regulacion',
  midstream: 'infraestructura',
  gnl: 'gnl',
  m_a: 'empresas',
  servicios: 'empresas',
  laboral: 'empresas',
  exportacion: 'mercado',
  inversion: 'mercado',
  financiamiento: 'mercado',
}

export function categoryStyle(topic: string | null | undefined): NewsCategoryStyle {
  const bucket = topic ? TOPIC_BUCKET[topic] : undefined
  return NEWS_CATEGORIES[bucket ?? 'mercado']
}

/** Topics whose subject the design's photo actually depicts. */
const LITERAL_PHOTO: Record<string, NewsCategoryKey> = {
  produccion: 'produccion',
  regulacion: 'regulacion',
  rigi: 'regulacion',
  midstream: 'infraestructura',
  gnl: 'gnl',
}

const PHOTOS = Object.values(NEWS_CATEGORIES).map((c) => c.photo)

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

/**
 * Artwork for a card with no source image. Topics the photos literally depict
 * keep their photo; everything else spreads across the set so a grid of
 * same-topic stories doesn't repeat one picture six times.
 */
export function photoFor(topic: string | null | undefined, seed: string): string {
  const literal = topic ? LITERAL_PHOTO[topic] : undefined
  if (literal) return NEWS_CATEGORIES[literal].photo
  return PHOTOS[hash(topic || seed) % PHOTOS.length]
}

/** Title-cased slug, used when a topic has no translated label. */
export function fallbackTopicLabel(topic: string): string {
  return topic
    .split(/[\s_-]+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}
