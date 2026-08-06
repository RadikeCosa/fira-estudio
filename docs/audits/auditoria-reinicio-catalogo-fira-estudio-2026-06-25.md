# Auditoria base - Reinicio catalogo Fira Estudio

Fecha: `2026-06-25`

Actualizacion Fase 0: `2026-08-06`

Actualizacion Fase 1A: `2026-08-06`

Actualizacion Fase 1B: `2026-08-06`

Contrato canonico vigente: [`../PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md)

La actualizacion de Fase 0 registra saneamiento documental. La actualizacion de Fase 1A adapta la UI publica visible para consulta manual. La actualizacion de Fase 1B bloquea las paginas publicas historicas de carrito, checkout, resultados de pago y diagnostico tecnico. No modifica endpoints, Mercado Pago, webhooks, ordenes ni emails.

## Resumen Ejecutivo

Fira Estudio conserva una base tecnica historica de e-commerce, pero el objetivo vigente ya no es vender online sino relanzar el proyecto como catalogo/vidriera publica de marca textil artesanal.

El repositorio todavia conserva superficies de carrito, checkout, pagos y webhooks. El flag `NEXT_PUBLIC_CHECKOUT_ENABLED=false` no alcanza por si solo para un relanzamiento seguro como catalogo, porque solo bloquea una parte del flujo y no elimina toda la superficie asociada a compra.

La opcion recomendada para esta etapa es:

- mantener carrito y checkout fuera del flujo publico;
- conservar el codigo sensible de pagos, webhooks, ordenes y emails como funcionalidad suspendida;
- reordenar la documentacion para que el proyecto no se presente como e-commerce activo;
- mantener validaciones tecnicas limpias antes de cualquier redeploy.

Estado general al cierre de esta auditoria:

- documentacion y framing del repo: saneados parcialmente en Fase 0;
- catalogo y datos: siguen dependiendo de Supabase;
- checkout/pagos: siguen presentes en codigo, pero sus paginas publicas historicas responden como inexistentes desde Fase 1B;
- deploy: pendiente de validar contra servicios externos;
- validacion tecnica local al 2026-08-06: `git diff --check`, `npm run lint`, `npm run test` y `npm run build` pasan.

## Estado Confirmado Desde Codigo

### Stack real

Confirmado desde `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs` y `vitest.config.ts`:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Mercado Pago
- Resend + React Email
- Vercel Speed Insights
- Google Analytics 4
- Vitest + `node:test`

### Rutas publicas actuales

Superficie publica vigente confirmada en `app/`:

- `/`
- `/productos`
- `/productos/[slug]`
- `/sobre-nosotros`
- `/contacto`

Rutas historicas presentes en el arbol pero bloqueadas con `notFound()` desde Fase 1B:

- `/carrito`
- `/checkout`
- `/checkout/success`
- `/checkout/pending`
- `/checkout/failure`
- `/test-errors` en produccion

### APIs y superficies sensibles

Superficie sensible confirmada:

- `app/api/cart/actions.ts`
- `app/api/checkout/create-preference/route.ts`
- `app/api/checkout/webhook/route.ts`
- `app/api/webhooks/process-queue/route.ts`
- `app/api/webhooks/reconcile/route.ts`
- `app/api/webhooks/status/route.ts`
- `app/api/revalidate/route.ts`
- `app/api/rate-limit/route.ts`

### Dependencias funcionales por area

Catalogo publico:

- depende de Supabase para categorias, productos, variaciones e imagenes;
- usa `lib/supabase/queries.ts` y `lib/repositories/producto.repository.ts`;
- usa metadata, sitemap y JSON-LD basados en productos.

Carrito y checkout:

- usan server actions y `CartRepository`;
- dependen de `SUPABASE_SERVICE_ROLE_KEY`;
- exponen rutas publicas y API de preferencia de pago.

Mercado Pago y webhooks:

- siguen integrados;
- usan URLs de retorno y webhook desde `lib/config/urls.ts`;
- tienen cola de procesamiento, reconciliacion y endpoints operativos.

Emails transaccionales:

- siguen presentes con Resend y React Email;
- se disparan desde el procesamiento de webhooks.

Analytics:

- Google Analytics se inyecta desde `app/layout.tsx`;
- hay tracking activo para vista de producto, filtro por categoria y click en WhatsApp;
- existen eventos de e-commerce en constantes aunque no todos aparecen usados en runtime.

### Imagenes

El codigo espera encontrar imagenes en alguno de estos formatos:

- URL absoluta;
- path root-relative;
- path relativo en `public/images/productos`;
- pseudo-ruta `supabase://...` transformada a URL publica de Supabase Storage.

Esto surge de `lib/utils/image.ts` y `next.config.ts`.

## Estado Pendiente de Confirmar Fuera del Repo

Los siguientes puntos no pueden confirmarse solo leyendo el repositorio y deben tratarse como `pendiente de confirmar`:

- si el proyecto Supabase remoto ya fue reactivado correctamente;
- si siguen existiendo productos cargados en la base remota;
- si existen buckets activos y accesibles para imagenes;
- si las imagenes actuales viven en el repo, en Supabase Storage o en otro origen;
- si existe proyecto Vercel vigente o si habra que crearlo desde cero;
- si existe dominio propio definido para el relanzamiento;
- si hay analytics activos o configuraciones reales vigentes;
- si hubo credenciales historicas que requieren rotacion manual;
- cual sera el canal oficial de consulta manual en esta etapa.

## Desalineaciones Entre Documentacion y Objetivo Actual

Actualizacion Fase 0:

- `docs/PRODUCT_SCOPE.md` queda como contrato canonico;
- `README.md`, `AGENTS.md`, `docs/README.md`, `docs/ENVIRONMENTS.md`, `docs/VERCEL_SETUP.md`, `docs/MAINTENANCE_MODE.md` y `.env.local.example` fueron reorientados al catalogo;
- Fase 1A removio carrito/checkout de header, navegacion y acciones publicas de producto;
- Fase 1A removio datos estructurados comerciales de oferta comprable;
- Fase 1B bloqueo las paginas publicas historicas de carrito, checkout y resultados de pago con `notFound()`;
- Fase 1B dejo `/test-errors` fuera de produccion mediante `notFound()`;
- no se resolvieron en estas fases los endpoints, pagos, webhooks, ordenes o emails.

Hallazgos principales:

- parte de la documentacion historica y archivada sigue tratando pagos, webhooks y emails como superficie operativa;
- `docs/WEBHOOK_SECURITY.md`, `docs/ORDER_CONFIRMATION_EMAIL.md` y material archivado deben considerarse infraestructura historica suspendida;
- maintenance mode ya no debe tratarse como catalog mode;
- la documentacion activa debe enlazar a `PRODUCT_SCOPE.md` para evitar duplicar el contrato.

## Inventario de Rutas Publicas y APIs Sensibles

### Rutas publicas vigentes

- `/`
- `/productos`
- `/productos/[slug]`
- `/sobre-nosotros`
- `/contacto`

### Rutas historicas bloqueadas

- `/carrito`
- `/checkout`
- `/checkout/success`
- `/checkout/pending`
- `/checkout/failure`
- `/test-errors` en produccion

### APIs sensibles

- `/api/checkout/create-preference`
- `/api/checkout/webhook`
- `/api/webhooks/process-queue`
- `/api/webhooks/reconcile`
- `/api/webhooks/status`
- `/api/revalidate`
- `/api/rate-limit`

### Observacion

Para el objetivo catalogo, Fase 1A removio enlaces y CTAs comerciales de la experiencia publica principal. Fase 1B bloqueo las paginas historicas de `/carrito`, `/checkout` y resultados de pago con `notFound()`. Los endpoints sensibles siguen existiendo y deben aislarse en un patch funcional posterior.

## Inventario de Variables de Entorno

Variables detectadas en codigo ejecutable:

### Minimas para catalogo

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Opcionales para contacto y catalogo

- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_INSTAGRAM_URL`

### Opcionales para analytics

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Flags de mantenimiento o control parcial

- `NEXT_PUBLIC_MAINTENANCE_MODE`
- `NEXT_PUBLIC_MAINTENANCE_MESSAGE`
- `NEXT_PUBLIC_MAINTENANCE_END_DATE`
- `NEXT_PUBLIC_CHECKOUT_ENABLED`

### Variables de e-commerce suspendido

- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_INTEGRATOR_ID`
- `MERCADOPAGO_WEBHOOK_URL`
- `NEXT_PUBLIC_CHECKOUT_SUCCESS_URL`
- `NEXT_PUBLIC_CHECKOUT_FAILURE_URL`
- `NEXT_PUBLIC_CHECKOUT_PENDING_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Variables operativas sensibles suspendidas

- `WEBHOOK_RECONCILIATION_TOKEN`
- `WEBHOOK_QUEUE_PROCESSOR_TOKEN`
- `WEBHOOK_STATUS_TOKEN`
- `CRON_SECRET`
- `REVALIDATE_SECRET`
- `WEBHOOK_SKIP_IP_VALIDATION`
- `WEBHOOK_SKIP_SIGNATURE_VALIDATION`

### Variables de plataforma

- `VERCEL_URL`
- `NODE_ENV`

## Diagnostico de Supabase / Productos / Imagenes

### Estado confirmado

El catalogo depende de Supabase para funcionar.

Modelo confirmado por codigo y SQL de referencia:

- `categorias`
- `productos`
- `variaciones`
- `imagenes_producto`

El modelo actual soporta de forma directa:

- precio;
- stock;
- activo;
- destacado;
- tiempo de fabricacion;
- material;
- cuidados;
- variaciones;
- imagenes.

### Limitaciones actuales del modelo para la etapa catalogo

No vi modelado explicito de primer nivel para:

- `vendido`;
- `pieza unica`;
- `consultar disponibilidad`;
- `por encargo`.

Hoy parte de esa semantica se infiere desde UI y stock:

- `stock === 0` se muestra como `A pedido`;
- `stock === -1` se muestra como `Agotado`.

### Imagenes

El codigo soporta rutas relativas y varios formatos de resolucion de imagen.

Sigue `pendiente de confirmar`:

- si la base remota guarda rutas relativas consistentes;
- si las imagenes efectivamente estan versionadas en el repo;
- si existe dependencia real de Supabase Storage en produccion;
- si hay que migrar o normalizar imagenes para el relanzamiento.

## Diagnostico de Checkout / Carrito / Mercado Pago / Webhooks / Emails

### Estado confirmado

El codigo sensible de e-commerce sigue presente y funcionalmente conectado:

- carrito persistente por `session_id`;
- checkout con creacion de orden;
- creacion de preferencia de Mercado Pago;
- paginas `success`, `failure` y `pending`;
- webhook con validaciones de firma e IP;
- cola de webhooks, retries y reconciliacion;
- email transaccional de confirmacion.

### Riesgo para el relanzamiento como catalogo

El flag `NEXT_PUBLIC_CHECKOUT_ENABLED=false` no alcanza para relanzamiento seguro como catalogo porque:

- no elimina `/carrito`;
- no elimina `/checkout`;
- no elimina las paginas de resultado;
- no recorta todas las APIs sensibles del recorrido publico.

Actualizacion Fase 1A:

- el header publico ya no muestra icono de carrito;
- las acciones publicas de producto ya no renderizan `Agregar al carrito`;
- el CTA principal de producto pasa a consulta manual;
- el schema de producto ya no incluye oferta comercial.

Actualizacion Fase 1B:

- `/carrito` responde como pagina inexistente;
- `/checkout` responde como pagina inexistente;
- `/checkout/success`, `/checkout/failure` y `/checkout/pending` responden como paginas inexistentes;
- `/test-errors` no esta disponible en produccion;
- sitemap y robots no presentan estas rutas como contenido publico.

### Recomendacion

Para esta etapa:

- no reactivar nada de pagos;
- no borrar todavia el codigo sensible;
- revisar endpoints comerciales y URLs de retorno en una fase posterior;
- documentar esa capa como funcionalidad suspendida.

## Diagnostico de Vercel / Redeploy

### Estado confirmado

El arbol local actual queda tecnicamente validado para continuar auditoria y preparar un futuro deploy de catalogo.

Validacion local observada el 2026-08-06:

- `git diff --check`: pasa;
- `npm run lint`: pasa;
- `npm run test`: pasa;
- `npm run build`: pasa.

### Implicancia

Esto no confirma el estado del entorno remoto. No se recomienda promover production hasta confirmar Supabase, imagenes, variables, dominio, contacto y recorte funcional de superficies comerciales.

### Pendientes externos

Queda `pendiente de confirmar`:

- proyecto Vercel real;
- configuracion de entornos;
- dominio;
- variables cargadas;
- logs de runtime;
- comportamiento real de preview y production.

## Diagnostico de Analytics

### Estado confirmado

Integraciones visibles:

- Google Analytics 4;
- Vercel Speed Insights.

Eventos con uso confirmado en runtime:

- vista de producto;
- filtro por categoria;
- click en WhatsApp.

Eventos de e-commerce presentes en constantes, pero no tratados aqui como parte del objetivo actual:

- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `begin_checkout`

### Recomendacion para esta etapa

Medir en una fase posterior solo eventos compatibles con catalogo:

- visita a home;
- vista de producto;
- navegacion por categoria;
- click en WhatsApp;
- click en Instagram;
- click en email;
- consulta por producto.

Estado real de GA4 y configuracion externa: `pendiente de confirmar`.

## Riesgos

- presentar el proyecto como e-commerce activo cuando el objetivo actual no lo es;
- relanzar solo con flags y dejar expuesta superficie de compra;
- asumir que Supabase, Storage, Vercel o analytics estan activos sin verificar;
- tocar pagos/webhooks/emails sin aprobacion especifica;
- redeployar production antes de confirmar servicios externos y recortar superficies comerciales publicas.

## Decisiones Pendientes

- canal oficial de consulta manual;
- si el catalogo seguira totalmente dependiente de Supabase en vivo;
- como modelar disponibilidad artesanal, pieza unica, por encargo o vendido;
- estrategia de imagenes definitiva;
- momento y forma de recortar carrito/checkout del flujo publico;
- si la funcionalidad suspendida quedara archivada o solo desactivada.

## Plan de Accion por Fases

### Fase 0 - Documentacion y verdad operativa

- estado: implementada documentalmente el 2026-08-06;
- `docs/PRODUCT_SCOPE.md` creado como contrato canonico;
- `README.md`, `AGENTS.md`, docs de entornos, Vercel, maintenance y `.env.local.example` reorientados al objetivo catalogo;
- no incluye cambios funcionales.

### Fase 1 - Aislamiento funcional de comercio

- estado parcial Fase 1A: header, navegacion, acciones de producto, analytics y schema comercial adaptados a consulta manual;
- estado parcial Fase 1B: paginas publicas historicas de carrito, checkout, resultados de pago y diagnostico tecnico bloqueadas;
- bloquear o retirar endpoints comerciales del runtime publico;
- preservar pagos y webhooks como infraestructura historica no operativa.

### Fase 2 - Experiencia de catalogo y contacto

- validar Supabase remoto;
- validar datos y rutas de imagenes;
- validar proyecto Vercel, dominio y analytics;
- definir canal de contacto.

### Fase 3 - Accesibilidad y diseno

- revisar navegacion, foco, formularios, controles de variantes e imagenes;
- alinear textos a consulta manual.

### Fase 4 - SEO y rendimiento

- quitar schema de oferta/compra cuando no corresponda;
- validar metadata, sitemap, robots e imagenes sociales;
- medir Core Web Vitals en preview.

### Fase 5 - Vercel Preview y validacion real

- ejecutar smoke tests de catalogo;
- confirmar variables y logs.

### Fase 6 - Production

- promover solo con servicios externos confirmados y superficie comercial aislada.

## Comandos Reales de Validacion y Estado Actual

Comandos tomados exclusivamente de `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:node
npm run test:unit
npm run test:watch
npm run test:coverage
```

Estado observado durante esta auditoria:

- `git diff --check`: pasa al 2026-08-06.
- `npm run lint`: pasa al 2026-08-06.
- `npm run test`: pasa al 2026-08-06.
- `npm run build`: pasa al 2026-08-06.

Detalle resumido:

- `npm run test:node` no encuentra archivos `*.node.test.ts` y continua sin ejecutar pruebas de `node:test`.
- `npm run test:unit` ejecuta Vitest y pasa.
- `npm run build` compila con warnings de `baseline-browser-mapping` desactualizado, no bloqueantes.

## Cierre

Esta auditoria confirma que el proyecto puede reencuadrarse como catalogo/vidriera digital. Fase 0 dejo el contrato documentado, pero antes del relanzamiento publico hace falta:

- recortar la superficie publica de compra;
- confirmar infraestructura externa;
- mantener validaciones tecnicas limpias;
- mantener Mercado Pago y piezas sensibles como infraestructura historica no operativa hasta nueva autorizacion explicita.
