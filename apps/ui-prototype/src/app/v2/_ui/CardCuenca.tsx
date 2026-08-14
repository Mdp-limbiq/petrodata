/* Mini card del índice — foto alusiva y la leyenda, sin ningún dato.

   Usa la receta de card de la referencia y nada más: radio 10, superficie de
   card, anillo de 1px por sombra, overflow oculto y 12px de padding. La foto
   sale a sangre porque el overflow del card la recorta contra el radio.

   La foto va en blanco y negro pleno y lavada. Lo pedido era B/N con una capa
   de gris al 10% encima para aclararla; va con `contrast(0.9)`, que es la
   MISMA operación sin sumar un elemento:

     capa de gris al 10%:  salida = 0,9 · imagen + 0,1 · gris
     contrast(0.9) en CSS: salida = 0,9 · imagen + 0,05

   Coinciden exacto cuando el gris de la capa es el 50%, o sea gris medio.
   Así que el filtro reemplaza a la capa sin un div absoluto de por medio, y
   además se apaga solo si algún día la card cambia de fondo.

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
        style={{ aspectRatio: '16 / 9', height: 'auto', objectFit: 'cover', filter: 'grayscale(1) contrast(0.9)' }}
      />
      <p className="s-cuerpo m-0 p-3 font-medium text-balance">
        La cuenca en números, actualizada cada mes.
      </p>
    </div>
  )
}
