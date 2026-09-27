# Producto

Fira Estudio es una vidriera digital publica de productos textiles artesanales.

El objetivo vigente es mostrar el catalogo, presentar la marca y facilitar consultas manuales sobre productos, variantes y disponibilidad. WhatsApp es el canal principal de consulta cuando `NEXT_PUBLIC_WHATSAPP_NUMBER` esta configurado.

## Capacidades vigentes

- Home publica de presentacion.
- Catalogo de productos y categorias.
- Detalle de producto con imagenes, descripcion, variantes, materiales, cuidados y tiempos.
- Disponibilidad o stock como referencia sujeta a consulta.
- Acciones publicas de contacto manual.
- Pagina de contacto.
- Metadata, sitemap, robots y estructura SEO basica.

## Fuera de alcance

No forman parte del producto publico actual:

- carrito
- checkout
- pagos online
- Mercado Pago
- creacion o actualizacion de pedidos online
- paginas publicas de resultado de pago
- webhooks como parte del flujo publico
- emails transaccionales de confirmacion de pedido

No presentar el sitio como e-commerce operativo, e-commerce en mantenimiento ni integracion de pagos pendiente.

## Contrato del catalogo

El catalogo debe poder ejecutarse, compilarse y desplegarse sin depender de Mercado Pago, Resend, service role para carrito/ordenes ni tokens de webhook.

La informacion de productos puede incluir precio, stock o disponibilidad observable cuando exista en el modelo actual, pero debe presentarse como referencia para consulta manual, no como promesa de venta online.

## Infraestructura historica

El repositorio conserva documentacion archivada y SQL historico relacionado con e-commerce. Esa infraestructura no define el alcance vigente, no debe usarse como runbook operativo y no debe reactivarse sin autorizacion explicita.

Una reactivacion comercial futura requiere decision explicita, auditoria especifica, validacion de servicios externos, actualizacion documental y pruebas completas.

## Pendiente de confirmar

- Configuracion efectiva de `NEXT_PUBLIC_WHATSAPP_NUMBER` en Vercel Preview y Production.
- URL final del sitio.
- Proyecto Vercel, dominio y variables reales por entorno.
- Estado real de Supabase remoto, datos, Storage e imagenes.
- Analytics activo y objetivo de medicion.
