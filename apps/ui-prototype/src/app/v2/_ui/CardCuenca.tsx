/* Mini card del índice — foto alusiva y la leyenda, sin ningún dato.

   Usa la receta de card de la referencia y nada más: radio 10, superficie de
   card, anillo de 1px por sombra, overflow oculto y 12px de padding. La foto
   sale a sangre porque el overflow del card la recorta contra el radio.

   La foto va desaturada a la mitad. En el original es un atardecer naranja
   muy saturado y, en una columna donde todo lo demás es gris azulado, se
   comía la atención de una pieza que es secundaria. A la mitad sigue
   leyéndose como foto en color pero deja de gritar. Es un solo número si
   querés más o menos.

   Va con <img> plano y no con next/image: en pantallas de densidad 2 el
   optimizador no llegaba a servirla —ni siquiera disparaba la petición— y la
   card quedaba vacía. Son 139 KB de un JPG estático que se muestra a 232px
   de ancho; no hay nada que optimizar que justifique el riesgo. */

export function CardCuenca() {
  return (
    <div className="s-card">
      <img
        src="/images/vm-rig.jpg"
        alt="Equipo de perforación en la cuenca Neuquina"
        width={992}
        height={557}
        loading="eager"
        decoding="async"
        className="block w-full"
        style={{ aspectRatio: '16 / 9', height: 'auto', objectFit: 'cover', filter: 'grayscale(0.5)' }}
      />
      <p className="s-cuerpo m-0 p-3 font-medium text-balance">
        La cuenca en números, actualizada cada mes.
      </p>
    </div>
  )
}
