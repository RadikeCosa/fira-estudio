# Copilot Instructions — Fira Estudio

## Contexto general
- Proyecto e-commerce en Next.js (App Router).
- El carrito es **server-side** con Supabase.
- **No** usar `localStorage`, `CarritoContext`, `CarritoProvider` ni `lib/storage/carrito.ts`.

## Estructura del proyecto (relevante)
- `app/api/cart/`
- `app/api/checkout/`
- `app/carrito/`
- `components/carrito/`
- `lib/mercadopago/`
- `lib/webhooks/`
- `lib/errors/`
- `lib/config/urls.ts`

## Modelo de datos y flujo de checkout
- El carrito se identifica por `session_id` en cookie **httpOnly**.
- La cookie `session_id` debe tener `maxAge` de **7 días**.
- El carrito persiste en Supabase (tablas `cart` / `cart_items`).
- Las órdenes se crean en Supabase **antes** de redirigir a Mercado Pago.
- `external_reference` de Mercado Pago debe ser:
  - `"{email}|{orderId}"`

## Reglas globales (obligatorias)
- **Rate limiting:** nunca usar `Map` en memoria en entorno serverless.
- **formatPrice:** importar desde `lib/utils`; nunca redefinir.
- **Errores:** lanzar subclases de `AppError` (en `lib/errors/`), no `Error` genérico para casos de dominio.

## Carrito (importante)
- Toda mutación/lectura de carrito debe pasar por Server Actions o rutas API server-side.
- No reintroducir estado fuente de verdad en cliente.
- `price_at_addition` es snapshot de precio al agregar: no se recalcula retroactivamente.

## No permitido
- Referencias o imports desde:
  - `lib/context/`
  - `lib/storage/carrito.ts`
  - `CarritoProvider`
  - cualquier implementación de carrito basada en `localStorage`

## Checkout (reglas globales obligatorias)

### Orden obligatorio del flujo
1. Validar `session_id`
2. Validar stock
3. Calcular total **server-side**
4. Crear orden en Supabase
5. Crear preferencia de Mercado Pago
6. Guardar `preference_id`
7. Retornar `init_point`

No alterar este orden.

### external_reference
- Formato canónico: `"{customerEmail}|{orderId}"`
- Parser esperado en `success/page.tsx`:
  - `const [, orderId] = externalReference.split("|")`
- Nota técnica: considerar migración futura a `external_reference = orderId` por edge case RFC 5321 (emails con `|`).

### URLs centralizadas
Siempre usar `lib/config/urls.ts` como source of truth.

```ts
import { CHECKOUT_URLS, WEBHOOK_URL } from "@/lib/config/urls";
```

No hardcodear URLs en handlers, actions ni pages.

### Errores y respuesta HTTP
- Lanzar únicamente subclases de `AppError` en flujo checkout:
  - `ValidationError`
  - `OrderError`
  - `PaymentError`
  - `ConfigurationError`
- Convertir errores a `NextResponse` mediante `buildAppErrorResponse()`.

### Rollback de orden
Si falla creación de preferencia/llamada a MP, ejecutar:

```ts
await repo.updateOrderStatus(orderId, "cancelled");
```

### Webhooks de Mercado Pago
- Soportar 3 formatos:
  - v2: `{ type, data: { id } }` (**usar `data.id` como payment ID**)
  - legacy directo: `{ resource: "123", topic: "payment" }`
  - legacy URL: `{ resource: "https://api.mercadolibre.com/...", topic: "payment" }`
- Seguridad obligatoria:
  - HMAC-SHA256 + allowlist IP por CIDR
  - `WEBHOOK_SKIP_IP_VALIDATION` y `WEBHOOK_SKIP_SIGNATURE_VALIDATION` solo en dev
- Respuesta: **siempre retornar 200** para evitar reenvíos infinitos de MP.

### Rate limiting (serverless)
- `Map` en memoria **no funciona** de forma confiable en Vercel (entorno stateless).
- Migración pendiente: Vercel KV / Upstash.

## Checkout (resumen)

Para reglas completas de checkout/webhook, usar **únicamente**:

- `.github/instructions/checkout.instructions.md`

### En este archivo solo aplica:
- No hardcodear URLs de checkout/webhook.
- No usar `Map` en memoria para rate limiting en serverless.
- Errores de dominio deben ser subclases de `AppError`.
- `formatPrice` se importa de `lib/utils`.