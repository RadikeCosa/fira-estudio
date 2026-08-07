# Auditoria Supabase y SQL para catalogo

Fecha: 2026-08-07

Esta auditoria registra el diagnostico estatico de Supabase/SQL posterior al saneamiento documental de Fase 2D. No se ejecuto SQL, no se conecto Supabase y no se modificaron tablas, datos, RLS, policies, funciones ni triggers.

## Contexto

Fira Estudio funciona actualmente como catalogo digital. La infraestructura ejecutable de e-commerce fue retirada del arbol principal: carrito, checkout, ordenes, Mercado Pago, webhooks, reconciliacion y emails transaccionales ya no forman parte del runtime vigente.

Los scripts SQL versionados siguen siendo mixtos o historicos. No deben tratarse como setup canonico del catalogo ni como evidencia del estado remoto actual.

Durante esta auditoria no hubo acceso remoto seguro a Supabase. El estado remoto queda `pendiente de confirmar`.

## Acceso remoto

- Supabase CLI no disponible en el entorno local.
- Proyecto Supabase no linkeado localmente.
- No habia credenciales remotas utiles en variables de entorno.
- Solo existe `.env.local.example` con placeholders.
- Estado remoto de tablas, datos, RLS, policies, funciones, triggers, indices y Storage: `pendiente de confirmar`.

No copiar secretos ni valores reales en esta auditoria.

## Uso vigente desde codigo

El codigo actual consume Supabase solo para lectura de catalogo mediante cliente server/anon.

Objetos vigentes usados:

- `categorias`
- `productos`
- `variaciones`
- `imagenes_producto`

`consultas` existe en SQL versionado, pero no tiene consumidor vigente en el runtime actual. El contacto publico actual no escribe en Supabase; usa canales manuales como email/WhatsApp segun variables disponibles.

No se detectaron operaciones Supabase vigentes de escritura (`insert`, `update`, `delete`) ni RPC en el arbol ejecutable.

## SQL historico/comercial detectado

Objetos comerciales historicos en SQL versionado:

- `carts`
- `cart_items`
- `orders`
- `order_items`
- `order_status_history`
- `payment_logs`
- `webhook_queue`
- `webhook_dead_letter`
- `webhook_reconciliation_logs`

La existencia remota de estos objetos no fue confirmada.

## Dependencias relevantes

- `cart_items.variacion_id -> variaciones`
- `order_items.variacion_id -> variaciones`
- `consultas.producto_id -> productos`
- `consultas.variacion_id -> variaciones`

El catalogo no depende de las tablas historicas, pero las tablas historicas pueden referenciar objetos de catalogo. Esa direccion de dependencia impide recomendar limpieza remota sin inventario previo.

## Objetos ambiguos

Quedan `pendiente de confirmar`:

- `update_timestamp`
- funciones historicas de ordenes, carrito y webhooks
- triggers historicos de ordenes, carrito y webhooks
- indices no versionados en scripts SQL activos
- funciones `SECURITY DEFINER`

El repo actual no contiene una definicion completa del estado remoto.

## Matriz resumida

| Objeto | Codigo vigente | SQL repo | Remoto | Categoria | Recomendacion |
| ------ | -------------- | -------- | ------ | --------- | ------------- |
| `categorias` | si, lectura | si | pendiente de confirmar | catalogo | mover a schema catalogo cuando haya inventario remoto |
| `productos` | si, lectura | si | pendiente de confirmar | catalogo | mover a schema catalogo cuando haya inventario remoto |
| `variaciones` | si, lectura relacionada | si | pendiente de confirmar | catalogo/compartido | mover a schema catalogo; revisar FKs historicas |
| `imagenes_producto` | si, lectura relacionada | si | pendiente de confirmar | catalogo | mover a schema catalogo cuando haya inventario remoto |
| `consultas` | no | si | pendiente de confirmar | contacto potencial | requiere decision antes de incluir en schema vigente |
| `carts` | no | si | pendiente de confirmar | comercio historico | archivar; candidato a limpieza remota futura |
| `cart_items` | no | si | pendiente de confirmar | comercio historico | archivar; revisar FK a `variaciones` |
| `orders` | no | si | pendiente de confirmar | comercio historico | archivar; candidato a limpieza remota futura |
| `order_items` | no | si | pendiente de confirmar | comercio historico | archivar; revisar FK a `variaciones` |
| `order_status_history` | no | si | pendiente de confirmar | comercio historico | archivar; revisar RLS/policies remotas |
| `payment_logs` | no | si | pendiente de confirmar | comercio historico | archivar |
| `webhook_queue` | no | si | pendiente de confirmar | comercio historico | archivar; revisar indices/policies remotas |
| `webhook_dead_letter` | no | si | pendiente de confirmar | comercio historico | archivar; revisar FK a `webhook_queue` |
| `webhook_reconciliation_logs` | no | si | pendiente de confirmar | comercio historico | archivar |
| `update_timestamp` | no directo | alter-only en hardening | pendiente de confirmar | compartido/ambiguo | pendiente de confirmar antes de separar |

## Riesgos abiertos

- RLS real del catalogo desconocido.
- Policies y grants reales desconocidos.
- Funciones y triggers remotos no inventariados.
- Posible drift entre Supabase remoto y repo.
- Posible existencia remota de tablas comerciales con datos historicos.
- `supabase.sql` no debe tratarse como migracion canonica.
- `run-all-security-fixes.sql` mezcla contacto potencial con hardening historico.

Ninguno de estos puntos confirma un defecto remoto por si solo; dependen de inspeccion read-only futura.

## Decision actual sobre SQL

No separar todavia los scripts SQL versionados hasta contar con un inventario remoto read-only de tablas, RLS, policies, funciones, triggers, indices y foreign keys.

Propuesta futura provisional, no implementada:

```text
scripts/sql-code/
  catalog-schema.sql
  catalog-security.sql
  catalog-contact.sql
  README.md
  archive/
    ecommerce-schema.sql
    ecommerce-security.sql
    rollback-security-fixes-dev.sql
```

Esta estructura es provisional y debe validarse contra el estado remoto antes de cualquier split.

## Checklist para inspeccion remota

Cuando exista acceso seguro de solo lectura a Supabase, verificar:

### Tablas

- existencia de `categorias`, `productos`, `variaciones`, `imagenes_producto`;
- existencia y vigencia de `consultas`;
- existencia de tablas historicas comerciales;
- si hay tablas remotas no versionadas.

### Relaciones

- foreign keys;
- dependencias hacia `productos` y `variaciones`;
- dependencias desde tablas historicas hacia catalogo;
- dependencias desde objetos vigentes hacia objetos historicos.

### RLS

Para cada tabla vigente:

- RLS habilitado o no;
- policies para `anon`;
- policies para `authenticated`;
- permisos efectivos de `SELECT`;
- permisos efectivos de `INSERT`;
- permisos efectivos de `UPDATE`;
- permisos efectivos de `DELETE`.

### Funciones y triggers

Inventariar:

- nombre;
- tabla asociada;
- si usa `SECURITY DEFINER`;
- `search_path`;
- consumidor conocido;
- vigencia actual.

### Indices

Confirmar indices relevantes de:

- slugs;
- foreign keys;
- productos/categorias;
- tablas que sigan operativas.

### Drift

Comparar:

```text
codigo actual <-> SQL versionado <-> Supabase remoto
```

### Datos historicos

Confirmar existencia y volumen de forma segura. No inspeccionar PII ni contenido de consultas salvo necesidad explicita.

## Ejemplos read-only

Solo inspeccion — no modifica Supabase.

Listar tablas publicas:

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Listar columnas de objetos relevantes:

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'categorias',
    'productos',
    'variaciones',
    'imagenes_producto',
    'consultas',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'order_status_history',
    'payment_logs',
    'webhook_queue',
    'webhook_dead_letter',
    'webhook_reconciliation_logs'
  )
ORDER BY table_name, ordinal_position;
```

Listar foreign keys:

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

Listar estado RLS:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_catalog.pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Listar policies:

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Listar funciones publicas y configuracion:

```sql
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  p.prosecdef AS security_definer,
  p.proconfig AS function_config
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

Listar triggers:

```sql
SELECT event_object_table, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

Listar indices:

```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_catalog.pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

