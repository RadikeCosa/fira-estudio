# Guia de entornos

Esta guia define los entornos del proyecto para la etapa de catalogo publico, sin asumir estados operativos que no pueden verificarse desde el repositorio.

El contrato de producto vigente esta en [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md).

## Resumen

| Entorno | Uso esperado | Fuente de variables | Estado verificable desde repo |
| --- | --- | --- | --- |
| `local` | desarrollo | `.env.local` | parcialmente |
| `preview` | validacion de ramas antes de integrar a `main` | Vercel | no |
| `production` | despliegue publico proveniente de `main` estable | Vercel | no |

El flujo de ramas y promocion adoptado por el repositorio esta en [`DEVELOPMENT_WORKFLOW.md`](./DEVELOPMENT_WORKFLOW.md). La configuracion externa efectiva de GitHub y Vercel queda `pendiente de confirmar` hasta verificarse fuera del repo.

## Local

Se usa para desarrollo en `http://localhost:3000`.

Setup minimo:

```bash
cp .env.local.example .env.local
npm run dev
```

Comandos verificables desde `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

El catalogo local requiere variables publicas de Supabase para renderizar productos reales. Sin datos o variables reales, el build puede pasar, pero el catalogo no prueba contenido remoto.

## Preview

Preview se usara para validar ramas de trabajo antes de integrarlas a `main`, especialmente para smoke tests, revision visual, responsive, accesibilidad, comportamiento real de navegador y variables/configuracion propias del entorno cuando corresponda.

La politica adoptada es rama de trabajo -> validacion local -> Preview cuando aporte valor -> integracion en `main`. Queda `pendiente de confirmar`:

- proyecto Vercel;
- generacion automatica de Preview por rama;
- URL de preview;
- autenticacion o proteccion del preview;
- variables efectivamente cargadas;
- estado real de Supabase usado por preview;
- analytics activo o inactivo.

## Production

Production sera el despliegue publico del catalogo y debe provenir de `main` estable, con codigo ya integrado y validado segun el alcance del cambio.

Queda `pendiente de confirmar`:

- URL final;
- dominio;
- proyecto Vercel;
- despliegue automatico o manual desde `main`;
- variables efectivamente cargadas;
- configuracion real de Supabase;
- datos, Storage e imagenes;
- analytics activo;
- canal oficial de contacto manual.

Mercado Pago, Resend, service role comercial y tokens de webhook ya no forman parte del arbol ejecutable principal ni son requisitos de production para el alcance vigente.

## Variables requeridas para catalogo

Estas variables son necesarias para desplegar el catalogo con datos reales:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`NEXT_PUBLIC_SITE_URL` debe apuntar a la URL publica esperada del entorno para metadata, sitemap y enlaces absolutos.

## Variables opcionales

Contacto:

- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_INSTAGRAM_URL`

WhatsApp es el canal principal de consulta manual. `NEXT_PUBLIC_WHATSAPP_NUMBER` debe cargarse en Vercel Preview y Production con codigo de pais + numero, solo digitos, sin `+`, espacios ni guiones. La configuracion efectiva queda `pendiente de realizar manualmente`.

Analytics:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

Mantenimiento del catalogo:

- `NEXT_PUBLIC_MAINTENANCE_MODE`
- `NEXT_PUBLIC_MAINTENANCE_MESSAGE`

## Variables historicas retiradas del setup activo

No son requeridas para deploy del catalogo vigente y no deben cargarse por defecto:

- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_INTEGRATOR_ID`
- `MERCADOPAGO_WEBHOOK_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `WEBHOOK_RECONCILIATION_TOKEN`
- `WEBHOOK_QUEUE_PROCESSOR_TOKEN`
- `WEBHOOK_STATUS_TOKEN`
- `CRON_SECRET`
- `REVALIDATE_SECRET`
- `WEBHOOK_SKIP_IP_VALIDATION`
- `WEBHOOK_SKIP_SIGNATURE_VALIDATION`

El SQL historico y la documentacion archivada pueden seguir mencionando estas variables como parte de la implementacion anterior. Eso no las convierte en requisitos vigentes.

Conservarlas en ejemplos solo porque el codigo historico todavia las referencia. No cargarlas por defecto en Vercel para el catalogo.

## Secretos

- No commitear `.env.local` ni otros `.env` reales.
- No documentar credenciales con valores concretos.
- Si una credencial fue versionada historicamente, marcarla como `requiere rotacion manual`.
- Mantener separadas variables publicas `NEXT_PUBLIC_*` de secretos server-side.

## Reglas de documentacion

- Si una doc vieja afirma estados de Preview o Production como hechos, actualizarla o marcarla `pendiente de confirmar`.
- Si una variable existe en el codigo pero no en los templates o docs, registrar el gap antes de tocar comportamiento.
- No asumir checkout activo en ningun entorno como parte del objetivo actual.
