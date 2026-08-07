# SQL Code — referencia historica y catalogo

Este directorio conserva SQL de referencia. No es una guia operativa de deploy del catalogo.

No se ejecuto SQL durante el saneamiento documental. El estado real de Supabase remoto, tablas, datos, policies, Storage y funciones queda `pendiente de confirmar`.

La auditoria estatica y la checklist read-only para inventario remoto estan en [`../../docs/audits/supabase-sql-catalog-audit-2026-08-07.md`](../../docs/audits/supabase-sql-catalog-audit-2026-08-07.md).

## Archivos

| Archivo | Clasificacion | Recomendacion |
| --- | --- | --- |
| `supabase.sql` | Mixto: catalogo + e-commerce historico | Conservar como snapshot de contexto; no ejecutar como migracion. |
| `run-all-security-fixes.sql` | Mixto: policy de `consultas` + hardening comercial historico | No ejecutar para deploy catalogo sin auditoria SQL especifica. |
| `rollback-security-fixes-dev.sql` | Historico/dev, asociado al hardening anterior | No ejecutar para catalogo ni production. |

## Objetos de catalogo detectados

Estos objetos parecen relacionados con el catalogo o el contacto manual, pero su estado remoto no puede confirmarse desde el repo:

- `categorias`
- `productos`
- `variaciones`
- `imagenes_producto`
- `consultas`
- funcion generica `update_timestamp` cuando exista en la base

## Objetos comerciales historicos detectados

Estos objetos pertenecen a la implementacion anterior de e-commerce y no deben considerarse requisitos del catalogo vigente:

- `carts`
- `cart_items`
- `orders`
- `order_items`
- `order_status_history`
- `payment_logs`
- `webhook_queue`
- `webhook_dead_letter`
- `webhook_reconciliation_logs`
- `cleanup_expired_carts`
- `log_order_status_change`
- `update_webhook_queue_timestamp`
- `update_webhook_dead_letter_timestamp`
- policies de bloqueo directo sobre tablas internas de ordenes/webhooks

## Que no ejecutar para el catalogo

Para relanzar el catalogo no ejecutar por defecto:

- scripts de hardening comercial historico;
- rollbacks de RLS o policies;
- SQL vinculado a carrito, ordenes, pagos, webhook queue o dead letter;
- cambios de esquema basados solo en documentacion historica.

Si el catalogo requiere validar Supabase, primero confirmar el estado real del proyecto remoto y preparar una migracion nueva, revisada y acotada al alcance vigente.

## `supabase.sql`

`supabase.sql` es un snapshot mixto. Incluye tablas utiles para catalogo y tablas historicas de e-commerce. Su orden de definicion, constraints y funciones no deben asumirse ejecutables.

No mover todo el archivo al archivo historico porque contiene objetos de catalogo. No usarlo como fuente unica para modificar production.

## Scripts de seguridad

`run-all-security-fixes.sql` mezcla:

- un ajuste sobre `consultas`, potencialmente relevante para contacto;
- hardening de tablas internas historicas de ordenes y webhooks;
- ajustes de `search_path` en funciones genericas e historicas.

`rollback-security-fixes-dev.sql` revierte parte de esas medidas y vuelve a desactivar RLS en tablas historicas. Debe tratarse como material historico/dev, no como herramienta de production.

## Recomendacion futura

Cuando se confirme Supabase real, conviene crear archivos nuevos y separados:

- `catalog-schema.sql`: solo objetos vigentes de catalogo/contacto.
- `archive/ecommerce-schema.sql`: snapshot historico de carrito, ordenes, pagos y webhooks.

Esa separacion debe hacerse despues de un inventario remoto read-only y sin ejecutar cambios destructivos por defecto.
