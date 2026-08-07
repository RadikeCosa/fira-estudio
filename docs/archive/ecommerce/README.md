# Archivo historico de e-commerce

Este directorio conserva documentacion de la implementacion anterior de comercio online de `fira-estudio`.

No describe el producto vigente. No debe usarse como guia de configuracion para production, Vercel, Supabase, Mercado Pago, Resend ni webhooks.

Puede servir como referencia tecnica si en el futuro se decide reactivar comercio online, pero esa decision requiere auditoria especifica, nuevas validaciones y actualizacion del contrato de producto.

Git conserva el historial completo de los archivos movidos; no es necesario duplicar contenido historico en la documentacion activa.

## Contenido

- [`webhooks/WEBHOOK_SECURITY.md`](./webhooks/WEBHOOK_SECURITY.md): pagos, webhooks y cola historica.
- [`emails/ORDER_CONFIRMATION_EMAIL.md`](./emails/ORDER_CONFIRMATION_EMAIL.md): emails transaccionales de pedidos retirados.
- [`testing/CHECKOUT_TESTING_STRATEGY.md`](./testing/CHECKOUT_TESTING_STRATEGY.md): estrategia anterior centrada en checkout.
- [`analytics/ANALYTICS_BASICS.md`](./analytics/ANALYTICS_BASICS.md): onboarding historico de GA4 con eventos comerciales.
- [`architecture/ERROR_HANDLING_ARCHITECTURE_DIAGRAM.md`](./architecture/ERROR_HANDLING_ARCHITECTURE_DIAGRAM.md): diagramas de errores con clases comerciales retiradas.
- [`architecture/ERROR_HANDLING_QUICK_REFERENCE.md`](./architecture/ERROR_HANDLING_QUICK_REFERENCE.md): snippets historicos para endpoints comerciales.

## Clasificacion

| Documento | Estado | Recomendacion |
| --- | --- | --- |
| Webhooks y Mercado Pago | Historico util | Conservar archivado; revisar desde Git si se reintroduce comercio. |
| Emails transaccionales | Historico util | Conservar archivado; no usar para setup activo. |
| Testing de checkout | Historico util | Conservar archivado; no usar como estrategia vigente. |
| Analytics comercial | Historico util | Conservar archivado; no usar como onboarding vigente. |
| Diagramas/snippets de errores comerciales | Historico util | Conservar archivado; reescribir si vuelven endpoints comerciales. |
