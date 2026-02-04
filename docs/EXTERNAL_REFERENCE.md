# External Reference - Identificación de Operaciones de Pago

**Última actualización:** 4 de febrero de 2026

## 📋 Descripción

El campo `external_reference` es un identificador alfanumérico que permite vincular operaciones de pago en Mercado Pago con tus órdenes internas. Es fundamental para:

- ✅ Identificar qué orden corresponde a cada pago
- ✅ Reconciliar datos entre tu BD y Mercado Pago
- ✅ Debugging y auditoría
- ✅ Webhooks - Saber qué orden actualizar

---

## 🔑 Implementación Actual

### En create-preference/route.ts

**Ubicación:** `app/api/checkout/create-preference/route.ts` (línea ~161)

```typescript
const preference = {
  items,
  payer: {
    email: customerEmail,
    name: customerName,
    phone: { number: customerPhone },
  },
  back_urls: {
    /* ... */
  },
  auto_return: "approved",
  external_reference: `${customerEmail}|${orderId}`, // ← AQUÍ: email|orderId
  notification_url: webhookUrl,
  payment_methods: {
    /* ... */
  },
};
```

### Formato del External Reference

**Estructura:** `{email}|{orderId}`

**Ejemplo:**

```
ramirocosa@gmail.com|550e8400-e29b-41d4-a716-446655440000
```

### Componentes

- **Email**: `ramirocosa@gmail.com` - Email del cliente (para identificación rápida)
- **Pipe (`|`)**: Separador legible
- **Order ID**: UUID único de la orden en la BD (Supabase)

### Ventajas

✅ **Identificable**: Contiene el email para correlacionar rápido
✅ **Único**: Combinación email + order ID es única por transacción
✅ **Legible**: Fácil de buscar en logs y dashboards
✅ **Rastreable**: Vincula pagos a órdenes específicas

---

## 🔗 Flujo de Identificación

```
1. Usuario completa compra en /checkout
   │
   ├─ Email: usuario@email.com
   ├─ Nombre: Juan Pérez
   └─ Teléfono: +54 9 11 1234-5678
   │
2. Se crea ORDEN en BD (Supabase)
   │
   ├─ order_id: "550e8400-e29b-41d4-a716-446655440000"
   ├─ status: "pending"
   ├─ total_amount: 15000.00
   ├─ created_at: 2026-02-04T10:30:00Z
   └─ items: [...]
   │
3. Se crea PREFERENCIA en Mercado Pago
   │
   ├─ preference_id: "12345678"
   ├─ external_reference: "ramirocosa@gmail.com|550e8400-e29b-41d4-a716-446655440000" ← VINCULACIÓN
   ├─ items: [...]
   ├─ payer: { email, name, phone }
   └─ back_urls: { success, failure, pending }
   │
4. Usuario redirigido a Mercado Pago
   │
5. Usuario completa pago ✅
   │
6. Mercado Pago envía WEBHOOK
   │
   ├─ payment_id: "123456789"
   ├─ status: "approved"
   ├─ external_reference: "ramirocosa@gmail.com|550e8400-e29b-41d4-a716-446655440000" ← IDENTIFICACIÓN
   └─ amount: 15000.00
   │
7. Tu servidor recibe webhook
   │
   ├─ Extrae external_reference: "ramirocosa@gmail.com|550e8400-e29b-41d4-a716-446655440000"
   ├─ Divide por "|": [email, orderId]
   ├─ Busca la orden por orderId
   ├─ Busca orden con ese ID en BD
   ├─ Actualiza status a "approved"
   └─ Responde 200 OK
   │
8. Orden completada ✅
```

---

## 📊 Estructura de External Reference

### Formato

```
Alfanumérico: UUIDs, números, guiones
Longitud: Máximo 256 caracteres (usamos 36 para UUID)
Caracteres válidos: a-z, A-Z, 0-9, guiones (-)
```

### Ejemplo

```
external_reference: "550e8400-e29b-41d4-a716-446655440000"
                    ↑                                        ↑
                    UUID v4 generado por Supabase           36 caracteres
```

### Alternativas (si no usas UUID)

```typescript
// Opción 1: order_number + email
external_reference: `ORD-${orderNumber}-${customerEmail}`;
// Ejemplo: "ORD-1001-usuario@email.com"

// Opción 2: timestamp + hash
external_reference: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// Ejemplo: "1707038400000-abc123def"

// Opción 3: ID auto-increment
external_reference: `ORDER-${orderId}`;
// Ejemplo: "ORDER-12345"

// ✅ ACTUAL: UUID (RECOMENDADO)
external_reference: orderId;
// Ejemplo: "550e8400-e29b-41d4-a716-446655440000"
```

---

## ✅ Implementación en BD

### Tabla Orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Genera UUID único
  -- ... otros campos ...
  external_reference TEXT NOT NULL,                -- Kopie de id para fácil consulta
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  total_amount NUMERIC NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  preference_id TEXT,                              -- MP preference_id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida
CREATE INDEX orders_external_reference_idx ON orders(external_reference);
```

### Tabla Payment Logs

```sql
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_id TEXT UNIQUE NOT NULL,
  external_reference TEXT NOT NULL,              -- Dato del webhook
  status TEXT NOT NULL,                           -- approved/pending/rejected
  status_detail TEXT,
  amount NUMERIC,
  webhook_type TEXT,
  webhook_body JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX payment_logs_external_reference_idx ON payment_logs(external_reference);
CREATE INDEX payment_logs_payment_id_idx ON payment_logs(payment_id);
```

---

## 🔍 Cómo Usar External Reference

### En Webhooks

```typescript
// El webhook recibe:
const { id, type } = await req.json();

// Tu servidor obtiene detalles:
const paymentClient = new Payment(client);
const paymentData = await paymentClient.get({ id });

// Extrae external_reference
const { external_reference, status } = paymentData;
// external_reference = "550e8400-e29b-41d4-a716-446655440000"

// Busca la orden
const order = await CartRepository.getOrderById(external_reference);

// Actualiza estado
await CartRepository.updateOrderStatus(external_reference, status);
```

### En URLs de Retorno

Mercado Pago incluye external_reference como parámetro:

```
/checkout/success?
  external_reference=550e8400-e29b-41d4-a716-446655440000
  &collection_id=123456789
  &payment_id=123456789
```

**Uso en componente:**

```typescript
const searchParams = await props.searchParams;
const orderId = searchParams.external_reference;
const paymentId = searchParams.payment_id;

// Validar que existe en BD
const order = await CartRepository.getOrderById(orderId);
if (!order) {
  return notFound();
}

// Mostrar confirmación con detalles del pedido
```

### En Panel de Admin (Futuro)

```typescript
// Ver pagos vinculados a una orden
const order = await db.query("SELECT * FROM orders WHERE id = $1", [orderId]);

const paymentLogs = await db.query(
  "SELECT * FROM payment_logs WHERE external_reference = $1",
  [order.external_reference],
);

// Mostrar:
// - Orden #ORD-1001
// - Status: Aprobada
// - Pagos: payment_123456789 (approved, $15000)
// - Email: usuario@email.com
```

---

## 🔐 Seguridad

### Validaciones

```typescript
// ✅ Validar que external_reference existe en BD
const order = await db.query("SELECT * FROM orders WHERE id = $1", [
  external_reference,
]);
if (!order) {
  throw new Error("Order not found");
}

// ✅ Validar que monto coincide
if (payment.amount !== order.total_amount) {
  throw new Error("Amount mismatch");
}

// ✅ Validar que email coincide
if (payment.payer.email !== order.customer_email) {
  throw new Error("Email mismatch");
}

// ✅ Validar que no ha sido procesado (idempotencia)
const existingLog = await db.query(
  "SELECT * FROM payment_logs WHERE external_reference = $1",
  [external_reference],
);
if (existingLog && existingLog.status === payment.status) {
  return "Already processed";
}
```

### Nunca

❌ Confiar ciegamente en el webhook  
❌ No validar external_reference  
❌ Usar guiones bajos o caracteres especiales  
❌ Hacer external_reference predecible

---

## 📈 Casos de Uso

### 1. Identificar Compra Única

```typescript
// Usuario completa múltiples compras
// external_reference permite saber cuál pago corresponde a cuál orden

Order 1: id="550e8400-e29b-41d4-a716-446655440000"
  Payment 1: payment_id=123456789, external_reference="550e8400-e29b-41d4-a716-446655440000" ✅

Order 2: id="660e8400-e29b-41d4-a716-446655440001"
  Payment 2: payment_id=987654321, external_reference="660e8400-e29b-41d4-a716-446655440001" ✅
```

### 2. Reconciliación

```typescript
// Verificar que todos los pagos están registrados

// En MP: 1000 pagos
// En tu BD: 1000 órdenes con external_reference

// Query: Buscar órdenes sin pago
SELECT * FROM orders
WHERE external_reference NOT IN (
  SELECT external_reference FROM payment_logs
)
// Si result es vacío → ✅ Todo reconciliado
```

### 3. Auditoría y Debugging

```typescript
// Buscar toda la información de una compra
SELECT
  o.id,
  o.customer_email,
  o.total_amount,
  o.status,
  pl.payment_id,
  pl.status as payment_status,
  pl.webhook_body
FROM orders o
LEFT JOIN payment_logs pl
  ON o.external_reference = pl.external_reference
WHERE o.id = '550e8400-e29b-41d4-a716-446655440000'

-- Resultado: Una línea con toda la info vinculada
```

### 4. Notificaciones

```typescript
// Email de confirmación
TO: orden.customer_email
SUBJECT: "Pedido confirmado - Orden #550e8400"
BODY: """
  Hola {orden.customer_name},

  Tu pago ha sido aprobado.

  Detalles:
  - Orden: 550e8400-e29b-41d4-a716-446655440000
  - Monto: $15,000
  - Estado: Aprobado
  - Fecha: 2026-02-04

  Gracias por tu compra.
"""
```

---

## 🧪 Testing

### Test Local

```bash
# 1. Dev server corriendo
npm run dev

# 2. Completar checkout con:
# Email: tu-email@test.com
# Nombre: Test User
# Teléfono: +54 9 11 1234-5678

# 3. Ver en logs
# [Webhook] Received event: type=payment, id=123456789
# [Webhook] external_reference=550e8400-e29b-41d4-a716-446655440000

# 4. Verificar en BD
SELECT * FROM orders
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

# 5. Verificar pagos vinculados
SELECT * FROM payment_logs
WHERE external_reference = '550e8400-e29b-41d4-a716-446655440000';
```

### Dashboard de MP

1. **Ir a:** https://www.mercadopago.com.ar/developers
2. **Sales → Payments**
3. **Buscar pago** por external_reference
4. **Verificar:**
   - `external_reference: "550e8400-e29b-41d4-a716-446655440000"`
   - `status: approved`
   - `amount: 15000`

---

## 📊 Respuesta de Mercado Pago

Cuando consultas una preferencia o pago, MP incluye:

```json
{
  "id": 123456789,
  "type": "payment",
  "status": "approved",
  "external_reference": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 15000,
  "payer": {
    "email": "usuario@email.com",
    "name": "Juan Pérez"
  },
  "items": [
    {
      "title": "Remera Lino Natural",
      "unit_price": 10000,
      "quantity": 1
    },
    {
      "title": "Bufanda Lino",
      "unit_price": 5000,
      "quantity": 1
    }
  ],
  "created_at": "2026-02-04T10:35:00Z"
}
```

**Extrae:** `external_reference` para identificar orden

---

## ✅ Checklist

- [x] External reference implementado: `external_reference: orderId`
- [x] OrderId es UUID único generado en BD
- [x] Se envía en preferencia a MP
- [x] Se valida en webhooks
- [x] Se guarda en payment_logs
- [x] Se usa para actualizar orden
- [x] Índices creados en tablas
- [x] Documentación completa
- [ ] Testeado en ambiente real
- [ ] Panel de admin implementado (futuro)
- [ ] Reconciliación automática (futuro)

---

## 🔗 Referencias

- [Mercado Pago - External Reference](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/integrate-preferences-create#external_reference)
- [API Preferences - Get](https://www.mercadopago.com.ar/developers/es/docs/api-references/preferences/get)
- [Webhooks - Payment Data](https://www.mercadopago.com.ar/developers/es/docs/webhooks/features#payment-details)

---

## 🎯 Resumen

✅ **External Reference:** `external_reference: orderId`  
✅ **Formato:** UUID único (550e8400-e29b-41d4-a716-446655440000)  
✅ **Propósito:** Vincular pagos con órdenes  
✅ **Uso en webhooks:** Identificar qué orden actualizar  
✅ **Seguridad:** Siempre validar en BD

**Estado:** ✅ Completamente implementado y configurado
