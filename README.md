# Fira Estudio

Fira Estudio es un e-commerce construido con Next.js App Router para publicar un catalogo de textiles artesanales, permitir agregar productos al carrito y completar un checkout integrado con Mercado Pago.

El objetivo de este repositorio es documentar el proyecto con precision tecnica, sin inflar capacidades que el codigo no respalda.

## Funcionalidades actuales

- Catalogo de productos y categorias con datos desde Supabase.
- Pagina de detalle con imagenes, variaciones y productos relacionados.
- Carrito persistente asociado a `session_id`.
- Checkout con creacion de orden y preferencia de Mercado Pago.
- Paginas de resultado de checkout: `success`, `failure` y `pending`.
- Webhook de Mercado Pago con validaciones de seguridad y cola de procesamiento.
- Email de confirmacion de pedido con Resend.
- Eventos de Google Analytics 4 para interacciones de ecommerce.
- Tests de logica y componentes con `node:test` y Vitest.

## Stack real

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Mercado Pago
- Resend + React Email
- Vercel
- Google Analytics 4
- Vitest

## Arquitectura breve

- `app/`: rutas App Router, paginas publicas y endpoints API.
- `components/`: UI por dominio (`productos`, `carrito`, `layout`, `ui`).
- `lib/supabase/`: clientes y queries.
- `lib/repositories/`: acceso a datos y operaciones de dominio.
- `lib/mercadopago/`: cliente y utilidades de seguridad para webhooks.
- `lib/webhooks/`: cola, retries y reconciliacion.
- `lib/emails/`: template y envio de emails de confirmacion.
- `docs/`: documentacion operativa y tecnica complementaria.

## Setup local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

Usar [.env.local.example](./.env.local.example) como referencia. No commitear valores reales.

Variables principales:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-mercadopago-webhook-secret
MERCADOPAGO_INTEGRATOR_ID=your-mercadopago-integrator-id

RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL="Fira Estudio <noreply@example.com>"

NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_NUMBER=549XXXXXXXXXX
NEXT_PUBLIC_CONTACT_EMAIL=contacto@example.com
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/firaestudio

NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Mensaje opcional"
```

Adicionalmente, el codigo usa tokens operativos para webhooks y reconciliacion. Esos valores deben configurarse como secretos y no deben documentarse con valores reales.

## Scripts

Solo los scripts existentes en `package.json`:

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

## Testing y calidad

- `npm run lint`: validacion de ESLint.
- `npm run test`: ejecuta pruebas de logica y pruebas unitarias.
- `npm run build`: verificacion de build de produccion.

Si se toca checkout, carrito, webhooks o emails, conviene ejecutar como minimo `lint`, `test` y `build`.

## Entornos

- `local`: desarrollo con `.env.local`.
- `preview`: despliegues de Vercel Preview.
- `production`: despliegue principal esperado en Vercel.

El estado operativo concreto de preview y production, incluyendo URLs activas, auth, maintenance mode o credenciales vigentes, queda pendiente de confirmar fuera del repo.

## Estado actual y limitaciones

- La base funcional de carrito, checkout, webhook y emails existe en el codigo.
- Parte de la documentacion historica del repo todavia esta en proceso de saneamiento.
- Hay flujos sensibles de pagos y webhooks que requieren especial cuidado antes de cambiar comportamiento.
- Existen decisiones operativas que no pueden confirmarse solo leyendo el repositorio y deben tratarse como `pendiente de confirmar`.

## Documentacion relacionada

- [AGENTS.md](./AGENTS.md): guia canonica para agentes de codigo.
- [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md): criterios de entornos y manejo de secretos.
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): proceso de deploy y rollback.
- [docs/VERCEL_SETUP.md](./docs/VERCEL_SETUP.md): configuracion segura de variables en Vercel.
- [docs/ORDER_CONFIRMATION_EMAIL.md](./docs/ORDER_CONFIRMATION_EMAIL.md): email de confirmacion.
- [docs/WEBHOOK_SECURITY.md](./docs/WEBHOOK_SECURITY.md): seguridad del webhook de Mercado Pago.
- [docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md): estrategia de pruebas en flujos criticos.
