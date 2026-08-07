import type { Metadata } from 'next'
import { Inter_Tight, Schibsted_Grotesk } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/ui/shell/Header'
import { Footer } from '@/ui/shell/Footer'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-schibsted',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Estrato — prototipo vacamuerta.io', template: '%s · Estrato' },
  description: 'Gemelo visual de vacamuerta.io bajo el design system Estrato. Datos simulados.',
}

/* Setea data-theme antes del primer paint. Sin el hack opacity:0 del sitio
   actual: si este script no corre, la página se ve igual (en claro). */
const themeInit = `try{var t=localStorage.getItem('estrato-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${interTight.variable} ${schibsted.variable}`} suppressHydrationWarning>
      <body>
        <Script id="estrato-theme" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <Header />
        <main id="contenido" tabIndex={-1} className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
