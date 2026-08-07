# Alcance del producto

Este documento define el contrato vigente de producto para `fira-estudio`. Si cambia este contrato, este archivo debe actualizarse en el mismo patch documental que registre la decision.

## Proposito

Fira Estudio es una vidriera digital de productos textiles artesanales. El sitio debe presentar la marca, mostrar el catalogo y facilitar una consulta manual sobre disponibilidad.

El producto publico vigente no es un e-commerce y no debe comunicarse como tienda online, checkout en mantenimiento ni sistema de pagos pausado.

## Publico y caso de uso

El sitio esta orientado a personas que quieren conocer piezas textiles artesanales, explorar categorias, revisar detalles de producto y contactar al emprendimiento antes de una compra o encargo.

El caso de uso principal es:

1. descubrir la marca;
2. recorrer productos y categorias;
3. revisar imagenes, variantes, materiales y cuidados;
4. consultar disponibilidad por un canal manual.

## Capacidades vigentes

- Home publica de presentacion.
- Catalogo de productos y categorias.
- Detalle de producto con imagenes, descripcion, variantes, materiales, cuidados y tiempos.
- Informacion de disponibilidad como referencia sujeta a consulta.
- Acciones publicas de consulta manual desde el detalle de producto.
- Pagina de contacto.
- Metadata, sitemap y estructura SEO compatibles con una vidriera digital.

Actualizacion Fase 1A: la UI publica visible fue adaptada para no ofrecer carrito ni checkout desde header, navegacion o acciones de producto. Las rutas e infraestructura historica de comercio siguen existiendo internamente hasta una fase funcional posterior.

Actualizacion Fase 1B: las paginas publicas historicas de carrito, checkout, resultados de pago y diagnostico tecnico ya no forman parte del runtime publico vigente. La infraestructura interna de comercio permanece suspendida para auditoria posterior.

Actualizacion Fase 1C: las rutas API publicas historicas de checkout, Mercado Pago, webhooks, cola, status y reconciliacion fueron retiradas del runtime publico. Los modulos internos asociados permanecen como infraestructura historica suspendida.

Actualizacion Fase 2A: los componentes historicos de carrito, el indicador de carrito, las server actions comerciales de carrito y el contenido textual especifico de carrito/checkout fueron retirados del arbol ejecutable. Permanecen suspendidos `CartRepository`, Mercado Pago, webhooks, emails transaccionales, service role, SQL historico y dependencias para saneamiento posterior.

Actualizacion Fase 2B: la flag publica historica de checkout y la configuracion ejecutable de URLs comerciales fueron retiradas del runtime. `CartRepository` se conserva temporalmente porque todavia sostiene webhooks y emails historicos que se sanearan como bloque separado.

## Fuera de alcance vigente

Estas capacidades no forman parte del producto publico actual:

- agregar productos al carrito;
- iniciar checkout;
- crear pedidos u ordenes online;
- pagar mediante Mercado Pago u otro proveedor;
- acceder a paginas publicas de resultado de pago;
- usar webhooks como parte del flujo publico;
- enviar emails transaccionales de confirmacion de pedido;
- tratar el sitio como e-commerce en mantenimiento.

## Contrato del catalogo

El catalogo debe poder ejecutarse, compilarse y desplegarse sin depender de Mercado Pago, Resend, service role para carrito/ordenes ni tokens de webhooks.

La informacion de productos puede incluir precio, stock o disponibilidad observable cuando exista en el modelo actual, pero debe presentarse como referencia para consulta manual, no como promesa de venta online.

## Contacto manual

El contacto manual es la accion principal posterior a la exploracion del catalogo. El canal definitivo sigue `pendiente de confirmar` entre WhatsApp, email o formulario.

Hasta cerrar esa decision, la documentacion no debe prometer un canal operativo especifico fuera de lo que el codigo y las variables reales permitan verificar.

## Infraestructura historica

El repositorio conserva infraestructura historica de e-commerce: repositorio de carrito/ordenes, Mercado Pago, webhooks, emails transaccionales, SQL y dependencias asociadas.

Esa infraestructura puede mantenerse temporalmente para referencia tecnica, pero debe quedar fuera de las superficies publicas y no debe ser necesaria para el despliegue del catalogo.

No debe reactivarse comercio mediante una modificacion accidental de variables. Desde Fase 2A ya no quedan componentes ni server actions de carrito en el arbol ejecutable del catalogo, y desde Fase 2B ya no queda flag publica de checkout ni configuracion ejecutable de URLs comerciales.

## Reactivacion comercial futura

Una eventual vuelta al comercio online requiere:

- decision explicita del usuario o responsable del proyecto;
- auditoria especifica de carrito, checkout, pagos, ordenes, webhooks, emails, seguridad y datos;
- validacion de credenciales y servicios externos;
- actualizacion de este contrato y de la documentacion operativa;
- pruebas completas antes de cualquier deploy publico.

## Objetivos tecnicos como portfolio

El proyecto debe demostrar buenas practicas en:

- diseno responsive;
- accesibilidad;
- rendimiento;
- SEO;
- arquitectura mantenible;
- uso responsable de Supabase;
- compatibilidad con Vercel;
- documentacion honesta y verificable.

## Decisiones pendientes

- Canal principal de consulta manual.
- URL final del sitio.
- Proyecto Vercel, dominio y variables reales por entorno.
- Estado real de Supabase remoto, datos, Storage e imagenes.
- Analytics activo y objetivo de medicion.
- Estrategia para retirar o archivar `CartRepository`, Mercado Pago, webhooks, emails, SQL historico y dependencias comerciales.
