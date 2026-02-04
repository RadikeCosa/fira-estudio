# External Reference - Resumen de Implementación

**Completado:** 4 de febrero de 2026

## ✅ Implementación Completada

El campo `external_reference` está completamente implementado para identificar operaciones de pago vinculadas a órdenes.

---

## 🏗️ Arquitectura

### 1. **Generación de Order ID**

**Archivo:** `sql-code/fase-2.sql`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_reference TEXT NOT NULL,
  -- ...
);
```

- UUID único generado automáticamente por Supabase
- Se genera en `createOrderWithItems()` de CartRepository
- Ejemplo: `550e8400-e29b-41d4-a716-446655440000`

---

### 2. **Envío a Mercado Pago**

**Archivo:** `app/api/checkout/create-preference/route.ts` (línea 110)

```typescript
const preference = {
  items,
  payer: {
    /* ... */
  },
  back_urls: {
    /* ... */
  },
  auto_return: "approved",
  external_reference: orderId, // ← UUID de la orden
  notification_url: process.env.MERCADOPAGO_WEBHOOK_URL!,
  payment_methods: {
    /* ... */
  },
};
```

**Flujo:**

```
1. Se crea orden en BD → genera order_id (UUID)
2. Se crea preferencia en MP → incluye external_reference
3. Usuario paga en MP
4. MP vincula pago a external_reference
```

---

### 3. **Recepción en Webhook**

**Archivo:** `app/api/checkout/webhook/route.ts` (línea 55-65)

```typescript
const { id, type } = await req.json();
const paymentClient = new Payment(client);
const paymentData = await paymentClient.get({ id });

const {
  id: paymentIdFromMP,
  status,
  external_reference, // ← Extraído del pago
} = paymentData;

// Usar external_reference para identificar la orden
await CartRepository.updateOrderStatus(
  external_reference, // ← ID único de la orden
  orderStatus,
  String(paymentIdFromMP),
);
```

**Flujo:**

```
1. MP envía webhook con payment_id
2. Tu servidor obtiene detalles del pago desde MP
3. Extrae external_reference (order_id)
4. Busca orden en BD por external_reference
5. Actualiza estado de esa orden
```

---

### 4. **Almacenamiento en Payment Logs**

**Archivo:** `sql-code/fase-2.sql`

```sql
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_id TEXT UNIQUE NOT NULL,
  external_reference TEXT NOT NULL,  -- Copia del order_id
  status TEXT NOT NULL,
  -- ... otros campos ...
);
```

**Vinculación:**

```
payment_logs.order_id → orders.id (foreign key)
payment_logs.external_reference → orders.id (duplicate para búsquedas rápidas)
```

---

## 📊 Flujo Completo

```
1. Usuario en /checkout
   ├─ Completa formulario (email, nombre, teléfono)
   └─ Hace clic en "Ir a pagar"
        ↓

2. Endpoint: POST /api/checkout/create-preference
   ├─ Crea orden en BD
   ├─ Genera order_id (UUID): 550e8400-e29b-41d4-a716-446655440000
   ├─ Crea preferencia en MP
   ├─ external_reference = 550e8400-e29b-41d4-a716-446655440000  ← VINCULACIÓN
   └─ Retorna init_point (URL de MP)
        ↓

3. Usuario redirigido a Mercado Pago
   ├─ Selecciona método de pago
   ├─ Completa pago ✅
   └─ MP crea payment (id=123456789)
        ↓

4. Mercado Pago envía webhook
   ├─ POST /api/checkout/webhook
   └─ Body: { id: 123456789, type: "payment" }
        ↓

5. Webhook recibe evento
   ├─ Obtiene detalles del pago (status, external_reference, etc.)
   ├─ external_reference = 550e8400-e29b-41d4-a716-446655440000  ← IDENTIFICACIÓN
   ├─ Busca orden con ese ID
   ├─ Guarda payment_log
   ├─ Actualiza orden.status = "approved"
   └─ Responde 200 OK
        ↓

6. Orden completada
   ├─ Status: approved
   ├─ Pago vinculado: payment_123456789
   └─ Payment log: external_reference=550e8400-e29b-41d4-a716-446655440000
```

---

## 🔑 Beneficios

✅ **Identificación única:** Cada pago se vincula a una orden específica  
✅ **Reconciliación:** Fácil comparar BD propia con datos de MP  
✅ **Auditoría:** Historial completo de pagos por orden  
✅ **Debugging:** Encontrar rápidamente info de una compra  
✅ **Escalabilidad:** Soporta múltiples órdenes por usuario  
✅ **Seguridad:** Validar que pago corresponde a orden esperada

---

## 📋 Componentes Involucrados

| Componente        | Archivo                                       | Función                                              |
| ----------------- | --------------------------------------------- | ---------------------------------------------------- |
| CartRepository    | `lib/repositories/cart.repository.ts`         | `createOrderWithItems()` - Genera order_id           |
| Create Preference | `app/api/checkout/create-preference/route.ts` | Envía external_reference a MP                        |
| Webhook           | `app/api/checkout/webhook/route.ts`           | Recibe y procesa external_reference                  |
| Database          | `sql-code/fase-2.sql`                         | Almacena external_reference en orders y payment_logs |
| Tipos             | `lib/types.ts`                                | Define Order, PaymentLog con campos                  |

---

## 🧪 Verificación

### Quick Check

**En Supabase, ejecuta:**

```sql
-- Ver orden más reciente con su external_reference
SELECT
  id,
  external_reference,
  customer_email,
  status
FROM orders
ORDER BY created_at DESC
LIMIT 1;

-- Resultado esperado:
-- id: 550e8400-e29b-41d4-a716-446655440000
-- external_reference: 550e8400-e29b-41d4-a716-446655440000  ← Deben ser iguales
-- customer_email: usuario@email.com
-- status: approved (o pending si no se pagó)
```

### Full Verification

Ver documento: [EXTERNAL_REFERENCE_VERIFY.md](./EXTERNAL_REFERENCE_VERIFY.md)

---

## 🚀 Uso en Producción

### 1. Panel de Admin (Futuro)

```typescript
// Buscar compras por email
const orders = await db.query(
  "SELECT * FROM orders WHERE customer_email = $1 ORDER BY created_at DESC",
  [userEmail],
);

// Cada orden tendrá sus pagos vinculados
for (const order of orders) {
  const payments = await db.query(
    "SELECT * FROM payment_logs WHERE external_reference = $1",
    [order.external_reference],
  );
  // Mostrar en UI
}
```

### 2. Email de Confirmación

```
Subject: Pedido confirmado - Orden #550e8400

Detalles:
- Orden: 550e8400-e29b-41d4-a716-446655440000
- Monto: $15,000
- Status: Aprobado
- Referencia Mercado Pago: payment_123456789
```

### 3. Reconciliación Automática

```bash
# Script cron diario: Verificar órdenes sin pago
SELECT o.id
FROM orders o
WHERE o.status = 'pending'
AND o.created_at < NOW() - INTERVAL '24 hours'
AND NOT EXISTS (
  SELECT 1 FROM payment_logs pl
  WHERE pl.external_reference = o.external_reference
)
```

---

## 📚 Documentación Relacionada

| Documento                                                      | Propósito                              |
| -------------------------------------------------------------- | -------------------------------------- |
| [EXTERNAL_REFERENCE.md](./EXTERNAL_REFERENCE.md)               | Documentación técnica completa         |
| [EXTERNAL_REFERENCE_VERIFY.md](./EXTERNAL_REFERENCE_VERIFY.md) | Guía paso a paso para verificar        |
| [PAYMENT_RETURN_URLS.md](./PAYMENT_RETURN_URLS.md)             | URLs de retorno con external_reference |
| [WEBHOOK_NOTIFICATIONS.md](./WEBHOOK_NOTIFICATIONS.md)         | Webhooks y procesamiento               |

---

## ✅ Checklist

- [x] UUID generado en BD automáticamente
- [x] external_reference enviado en preferencia
- [x] external_reference recibido en webhook
- [x] Orden actualizada usando external_reference
- [x] Payment log guardado con external_reference
- [x] Índices creados para búsquedas rápidas
- [x] Documentación técnica completa
- [x] Guía de verificación paso a paso
- [ ] Testeado en ambiente real (próximo paso)
- [ ] Panel de admin implementado (futuro)

---

## 🎯 Conclusión

✅ **External Reference completamente implementado**

Tu aplicación ahora puede:

- Identificar unívocamente cada operación de pago
- Vincular pagos con órdenes automáticamente
- Reconciliar datos entre tu BD y Mercado Pago
- Procesar webhooks con confianza
- Auditar el historial completo de compras

**Próximo paso:** Ejecutar el dev server y probar el flujo completo de pago.
