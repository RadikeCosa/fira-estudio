# Estrategia de testing

Esta estrategia corresponde al alcance vigente de catalogo publico. No cubre checkout, carrito, pagos, ordenes, webhooks ni emails transaccionales porque esa infraestructura fue retirada del arbol ejecutable principal.

El contrato de producto vigente esta en [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md).

## Objetivos

- confirmar que la experiencia publica funciona como catalogo;
- evitar regresiones que reintroduzcan superficies comerciales;
- sostener SEO, navegacion, contacto y datos estructurados;
- validar que el runtime publico no dependa de infraestructura historica.

## Comandos base

Usar los scripts reales de `package.json`:

```bash
npm run lint
npm run test
npm run build
```

Para validaciones de navegador real del catalogo publico:

```bash
npm run test:e2e
```

Para cambios documentales o de saneamiento, sumar:

```bash
git diff --check
```

## Cobertura vigente

La suite debe priorizar:

- navegacion publica, header, footer y enlaces internos;
- home, listado de productos, detalle de producto y contacto;
- acciones de consulta manual y fallback cuando no exista WhatsApp;
- metadata, sitemap, robots y structured data de catalogo;
- ausencia publica de carrito, checkout y compra online;
- endpoints publicos vigentes (`/api/rate-limit` y `/api/revalidate`);
- queries de Supabase usadas por catalogo, con datos remotos reales `pendiente de confirmar`;
- estados de error, empty states y compatibilidad con build de Next.js;
- accesibilidad basica en componentes visibles.
- recorridos e2e de alto valor en navegador real: home, productos, navegacion mobile, contacto y overflow responsive.

## E2E con Playwright

Playwright cubre integracion publica y comportamiento que depende de navegador real:

- carga de home, listado y contacto;
- navegacion publica y menu mobile con foco;
- overflow horizontal en viewports representativos;
- formulario de contacto con errores accesibles y contexto desde query params;
- detalle de producto cuando hay datos reales disponibles.

No reemplaza Vitest ni Testing Library. No cubre checkout, pagos, ordenes, webhooks ni datos remotos de Supabase como estado confirmado.

## Regresiones a bloquear

- enlaces publicos a `/carrito` o `/checkout`;
- render de botones de compra o indicadores de carrito;
- structured data `Product` con `Offer`, precio comercial, moneda o disponibilidad de venta;
- dependencias obligatorias de Mercado Pago, Resend, service role comercial o tokens de webhook;
- documentacion activa que presente el sitio como e-commerce operativo.

## Material historico

La estrategia anterior de checkout quedo archivada en [`archive/ecommerce/testing/CHECKOUT_TESTING_STRATEGY.md`](./archive/ecommerce/testing/CHECKOUT_TESTING_STRATEGY.md).

Ese documento puede ser referencia si se audita una futura reactivacion comercial, pero no es fuente operativa para el catalogo vigente.
