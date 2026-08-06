# Documentacion del proyecto

Este directorio concentra la documentacion tecnica y operativa de `fira-estudio`.

La etapa vigente del proyecto es una vidriera digital o catalogo publico. La documentacion activa debe reflejar ese contrato y tratar la capa de e-commerce como infraestructura historica suspendida.

## Nucleo activo

Estos documentos son la entrada principal para entender y operar el proyecto vigente:

- [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md): contrato canonico del producto.
- [`../README.md`](../README.md): entrada tecnica y de portfolio.
- [`../AGENTS.md`](../AGENTS.md): guia canonica para asistentes y agentes.
- [`ENVIRONMENTS.md`](./ENVIRONMENTS.md): criterios de entornos, variables y estados `pendiente de confirmar`.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): checklist de deploy y validaciones.
- [`VERCEL_SETUP.md`](./VERCEL_SETUP.md): configuracion segura de variables para Vercel.

## Soporte tecnico vigente

Estos documentos siguen siendo utiles para mantener el catalogo:

- [`CONTENT_MANAGEMENT.md`](./CONTENT_MANAGEMENT.md): criterios de contenido.
- [`METADATA_STANDARD.md`](./METADATA_STANDARD.md): metadata y SEO.
- [`STYLE_MANAGEMENT.md`](./STYLE_MANAGEMENT.md): sistema visual y tokens.
- [`CACHING_ARCHITECTURE.md`](./CACHING_ARCHITECTURE.md): caching y revalidacion.
- [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md): estrategia de validacion; revisar drift si menciona flujos comerciales.
- [`error-boundaries.md`](./error-boundaries.md): manejo de errores.
- [`../lib/cache/README.md`](../lib/cache/README.md): utilidades de cache.

## Auditorias

- [`audits/auditoria-reinicio-catalogo-fira-estudio-2026-06-25.md`](./audits/auditoria-reinicio-catalogo-fira-estudio-2026-06-25.md): auditoria base del reinicio. Conserva hallazgos funcionales aun no resueltos.

## Infraestructura historica suspendida

Estos documentos describen piezas que existen en el repositorio, pero no forman parte del producto publico vigente:

- [`WEBHOOK_SECURITY.md`](./WEBHOOK_SECURITY.md): pagos y webhooks.
- [`ORDER_CONFIRMATION_EMAIL.md`](./ORDER_CONFIRMATION_EMAIL.md): emails transaccionales de pedidos.
- [`MAINTENANCE_MODE.md`](./MAINTENANCE_MODE.md): maintenance mode; no debe usarse como catalog mode.
- [`../scripts/sql-code/README.md`](../scripts/sql-code/README.md): SQL de referencia e hardening; no prueba estado remoto activo.

Recomendacion futura: archivar o separar fisicamente la documentacion de comercio cuando se implemente el aislamiento funcional.

## Material historico o secundario

- [`ONBOARDING/README.md`](./ONBOARDING/README.md): material de aprendizaje interno. No usarlo como fuente de verdad operativa.
- [`archive/README.md`](./archive/README.md): material historico, educativo o desplazado por docs mas confiables.
