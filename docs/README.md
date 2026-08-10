# Documentacion del proyecto

Este directorio concentra la documentacion tecnica y operativa de `fira-estudio`.

La etapa vigente del proyecto es una vidriera digital o catalogo publico. La documentacion activa debe reflejar ese contrato y tratar la capa de e-commerce como infraestructura historica suspendida.

## Nucleo activo

Estos documentos son la entrada principal para entender y operar el proyecto vigente:

- [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md): contrato canonico del producto.
- [`../README.md`](../README.md): entrada tecnica y de portfolio.
- [`../AGENTS.md`](../AGENTS.md): guia canonica para asistentes y agentes.
- [`DEVELOPMENT_WORKFLOW.md`](./DEVELOPMENT_WORKFLOW.md): flujo liviano de ramas, validaciones, Preview, PR y Production.
- [`ENVIRONMENTS.md`](./ENVIRONMENTS.md): criterios de entornos, variables y estados `pendiente de confirmar`.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): checklist de deploy y validaciones.
- [`VERCEL_SETUP.md`](./VERCEL_SETUP.md): configuracion segura de variables para Vercel.

## Soporte tecnico vigente

Estos documentos siguen siendo utiles para mantener el catalogo:

- [`CONTENT_MANAGEMENT.md`](./CONTENT_MANAGEMENT.md): criterios de contenido.
- [`METADATA_STANDARD.md`](./METADATA_STANDARD.md): metadata y SEO.
- [`STYLE_MANAGEMENT.md`](./STYLE_MANAGEMENT.md): sistema visual y tokens.
- [`CACHING_ARCHITECTURE.md`](./CACHING_ARCHITECTURE.md): caching y revalidacion.
- [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md): estrategia de validacion del catalogo vigente.
- [`error-boundaries.md`](./error-boundaries.md): manejo de errores.
- [`../lib/cache/README.md`](../lib/cache/README.md): utilidades de cache.

## Auditorias

- [`audits/auditoria-reinicio-catalogo-fira-estudio-2026-06-25.md`](./audits/auditoria-reinicio-catalogo-fira-estudio-2026-06-25.md): auditoria base del reinicio. Conserva hallazgos funcionales aun no resueltos.
- [`audits/supabase-sql-catalog-audit-2026-08-07.md`](./audits/supabase-sql-catalog-audit-2026-08-07.md): auditoria estatica de SQL/Supabase y checklist read-only para inventario remoto.

## Material historico de e-commerce

La documentacion historica de carrito, checkout, Mercado Pago, webhooks, emails transaccionales y arquitectura comercial retirada quedo archivada en:

- [`archive/ecommerce/README.md`](./archive/ecommerce/README.md)

Ese material no debe usarse como fuente operativa para el catalogo vigente.

El directorio [`../scripts/sql-code/`](../scripts/sql-code/) conserva SQL mixto de catalogo e historia comercial. Su README clasifica el contenido y no prueba estado remoto activo de Supabase.

## Material historico o secundario

- [`ONBOARDING/README.md`](./ONBOARDING/README.md): material de aprendizaje interno. No usarlo como fuente de verdad operativa.
- [`archive/README.md`](./archive/README.md): material historico, educativo o desplazado por docs mas confiables.
