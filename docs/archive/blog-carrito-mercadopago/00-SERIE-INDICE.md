# Serie: Carrito + Mercado Pago en Fira Estudio (para juniors)

> Material archivado de caracter educativo.
> No usar esta serie como documentacion operativa vigente.

## Objetivo de la serie
Explicar, de forma progresiva y práctica, cómo funciona el flujo completo de compra en este proyecto:

1. Agregar productos al carrito
2. Crear orden y preferencia de pago
3. Pagar con Mercado Pago
4. Confirmar por webhook
5. Reflejar estado final en la UI

La serie usa la arquitectura real del proyecto y, además, propone una **arquitectura objetivo** para corregir desvíos detectados (documentación vs implementación).

## Audiencia
- Perfil: **fullstack junior**
- Formato: **balanceado** (conceptos + snippets reales)
- Enfoque: entender el “por qué” de cada decisión, no solo copiar código

## Estructura de artículos (9)

### 1) Arquitectura end-to-end: del botón “Agregar” al “Pago aprobado”
- Tipo: artículo fundacional (completo)
- Resultado: mapa mental del sistema y responsabilidades por capa
- Archivos foco:
  - `components/carrito/AddToCartButton.tsx`
  - `app/api/cart/actions.ts`
  - `app/api/checkout/create-preference/route.ts`
  - `lib/mercadopago/client.ts`
  - `app/api/checkout/webhook/route.ts`
  - `lib/webhooks/queue-processor.ts`
  - `app/checkout/success/page.tsx`

### 2) Carrito con Server Actions + Supabase
- Resultado: entender sesión anónima, persistencia y reglas de negocio del carrito
- Archivos foco:
  - `app/api/cart/actions.ts`
  - `lib/repositories/cart.repository.ts`
  - `lib/types.ts`
  - `components/carrito/ShoppingCart.tsx`

### 3) UI del carrito para buena UX en red real
- Resultado: diseñar estados de carga/error/éxito sin romper simplicidad
- Archivos foco:
  - `components/carrito/AddToCartButton.tsx`
  - `components/layout/CartIndicator.tsx`
  - `components/carrito/ShoppingCart.tsx`

### 4) Checkout robusto: validaciones server-side y creación de orden
- Resultado: entender por qué el backend recalcula total y valida stock
- Archivos foco:
  - `components/carrito/CheckoutForm.tsx`
  - `app/api/checkout/create-preference/route.ts`
  - `lib/config/urls.ts`

### 5) Integración con Mercado Pago: cliente, preferencia y retorno
- Resultado: comprender `external_reference`, init point y páginas success/pending/failure
- Archivos foco:
  - `lib/mercadopago/client.ts`
  - `app/api/checkout/create-preference/route.ts`
  - `app/checkout/success/page.tsx`
  - `app/checkout/pending/page.tsx`
  - `app/checkout/failure/page.tsx`

### 6) Webhooks en producción: ACK rápido + cola + retries + idempotencia
- Resultado: evitar pérdida de pagos por fallas transitorias
- Archivos foco:
  - `app/api/checkout/webhook/route.ts`
  - `lib/webhooks/queue-processor.ts`

### 7) Seguridad y operación del webhook
- Resultado: aplicar defensa en profundidad y operación segura
- Archivos foco:
  - `lib/mercadopago/webhook-security.ts`
  - `lib/utils/security-logger.ts`
  - `app/api/webhooks/status/route.ts`
  - `app/api/webhooks/process-queue/route.ts`
  - `app/api/webhooks/reconcile/route.ts`

### 8) Arquitectura objetivo: mejorar sin reescribir todo
- Resultado: priorizar mejoras reales con bajo riesgo
- Foco:
  - rate limit distribuido
  - consistencia de `session_id`
  - política de stock “a pedido” vs bloqueo
  - alinear documentación con código

### 9) Testing y observabilidad de extremo a extremo
- Resultado: pasar de tests de “shape” a pruebas de confianza operativa
- Archivos foco:
  - `app/api/checkout/create-preference/create-preference.test.ts`
  - `app/api/checkout/webhook/webhook.test.ts`
  - `hooks/useRateLimit.test.ts`
  - `docs/TESTING_STRATEGY.md`

## Convención editorial por artículo
Cada artículo sigue esta plantilla:

1. Problema que resolvemos
2. Flujo funcional (en lenguaje de negocio)
3. Recorrido archivo por archivo
4. Decisiones de arquitectura (y por qué)
5. Alternativas posibles (pros/contras)
6. Errores comunes de juniors
7. Checklist de implementación

## Estado
- [x] Índice de serie
- [x] Artículo 1 (completo)
- [ ] Artículos 2-9 (borrador inicial)
