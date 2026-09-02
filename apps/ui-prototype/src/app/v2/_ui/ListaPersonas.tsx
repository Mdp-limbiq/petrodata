'use client'

import { Fragment, useMemo, useState } from 'react'
import { Icono, PATH } from './iconos'
import { conVoto, dia, LIMITE, proximoCorte } from './voto-reglas'
import { useVotos } from './votos'
import type { PersonaFila } from '@/fixtures/personas'
import { formatDecimal } from '@/lib/format'

/* LA LISTA DE PERSONALIDADES — el índice, y el voto por fila.

   El voto acá es una MAQUETA. En producción tiene que vivir en el servidor: el
   enunciado es «un voto por semana por IP», y eso no se puede sostener desde el
   navegador —quien vota puede borrar el storage y volver a votar—. Se guarda en
   localStorage para poder ver la interacción, y la card lo dice.

   Y conviene dejar escrito lo que una IP no resuelve, porque es la parte que se
   descubre tarde: una oficina, una universidad o una operadora móvil son miles
   de personas detrás de UNA IP, así que el límite semanal bloquea a todos menos
   al primero; y cualquiera con una VPN vota las veces que quiera. Sirve como
   fricción, no como control. Si el ranking va a significar algo, el voto
   necesita una cuenta.

   La semana arranca el lunes, que es lo que dice la cabecera. El identificador
   de semana se calcula del lado del cliente y con eso se descartan los votos
   viejos: sin eso, «se renueva cada lunes» sería una frase y no un
   comportamiento. */

export function ListaPersonas({ personas }: { personas: PersonaFila[] }) {
  const { votos, votar, restantes } = useVotos()
  /* UNA SOLA FILA ABIERTA A LA VEZ. Con varias abiertas la lista deja de ser
     una tabla de posiciones —los puestos quedan a cuarenta píxeles unos de
     otros y a trescientos otros— y el orden, que es lo único que la fila tiene
     que comunicar, se pierde. */
  const [abierta, setAbierta] = useState<string | null>(null)

  /* EL VOTO ENTRA EN EL NÚMERO. Antes se guardaba y no pasaba nada: la página
     decía que la votación semanal pesa y el ranking no se movía nunca. Ahora
     cada voto suma o resta (ver PESO_VOTO) y la lista se reordena acá mismo,
     en el render, sin esperar nada.

     Se ordena por el valor ya ajustado, no por el del fixture. El orden del
     fixture se guarda aparte para poder mostrar cuánto se movió cada uno. */
  const base = useMemo(() => {
    const m: Record<string, number> = {}
    personas.forEach((p, i) => {
      m[p.slug] = i + 1
    })
    return m
  }, [personas])

  /* EL CORTE. La lista se ordena SÓLO con los votos de días anteriores. Los de
     hoy están emitidos y no se pueden deshacer, pero no mueven a nadie hasta
     medianoche. Ver voto-reglas.ts. */
  const hoy = dia()
  const filas = useMemo(
    () =>
      personas
        .map((p, i) => {
          const e = votos[p.slug]
          const dentro = e && e.d !== hoy ? e.v : undefined
          return {
            ...p,
            orden: i,
            puntos: conVoto(p.indice, dentro),
            pendiente: !!e && e.d === hoy,
          }
        })
        /* EL DESEMPATE ES EXPLÍCITO y no el que regala el sort estable: con
           veinticinco personas empatadas, dejarlo librado a la implementación
           es dejar librado el puesto de la mitad de la lista. Se cae al orden
           del fixture, que es el del ranking de empresas —el mismo que produjo
           el índice—, así que dentro de un empate manda la empresa más
           grande. */
        .sort((a, b) => b.puntos - a.puntos || a.orden - b.orden),
    [personas, votos, hoy],
  )

  /* PUESTO ÚNICO, 01 a 48 (pedido de Mariano, 2026-09-01: «no tiene que haber
     empates de puestos»). Antes se compartía el puesto entre empatados, que es
     la convención de las tablas deportivas.

     Lo que hay que tener presente, porque el dato no cambió: los empates SIGUEN
     ESTANDO. Dieciséis personas tienen exactamente 7,3 y otras nueve están en
     grupos de dos y tres —veinticinco de cuarenta y ocho—. Con puesto único, el
     orden adentro de cada grupo lo pone el desempate y no una diferencia de
     puntos: entre el 24.º y el 39.º no hay nada que los separe salvo el tamaño
     de la empresa. La pastilla de Puntos, que va al lado, lo deja ver. */
  const puestos = useMemo(() => {
    const m: Record<string, number> = {}
    filas.forEach((p, i) => {
      m[p.slug] = i + 1
    })
    return m
  }, [filas])

  const sinCredito = `Ya usaste tus ${LIMITE} votos de esta semana`
  const yaVoto = 'Ya votaste a esta persona; el voto no se edita hasta el lunes'
  const enCorte = 'Tu voto quedó registrado y entra en el próximo corte'

  return (
    <>
      {/* Los rótulos de columna. Sin ellos el número y los chevrones no se
          sabe qué son — el badge podía leerse como un precio o un porcentaje.
          Los anchos repiten los de la fila para que caigan a plomo. */}
      {/* La cabecera usa la MISMA grilla que la fila —.s-persona y .s-pcab
          comparten grid-template-columns— así que las columnas caen a plomo
          sin que nadie sincronice anchos a mano. Antes eran dos flex y la
          cabecera reservaba 100px para un voto que medía 98. */}
      <div className="s-pcab hidden sm:grid">
        <span />
        {/* «Persona» arranca en la FOTO y no en el nombre: la columna que
            rotula empieza ahí. Ocupando sólo la del nombre, el rótulo quedaba
            60px corrido a la derecha del bloque que describe. */}
        <span style={{ gridColumn: '2 / 4' }}>Persona</span>
        <span className="text-right">Puntos</span>
        <span className="text-center">Voto semanal</span>
      </div>
      {filas.map((p, i) => {
        const mio = votos[p.slug]?.v
        const votado = mio !== undefined
        const agotado = !votado && restantes === 0
        /* Cuántos puestos se movió respecto del orden sin votos. Positivo =
           subió. Es lo que hace visible que el voto sirvió: sin esto la fila
           salta de lugar y no se entiende por qué. */
        const salto = base[p.slug] - puestos[p.slug]
        /* Pero no se muestra siempre. Con tres votos a favor en el pelotón,
           treinta y cuatro personas bajan UN puesto sin que nadie las votara,
           y la lista quedaba llena de flechas rojas de gente que no hizo nada.
           Se muestra si la votaste —ahí la flecha es la respuesta a tu clic— o
           si el salto es de dos o más, que ya no es corrimiento sino que algo
           pasó. */
        const muestraSalto = !p.pendiente && salto !== 0 && (votado || Math.abs(salto) > 1)
        /* LA FILA VOTADA QUEDA TEÑIDA toda la semana, no un instante. El voto
           dura hasta el lunes, así que la marca dura lo mismo: al volver, las
           filas teñidas son las cinco que elegiste. Un destello al hacer clic
           se pierde apenas mirás para otro lado. */
        const marca = votado ? (mio === 1 ? ' s-persona--favor' : ' s-persona--contra') : ''
        const abre = abierta === p.slug
        return (
          <Fragment key={p.slug}>
          {/* La fila ENTERA abre la ficha. No hay un chevrón de «ver más»: la
              fila ya tiene dos chevrones que son el voto, y un tercero al lado
              se lee como un tercer control de lo mismo. El cursor y el fondo
              del hover, que ya existían, alcanzan para decir que se toca.

              Es un div con role/tabIndex y no un <button>: adentro viven los
              dos botones del voto, y un botón dentro de otro botón es HTML
              inválido y un lector de pantalla que no sabe qué anunciar. */}
          <div
            className={`s-persona s-persona--abre${marca}${abre ? ' s-persona--abierta' : ''}`}
            role="button"
            tabIndex={0}
            aria-expanded={abre}
            aria-controls={`ficha-${p.slug}`}
            onClick={() => setAbierta(abre ? null : p.slug)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setAbierta(abre ? null : p.slug)
              }
            }}
          >
            <span className="flex flex-col items-start gap-0.5">
              <span
                className="s-mono text-[11px]"
                /* ink-3 sobre el tinte mide 2,42 en claro y 2,43 en oscuro.
                   Sobre la card blanca ya estaba en 2,72 —es metadata y pasa—
                   pero bajar todavía más justo en la fila que el que vota
                   busca es al revés de lo que se quiere. Sube a ink-2, que
                   sobre el tinte da 5,21 y 5,13. */
                style={{ color: votado ? 'var(--ink-2)' : 'var(--ink-3)' }}
              >
                {/* Sin el «=» del empate y sin el espacio duro que le
                    reservaba el lugar: ese carácter corría el número tres
                    píxeles a la derecha y lo dejaba desalineado con todo lo
                    que caía debajo en la misma columna. */}
                {String(puestos[p.slug]).padStart(2, '0')}
              </span>

              {/* El salto de puesto, sólo cuando lo hubo. Va en la columna del
                  puesto y no al lado de los puntos: del voto interesa el lugar
                  que ganó, no los puntos que sumó. Y va DENTRO de esta celda
                  porque la fila es una grilla de cinco columnas fijas — un
                  hijo más caía en la de la foto y corría toda la fila. */}
              {muestraSalto && (
                <span
                  className={`s-mono flex items-center ${salto > 0 ? 's-sube' : 's-baja'}`}
                  style={{ fontSize: 10, lineHeight: '12px' }}
                  title={`${salto > 0 ? 'Subió' : 'Bajó'} ${Math.abs(salto)} puesto${Math.abs(salto) === 1 ? '' : 's'} esta semana`}
                >
                  {/* El mismo chevrón que los botones de voto, no un ▲ de
                      texto: el sistema dibuja los íconos con trazo, y el
                      triángulo tipográfico venía con su propio interletrado. */}
                  <Icono d={salto > 0 ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} size={11} grosor={2.6} />
                  {Math.abs(salto)}
                </span>
              )}
            </span>

            {/* La cara es un ancla de identidad, no una foto: 32px, que es lo
                que deja la fila en la altura del resto de las listas del sitio.
                Cuando no hay imagen cae al monograma, que es la misma pieza que
                usa la lista de empresas. */}
            <Cara slug={p.slug} nombre={p.nombre} />

            {/* Tres renglones —nombre, cargo, empresa— y no dos: 19,5 + 17,25
                + 17,25 llenan el alto de la foto de 60. En dos, la foto quedaba
                23px más alta que la columna que acompaña. */}
            <span className="flex min-w-0 flex-col justify-center">
              {/* SIN EL CHIP DE «SIN CONFIRMAR» (pedido de Mariano,
                  2026-09-01). El campo `confirmado` ni siquiera llega acá: se
                  quedó del lado del servidor, ver `PersonaFila`.

                  Lo que se pierde y conviene tener escrito: dieciocho de los
                  cuarenta y ocho cargos no están verificados, y varios salen de
                  registros de 2017 y 2018. La página los publica sin distinguir
                  de los que sí lo están. La apuesta es que si alguno está mal,
                  la empresa escriba. */}
              <span className="s-cuerpo flex items-center gap-1.5 font-medium">
                <span className="truncate">{p.nombre}</span>
              </span>
              <span className="s-micro block truncate" style={{ color: 'var(--ink-2)' }}>
                {p.cargo || '—'}
              </span>
              {/* La empresa en ink-2 y no en ink-3: medido daba 2,72 en claro.
                  ink-3 es para metadata que nadie necesita leer —un número de
                  sección, una unidad— y qué empresa dirige esta persona es el
                  dato que sostiene toda la fila. Queda del mismo tono que el
                  cargo, que es correcto: los dos son el contexto del nombre. */}
              <span className="s-micro block truncate" style={{ color: 'var(--ink-2)' }}>
                {p.empresa}
              </span>
            </span>

            {/* El voto NO abre la ficha: se para la propagación en el
                envoltorio de los controles. Sin esto, votar abría la ficha de
                la fila que acabás de votar. */}
            <span className="s-pcontrol" onClick={(e) => e.stopPropagation()}>
            {/* EL PUNTO COMO SEPARADOR DECIMAL (pedido de Mariano,
                2026-09-01), y sólo acá. El resto del sitio va en es-AR con
                coma, que es la convención del país: el puntaje queda como la
                única cifra de la web con punto. Se pide el locale en vez de
                reemplazar el carácter, así el formateo sigue saliendo de
                `formatDecimal` y nadie lo hardcodea en la fila. */}
            <span className="s-idx">{formatDecimal(p.puntos, 1, 'en')}</span>

            {/* Sin el conteo (pedido de Mariano): quedan los dos chevrones. Lo
                único que se pierde es el número; el estado del voto propio se
                sigue viendo, porque el botón elegido queda con su tinte.

                VOTADA LA FILA, EL PAR SE VA Y QUEDA EL BADGE. No conviven: el
                voto no se edita hasta el lunes, así que los dos botones que
                quedaban eran controles muertos, y sumarles un chip abajo daba
                tres piezas diciendo lo mismo en una celda de 100px.

                Con una sola pieza por celda la fila vuelve a tener una altura
                y un eje: el badge mide 22, igual que el de Puntos al lado, y
                los dos caen centrados en el mismo renglón. */}
            <span className="s-voto">
              {votado ? (
                <span
                  className={`s-chip ${mio === 1 ? 's-chip--ok' : 's-chip--bad'}`}
                  title={p.pendiente ? enCorte : yaVoto}
                >
                  {/* EL ÍCONO DICE EN QUÉ ESTADO ESTÁ EL VOTO. Contado, es el
                      chevrón del botón que apretaste: el badge ocupa su lugar y
                      hereda su gramática. Emitido hoy y todavía sin contar, es
                      el reloj.

                      El reloj estaba suelto en la columna del puesto, debajo
                      del número, en una celda de 28px que no es suya: ahí no se
                      entendía a qué se refería y quedaba desalineado. Acá
                      califica al badge que tiene al lado, que es exactamente lo
                      que hace. */}
                  <Icono
                    d={p.pendiente ? PATH.reloj : mio === 1 ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
                    size={11}
                    grosor={p.pendiente ? 2.2 : 2.6}
                  />
                  {mio === 1 ? 'A favor' : 'En contra'}
                </span>
              ) : (
              <span className="par">
                {/* Queda UN motivo para apagar los botones: te quedaste sin
                    crédito. El otro —«ya votaste a esta persona»— dejó de
                    existir acá, porque en esa fila ya no hay botones sino el
                    badge. Dejarlos vivos y que el clic no haga nada es peor:
                    parece que se rompió. */}
                <button
                  type="button"
                  className="arriba"
                  aria-label={`Votar a favor de ${p.nombre}`}
                  disabled={agotado}
                  title={agotado ? sinCredito : undefined}
                  onClick={() => votar(p.slug, 1)}
                >
                  <Icono d="M18 15l-6-6-6 6" size={13} grosor={2.4} />
                </button>
                <button
                  type="button"
                  className="abajo"
                  aria-label={`Votar en contra de ${p.nombre}`}
                  disabled={agotado}
                  title={agotado ? sinCredito : undefined}
                  onClick={() => votar(p.slug, -1)}
                >
                  <Icono d="M6 9l6 6 6-6" size={13} grosor={2.4} />
                </button>
              </span>
              )}
            </span>
            </span>
          </div>
          {abre && <Ficha p={p} puesto={puestos[p.slug]} total={filas.length} />}
          </Fragment>
        )
      })}
    </>
  )
}

/* LA FICHA. Lo que la fila no puede mostrar en 76px de alto.

   NO ES UN COMPONENTE NUEVO: es .s-ficha-fila, que estaba declarado en el CSS
   y sin usar en ningún .tsx —«el desglose que se abre al clickear una fila de
   la lista: etiqueta a la izquierda, valor a la derecha, un renglón por
   dato»—. Estaba escrito para esto exactamente. Lo mismo que pasó con
   .s-creditos en la cabecera.

   LA FOTO VA A 161×200, que es el tamaño NATIVO del archivo: no se amplía
   nada, así que no hay borrón. Y 161 ya es una medida del sistema —el lado de
   .s-placa--grande— así que no se inventa un número.

   LA COMPOSICIÓN es la que enseña .s-placa--grande: la imagen iguala el alto
   de la columna que acompaña para que las dos terminen a ras. Acá no se puede
   clavar, porque la bio cambia de largo y veintiséis fichas no tienen; se
   resuelve al revés, con la columna estirada a la altura de la foto y los
   datos empujados al pie. El bloque cierra parejo tenga bio o no, que es la
   condición para que la ausencia no se lea como una ficha rota.

   NO LLEVA CIFRAS DE LA EMPRESA: producción, valor y pozos son los tres
   insumos del índice. Ver el comentario de `PersonaFila`.

   TAMPOCO REPITE LOS PUNTOS. Estaban como cuarto renglón y son el mismo número
   que la fila de arriba muestra a ocho píxeles: no agregaba nada y estiraba la
   columna 27px por encima del alto de la foto, que es justo lo que rompía el
   cierre a ras. El puesto sí queda, porque «07 de 48» es contexto que la fila
   sola no da. */
function Ficha({
  p,
  puesto,
  total,
}: {
  p: PersonaFila
  puesto: number
  total: number
}) {
  const dominio = (u: string) => {
    try {
      return new URL(u).hostname.replace(/^www\./, '')
    } catch {
      return u
    }
  }
  return (
    <div className="s-ficha s-entra" id={`ficha-${p.slug}`}>
      <CaraGrande slug={p.slug} nombre={p.nombre} />

      <div className="s-ficha-col">
        {/* El cargo ENTERO, que en la fila va truncado: es una de las razones
            de que la ficha exista. 13/600 —.s-titulo—, no más: la jerarquía la
            hace el peso y la tinta, nunca el tamaño. */}
        <div className="s-titulo">{p.cargo || '—'}</div>
        <div className="s-micro" style={{ color: 'var(--ink-2)' }}>
          {p.empresa}
        </div>

        {/* La bio si existe, en la prosa del sistema —13/19,5— y con el ancho
            cortado en ch: a 380px de columna una línea de 13px entra en unos
            60 caracteres y ahí se lee sin que el ojo se pierda al volver.

            Veintiséis de las cuarenta y ocho no tienen, y no se rellena con
            prosa plausible: es el error que ya costó doce caras inventadas.
            Lo que sostiene la ficha cuando falta es el pie, que va siempre. */}
        {p.bio && (
          <p className="s-cuerpo s-ficha-bio" style={{ color: 'var(--ink-2)' }}>
            {p.bio}
          </p>
        )}

        {/* El pie, empujado abajo por el margin-top:auto de .s-ficha-datos. Es
            lo que hace verificable la fila y por eso va siempre, con bio o
            sin ella. */}
        <div className="s-ficha-datos">
          <div className="s-ficha-fila">
            <span style={{ color: 'var(--ink-2)' }}>Puesto</span>
            <span className="s-cifra-sm ml-auto">
              {String(puesto).padStart(2, '0')}
              <span className="font-normal" style={{ color: 'var(--ink-3)' }}>
                {' '}
                de {total}
              </span>
            </span>
          </div>
          {p.desde && (
            <div className="s-ficha-fila">
              <span style={{ color: 'var(--ink-2)' }}>Cargo registrado</span>
              <span className="s-mono ml-auto">{p.desde}</span>
            </div>
          )}
          {p.fuente && (
            <div className="s-ficha-fila">
              <span style={{ color: 'var(--ink-2)' }}>Fuente</span>
              {/* El link es lo que separa esto de una lista de nombres: es un
                  ranking de personas con nombre y apellido calculado con cifras
                  que no son de ellas, y poder ver de dónde sale el cargo es la
                  diferencia. rel="noreferrer" porque son sitios de terceros. */}
              <a
                className="s-chip s-chip--neutro s-chip--mini ml-auto"
                href={p.fuente}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={p.fuente}
              >
                {dominio(p.fuente)}
                <Icono d={PATH.enlace} size={11} grosor={2.2} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** La misma cara de la fila, en 96×120, con la misma caída al monograma. */
function CaraGrande({ slug, nombre }: { slug: string; nombre: string }) {
  const [rota, setRota] = useState(false)
  const ini = iniciales(nombre)
  if (rota) return <span className="s-cara-gr s-cara--mono">{ini}</span>
  return (
    <img
      className="s-cara-gr"
      src={`/images/ceos/${slug}.jpg`}
      alt=""
      width={161}
      height={200}
      loading="lazy"
      decoding="async"
      onError={() => setRota(true)}
    />
  )
}

/** La cara, con caída al monograma. El `onError` es la caída de verdad: el
    archivo puede no estar —las imágenes no se versionan— y una cara rota es
    peor que dos iniciales. */
/** Primera y última inicial. La usan la cara de la fila y la de la ficha. */
function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('')
    .toUpperCase()
}

function Cara({ slug, nombre }: { slug: string; nombre: string }) {
  const [rota, setRota] = useState(false)
  const ini = iniciales(nombre)

  if (rota) return <span className="s-cara s-cara--mono">{ini}</span>
  return (
    <img
      className="s-cara"
      src={`/images/ceos/${slug}.jpg`}
      alt=""
      width={200}
      height={200}
      loading="lazy"
      decoding="async"
      onError={() => setRota(true)}
    />
  )
}
