# Testing Strategy - Phase 2 Checkout Pro

## Objetivo

Implementar suite de tests unitarios e integración para garantizar robustez de:

- CartRepository (CRUD, transacciones, validación)
- API create-preference (flujo de orden)
- API webhook (procesamiento de pagos)

**Target Coverage:** >80%  
**Timeline:** 3-4 días

---

## 1. CartRepository Tests

### Métodos a Testear (11 métodos)

| Método                   | Tests | Caso Crítico                  |
| ------------------------ | ----- | ----------------------------- |
| `getOrCreateCart()`      | 2     | Crear si no existe            |
| `getCartWithItems()`     | 2     | Items populados correctamente |
| `addItem()`              | 3     | Sumar cantidad si existe      |
| `updateItemQuantity()`   | 1     | Cantidad negativa             |
| `removeItem()`           | 1     | Item inexistente              |
| `clearCart()`            | 1     | Carrito vacío                 |
| `updateCartTotal()`      | 1     | Cálculo correcto              |
| `validateStock()`        | 2     | Stock insuficiente            |
| `createOrderWithItems()` | 3     | Transacción (todo o nada)     |
| `savePaymentLog()`       | 1     | Idempotencia                  |
| `updateOrderStatus()`    | 1     | Estados válidos               |

**Total Tests:** 18+  
**Estrategia:** Mock de Supabase, fixtures de datos

### Setup

```typescript
// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn(),
      // ... mock de métodos
    }))
  }))
}));

// Fixtures
const mockCart = { id: '123', session_id: 'abc', total_amount: 0, ... };
const mockCartItem = { id: '1', cart_id: '123', variacion_id: 'var1', quantity: 1, ... };
```

---

## 2. Create Preference Endpoint Tests

### Casos a Testear

| Caso                        | Esperado                                 | Status Code |
| --------------------------- | ---------------------------------------- | ----------- |
| Happy path (carrito válido) | Preferencia creada, init_point retornado | 200         |
| Carrito vacío               | Error "carrito vacío"                    | 400         |
| Stock insuficiente          | Error con detalles de items              | 400         |
| Customer data faltante      | Error "campos requeridos"                | 400         |
| Session inválida            | Error "no session_id"                    | 400         |
| Error Mercado Pago          | Error "no se pudo crear preferencia"     | 500         |
| Variables de env faltantes  | Error "env vars"                         | 500         |

**Total Tests:** 8+

### Setup

```typescript
// Mock CartRepository
vi.mock("@/lib/repositories/cart.repository", () => ({
  CartRepository: {
    getCartWithItems: vi.fn(),
    validateStock: vi.fn(),
    createOrderWithItems: vi.fn(),
  },
}));

// Mock Mercado Pago client
vi.mock("@/lib/mercadopago/client", () => ({
  Preference: vi.fn(() => ({
    create: vi.fn(),
  })),
}));

// Mock NextRequest con cookies
const mockRequest = new NextRequest(new URL("http://localhost"), {
  method: "POST",
  body: JSON.stringify({
    customerEmail: "test@example.com",
    customerName: "Test User",
    customerPhone: "+123456789",
  }),
  headers: new Headers({
    Cookie: "session_id=test-session-123",
  }),
});
```

---

## 3. Webhook Endpoint Tests

### Casos a Testear

| Caso                           | Validación           | Esperado                        |
| ------------------------------ | -------------------- | ------------------------------- |
| Evento válido + firma correcta | IP + HMAC-SHA256     | 200, orden actualizada          |
| Mismo evento 2x (idempotencia) | Payment ID duplicado | 200, sin duplicar procesamiento |
| Firma inválida                 | HMAC-SHA256 fail     | 401, rechazado                  |
| IP no autorizada               | IP fuera de rango    | 403, rechazado                  |
| Evento sin payment.created     | type !== "payment"   | 200, ignorado                   |
| Pago aprobado                  | status = "approved"  | Order.status = "approved"       |
| Pago rechazado                 | status = "rejected"  | Order.status = "rejected"       |
| Pago pendiente                 | status = "pending"   | Order.status = "pending"        |
| Mercado Pago API fail          | Payment.get() error  | 500                             |
| External reference faltante    | Sin order_id         | 400                             |

**Total Tests:** 12+

### Setup

```typescript
// Mock de signature validation
vi.mock("@/lib/mercadopago/webhook-security", () => ({
  validateWebhookSignature: vi.fn(),
  validateMercadoPagoIP: vi.fn(),
  extractClientIP: vi.fn(),
}));

// Mock Mercado Pago Payment API
vi.mock("mercadopago", () => ({
  Payment: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// Helper para crear request con firma válida
function createWebhookRequest(paymentId, status, signature) {
  return new NextRequest(new URL("http://localhost"), {
    method: "POST",
    body: JSON.stringify({
      id: paymentId,
      type: "payment",
    }),
    headers: new Headers({
      "x-signature": signature,
      "x-forwarded-for": "200.121.192.50",
    }),
  });
}
```

---

## Testing Flow (Orden de Ejecución)

```
1. CartRepository Tests
   ├─ CRUD operations
   ├─ Transaction behavior
   ├─ Stock validation
   └─ Payment log idempotence

2. Create Preference Tests
   ├─ Happy path
   ├─ Validation errors
   ├─ Mercado Pago integration
   └─ Error handling

3. Webhook Tests
   ├─ Security validations
   ├─ Event processing
   ├─ Idempotency
   └─ State mapping

4. Integration Tests (final)
   ├─ Cart → Preference creation
   ├─ Preference → Payment
   └─ Payment → Order confirmation
```

---

## Tools & Framework

- **Framework:** Vitest (ya configurado)
- **Mocking:** vi.mock() built-in
- **Fixtures:** Data builders para reutilizar
- **Coverage:** vitest --coverage

---

## Acceptance Criteria

✅ CartRepository: >80% coverage, >15 tests  
✅ create-preference: >80% coverage, >8 tests  
✅ webhook: >80% coverage, >12 tests  
✅ Overall: >80% coverage  
✅ All tests passing  
✅ No warnings in test output

---

## Ejecución

```bash
# Correr solo CartRepository tests
npm test -- lib/repositories/cart.repository.test.ts

# Correr tests de endpoints
npm test -- app/api/checkout

# Correr suite completa de tests
npm test

# Generar coverage report
npm test -- --coverage
```

---

**Próximo Paso:** Implementar los archivos de test comenzando con CartRepository.
