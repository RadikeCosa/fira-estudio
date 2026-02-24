---
applyTo: "app/api/checkout/**,app/checkout/**,lib/mercadopago/**,lib/config/urls*,lib/webhooks/**"
---

# Checkout — Instrucciones de arquitectura

## 1) Flujo de checkout (orden obligatorio)
Seguir este orden exacto, sin saltar pasos:

1. validar `session_id`
2. validar stock
3. calcular total server-side
4. crear orden en Supabase
5. crear preferencia de Mercado Pago
6. guardar `preference_id`
7. retornar `init_point`

## 2) `external_reference`
- Formato obligatorio: `"{customerEmail}|{orderId}"`
- Parser en `success/page.tsx`:
  - `const [, orderId] = externalReference.split("|")`
- Nota técnica:
  - considerar migrar a solo `orderId` (email con `|` es edge case válido en RFC 5321)

## 3) URLs
- Obtener URLs siempre desde `lib/config/urls.ts`.
- Import canónico:
  - `import { CHECKOUT_URLS, WEBHOOK_URL } from "@/lib/config/urls"`

## 4) Errores
- Usar subclases de `AppError`:
  - `ValidationError`
  - `OrderError`
  - `PaymentError`
  - `ConfigurationError`
- Usar `buildAppErrorResponse()` para convertir errores a `NextResponse`.

## 5) Rollback
- Si falla Mercado Pago, ejecutar rollback de orden:
  - `await repo.updateOrderStatus(orderId, "cancelled")`

## 6) Webhook — formatos soportados de Mercado Pago
- v2: `{ type, data: { id } }`
  - `data.id` es el payment ID (**NO** `id`, que es el evento)
- legacy directo: `{ resource: "123", topic: "payment" }`
- legacy URL: `{ resource: "https://api.mercadolibre.com/...", topic: "payment" }`

## 7) Seguridad webhook
- Validar firma `HMAC-SHA256` + IP allowlist CIDR.
- `WEBHOOK_SKIP_IP_VALIDATION` y `WEBHOOK_SKIP_SIGNATURE_VALIDATION` solo en desarrollo.
- Responder siempre `200` para evitar reenvíos infinitos de Mercado Pago.

## 8) Rate limiting
- Un `Map` en memoria **NO** funciona en Vercel (cada invocación es stateless).
- Migración pendiente: Vercel KV / Upstash.

## 9) Páginas de resultado (`success` / `failure` / `pending`)
- Usar `CHECKOUT_CONTENT` de `lib/content/checkout.ts`.
- Usar tokens de `lib/design/tokens.ts`.
- `formatPrice`: importar desde `lib/utils` (no redefinir localmente).
- `success/page.tsx` tiene violaciones pendientes de corregir.

## Fuente única de Checkout

Este archivo es la **fuente de verdad** para todo lo relacionado a checkout y webhook en:

- `app/api/checkout/**`
- `app/checkout/**`
- `lib/mercadopago/**`
- `lib/config/urls*`
- `lib/webhooks/**`

### Reglas canónicas (no duplicar en otros archivos)

1. **Flujo obligatorio**
   validar `session_id` → validar stock → calcular total server-side → crear orden en Supabase → crear preferencia MP → guardar `preference_id` → retornar `init_point`.

2. **external_reference**
   - Formato: `"{customerEmail}|{orderId}"`
   - Parser en `success/page.tsx`:
     `const [, orderId] = externalReference.split("|")`
   - Nota: evaluar migración a `orderId` solo (edge case RFC 5321 con `|`).

3. **URLs**
   Siempre desde `lib/config/urls.ts`:
   `import { CHECKOUT_URLS, WEBHOOK_URL } from "@/lib/config/urls"`.

4. **Errores**
   Usar subclases de `AppError`:
   `ValidationError`, `OrderError`, `PaymentError`, `ConfigurationError`.
   Convertir a `NextResponse` con `buildAppErrorResponse()`.

5. **Rollback**
   Si MP falla:
   `await repo.updateOrderStatus(orderId, "cancelled")`.

6. **Webhook MP: 3 formatos**
   - v2: `{ type, data: { id } }` (`data.id` = payment ID)
   - legacy directo: `{ resource: "123", topic: "payment" }`
   - legacy URL: `{ resource: "https://api.mercadolibre.com/...", topic: "payment" }`

7. **Seguridad webhook**
   HMAC-SHA256 + IP allowlist CIDR.  
   `WEBHOOK_SKIP_IP_VALIDATION` y `WEBHOOK_SKIP_SIGNATURE_VALIDATION` solo dev.  
   Retornar **200 siempre** para evitar reenvíos infinitos.

8. **Rate limiting**
   `Map` en memoria no sirve en Vercel serverless.  
   Migración pendiente: Vercel KV / Upstash.

9. **Páginas resultado**
   - Usar `CHECKOUT_CONTENT` (`lib/content/checkout.ts`)
   - Usar tokens (`lib/design/tokens.ts`)
   - `formatPrice` desde `lib/utils` (no redefinir)
   - `success/page.tsx` mantiene violaciones pendientes
