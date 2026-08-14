import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './sistema.css'
import { Indice } from './_ui/Indice'

/* Esqueleto del sistema V2. No es el chrome de Estrato con otros colores: es
   el esqueleto que pide el sistema medido — índice fijo de 288px + columna de
   contenido de 672px, topeado en 960 y CENTRADO NO. En pantallas anchas el
   contenido se queda en 960 y lo que sobra queda a la vista con la trama:
   eso es composición, no relleno.

   El índice cumple el mismo papel que en la referencia (tabla de contenidos),
   sólo que ahí indexaba las 19 secciones de una página única y acá indexa las
   secciones del sitio, que son páginas. */

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Vaca Muerta — sistema V2', template: '%s · V2' },
  description: 'Las secciones de vacamuerta.io rederivadas con el sistema de beautifului.dev.',
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`sistema ${inter.variable} ${mono.variable}`}>
      <div className="grid max-w-[960px] lg:grid-cols-[288px_672px]">
        <Indice />
        <main className="min-w-0">
          {children}
          {/* La referencia cierra con un filete punteado y una línea de
              atribución, no al aire. Es el mismo separador de siempre. */}
          <footer className="s-pie">
            <span className="s-micro" style={{ color: 'var(--ink-2)' }}>
              Prototipo · datos simulados sobre cifras públicas
            </span>
            <span className="s-mono text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
              sistema v2
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}
