# Technical Context

Fira Estudio usa Next.js App Router para una experiencia publica de catalogo. El codigo vigente debe sostener el sitio como vidriera digital, no como e-commerce transaccional.

## Stack vigente

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Vercel
- Google Analytics 4 opcional
- Vitest + `node:test`
- Playwright para e2e publico

Las dependencias instaladas se verifican en `package.json`.

## Estructura activa

- `app/`: rutas App Router, paginas publicas y API de soporte.
- `components/`: UI por dominio (`home`, `productos`, `contacto`, `layout`, `ui`).
- `lib/supabase/`: clientes y queries del catalogo.
- `lib/repositories/`: acceso a datos de dominio.
- `lib/cache/`: cache y revalidacion.
- `lib/seo/`: metadata, URLs y datos estructurados.
- `lib/analytics/`: eventos de medicion.
- `lib/content/`: textos centralizados por seccion.

## Datos y Supabase

El runtime publico vigente consume Supabase para lectura de catalogo:

- `categorias`
- `productos`
- `variaciones`
- `imagenes_producto`

`consultas` existe en SQL versionado, pero no tiene consumidor runtime actual. El estado real de Supabase remoto, datos, Storage, policies y funciones queda `pendiente de confirmar` desde el repositorio.

## Superficie publica

La UI vigente muestra catalogo y contacto manual. Las rutas historicas de `carrito` y `checkout` no forman parte del flujo publico; si existen como stubs, deben responder como rutas no disponibles y no deben aparecer enlazadas desde la UI.

La unica API publica esperada para soporte de catalogo es la revalidacion manual de cache. Cualquier API de checkout, Mercado Pago, webhooks, ordenes o cola pertenece a historia del proyecto y no debe reintroducirse sin auditoria especifica.

## Cache y revalidacion

Las queries publicas del catalogo usan cache para reducir carga y mejorar rendimiento. Las funciones que dependen de datos dinamicos de Next.js, como cookies, no deben ejecutarse dentro de funciones cacheadas con `unstable_cache`.

La revalidacion manual usa `REVALIDATE_SECRET` en production. No es necesaria para levantar el catalogo basico local, pero debe tratarse como secreto si se configura.

## SEO y analytics

El sitio mantiene metadata, sitemap, robots y datos estructurados compatibles con una vidriera digital. No debe emitir structured data que prometa venta online, checkout, oferta transaccional o disponibilidad garantizada.

GA4 es opcional. Los eventos vigentes deben representar navegacion, vistas de producto, seleccion de variantes y consultas manuales; no eventos de carrito o compra.

## Infraestructura historica

Mercado Pago, Resend, carrito, checkout, ordenes, webhooks y emails transaccionales fueron retirados del runtime principal. El SQL historico y la documentacion archivada pueden conservar contexto, pero no son fuente operativa vigente.
