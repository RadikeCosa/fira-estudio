# Fira Estudio

Fira Estudio es una vidriera digital de productos textiles artesanales. Permite explorar productos, categorias, variantes, materiales e imagenes y contactar al emprendimiento para consultar disponibilidad.

El contrato vigente del producto esta en [docs/PRODUCT_SCOPE.md](./docs/PRODUCT_SCOPE.md).

## Estado actual

El producto publico vigente es un catalogo o vidriera digital. No ofrece carrito, checkout, pagos ni creacion de pedidos online.

La infraestructura historica de e-commerce fue retirada del arbol ejecutable principal. El historial Git conserva esa implementacion anterior; no debe tratarse como parte del producto vigente ni como requisito para desplegar el catalogo.

Estado local confirmado en la auditoria actual:

- `npm run lint` pasa;
- `npm run test` pasa;
- `npm run build` pasa;
- `git diff --check` pasa.

Estos resultados no confirman por si solos el estado de Supabase remoto, Vercel, dominio, analytics ni variables reales.

## Capacidades publicas vigentes

- Home publica de presentacion.
- Catalogo de productos y categorias.
- Detalle de producto con imagenes, descripcion, variantes, materiales, cuidados y tiempos.
- Disponibilidad o stock como referencia sujeta a consulta.
- Pagina de contacto.
- Metadata, sitemap, robots y estructura SEO basica.
- Diseno responsive con App Router.

## Fuera de alcance

No son funcionalidades publicas vigentes:

- carrito;
- checkout;
- pagos;
- creacion o actualizacion de pedidos online;
- paginas publicas de resultado de pago;
- webhooks como parte del flujo publico;
- emails transaccionales de confirmacion de pedido.

No presentar el sitio como e-commerce en mantenimiento ni como integracion de Mercado Pago pendiente.

## Objetivos tecnicos

El proyecto busca funcionar tambien como portfolio tecnico:

- diseno responsive;
- accesibilidad;
- rendimiento;
- SEO;
- arquitectura mantenible;
- uso responsable de Supabase;
- compatibilidad con Vercel;
- documentacion verificable y sin promesas externas.

## Stack vigente del catalogo

Dependencias principales instaladas:

- Next.js 16 + React 19;
- TypeScript;
- Tailwind CSS 4;
- Supabase;
- Vercel Speed Insights;
- Google Analytics 4 opcional;
- Vitest + `node:test`.

Para ejecutar el catalogo no son necesarias integraciones historicas como Mercado Pago, Resend, service role para carrito/ordenes ni tokens de webhook.

## Arquitectura breve

- `app/`: rutas App Router, paginas publicas y endpoints API existentes.
- `components/`: UI por dominio (`productos`, `contacto`, `layout` y `ui`).
- `lib/supabase/`: clientes y queries del catalogo.
- `lib/repositories/`: acceso a datos y operaciones de dominio.
- `lib/seo/`: metadata y datos estructurados.
- `lib/analytics/`: eventos de medicion.
- `docs/`: documentacion activa, auditorias y material historico.

## Setup local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abrir `http://localhost:3000`.

## Variables necesarias y opcionales

Usar [.env.local.example](./.env.local.example) como referencia. No commitear valores reales.

### Requeridas para catalogo

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

### Opcionales para contacto

```bash
NEXT_PUBLIC_CONTACT_EMAIL=contacto@example.com
NEXT_PUBLIC_WHATSAPP_NUMBER=549XXXXXXXXXX
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/firaestudio
```

El canal principal de consulta manual sigue `pendiente de confirmar`.

### Opcionales para analytics y mantenimiento

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Mensaje opcional
```

## Scripts

Scripts existentes en `package.json`:

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

## Calidad y validaciones

Validaciones recomendadas antes de cerrar cambios:

```bash
git diff --check
npm run lint
npm run test
npm run build
```

Si un cambio futuro reintroduce checkout, webhooks, carrito, ordenes o emails, requiere validacion especifica adicional y aprobacion explicita.

## Estado de despliegue

- `local`: desarrollo con `.env.local`.
- `preview`: despliegues de validacion en Vercel, `pendiente de confirmar`.
- `production`: futuro despliegue publico, `pendiente de confirmar`.

Queda `pendiente de confirmar` fuera del repo:

- proyecto Vercel real;
- dominio publico;
- URL final;
- variables efectivamente cargadas;
- Supabase remoto, datos, Storage e imagenes;
- analytics activo;
- canal oficial de consulta manual.

## Infraestructura historica retirada

El codigo ejecutable de carrito, checkout, Mercado Pago, ordenes, webhooks, reconciliacion y emails transaccionales fue retirado del arbol principal durante el saneamiento historico.

No es necesario para ejecutar, compilar o desplegar el catalogo. Una eventual reactivacion comercial requerira una nueva decision explicita, auditoria especifica y actualizacion documental.

## Documentacion

- [docs/PRODUCT_SCOPE.md](./docs/PRODUCT_SCOPE.md): contrato canonico de producto.
- [AGENTS.md](./AGENTS.md): guia canonica para agentes de codigo.
- [docs/README.md](./docs/README.md): mapa de documentacion activa e historica.
- [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md): criterios de entornos y variables.
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): checklist y consideraciones de deploy.
- [docs/VERCEL_SETUP.md](./docs/VERCEL_SETUP.md): carga segura de variables en Vercel.
- [docs/MAINTENANCE_MODE.md](./docs/MAINTENANCE_MODE.md): alcance real del maintenance mode.
- [docs/audits/auditoria-reinicio-catalogo-fira-estudio-2026-06-25.md](./docs/audits/auditoria-reinicio-catalogo-fira-estudio-2026-06-25.md): auditoria base del reinicio.
