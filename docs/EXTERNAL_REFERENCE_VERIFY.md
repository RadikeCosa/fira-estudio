# Verificación de External Reference - Paso a Paso

**Fecha:** 4 de febrero de 2026

## 🎯 Objetivo

Verificar que el campo `external_reference` está siendo usado correctamente para identificar operaciones de pago vinculadas a tus órdenes.

---

## 📋 Qué Verificar

| Paso | Verificación                    | Esperado                     |
| ---- | ------------------------------- | ---------------------------- |
| 1    | Orden creada en BD              | UUID único generado          |
| 2    | External reference enviado a MP | Mismo UUID que orden         |
| 3    | Pago completado en MP           | Status: approved             |
| 4    | Webhook recibido                | external_reference presente  |
| 5    | Orden actualizada               | Status: approved             |
| 6    | Payment log guardado            | external_reference vinculado |

---

## ✅ VERIFICACIÓN 1: Orden Creada

### En la BD (Supabase)

1. **Abre Supabase Dashboard:** https://app.supabase.com
2. **Tabla:** `public` → `orders`
3. **Busca la orden más reciente**

Debes ver:

```
id (PK)              : 550e8400-e29b-41d4-a716-446655440000
external_reference   : 550e8400-e29b-41d4-a716-446655440000  ← Igual al id
customer_email       : usuario@email.com
customer_name        : Juan Pérez
total_amount         : 15000.00
status              : pending
preference_id        : (vacío inicialmente)
created_at          : 2026-02-04T10:30:00Z
```

✅ **Éxito:** El `external_reference` es igual al `id` (UUID único)

---

## ✅ VERIFICACIÓN 2: External Reference en Preferencia MP

### En los Logs del Dev Server

Cuando se crea la preferencia, debes ver:

```
[Webhook] Created preference:
{
  "items": [...],
  "payer": {
    "email": "usuario@email.com",
    "name": "Juan Pérez",
    "phone": { "number": "+54 9 11 1234-5678" }
  },
  "back_urls": {...},
  "auto_return": "approved",
  "external_reference": "550e8400-e29b-41d4-a716-446655440000",  ← VERIFICAR
  "notification_url": "https://...",
  "payment_methods": {...}
}
```

✅ **Éxito:** `external_reference` está presente en la preferencia

---

## ✅ VERIFICACIÓN 3: Pago Completado

### En Mercado Pago Dashboard

1. **Ve a:** https://www.mercadopago.com.ar/developers/sales
2. **Busca el pago más reciente**
3. **Haz clic para ver detalles**

Debes ver:

```
Payment ID          : 123456789
External Reference  : 550e8400-e29b-41d4-a716-446655440000  ← VERIFICAR
Status             : approved
Amount             : 15000.00
Payer Email        : usuario@email.com
Created            : 2026-02-04 10:35:00
```

✅ **Éxito:** El `external_reference` en MP coincide con el order_id

---

## ✅ VERIFICACIÓN 4: Webhook Recibido

### En los Logs del Dev Server

Después de completar el pago, debes ver:

```
[Webhook] Received event: type=payment, id=123456789
[Webhook] Payment log saved for payment 123456789, order 550e8400-e29b-41d4-a716-446655440000
[Webhook] Order 550e8400-e29b-41d4-a716-446655440000 updated to status: approved
[Webhook] Processed successfully in 245ms
```

✅ **Éxito:** El webhook incluye el `external_reference` correcto

---

## ✅ VERIFICACIÓN 5: Orden Actualizada

### En Supabase

**Query en SQL Editor:**

```sql
SELECT
  id,
  external_reference,
  status,
  preference_id,
  updated_at
FROM orders
WHERE external_reference = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**

```
id                  : 550e8400-e29b-41d4-a716-446655440000
external_reference  : 550e8400-e29b-41d4-a716-446655440000
status             : approved  ← Cambió de pending a approved
preference_id      : 12345678  ← Se guardó el ID de la preferencia
updated_at         : 2026-02-04T10:35:15Z  ← Más reciente que created_at
```

✅ **Éxito:** Orden actualizada con status approved

---

## ✅ VERIFICACIÓN 6: Payment Log Guardado

### En Supabase

**Tabla:** `public` → `payment_logs`

**Query:**

```sql
SELECT
  id,
  order_id,
  payment_id,
  external_reference,
  status,
  amount,
  created_at
FROM payment_logs
WHERE external_reference = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**

```
id                   : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
order_id            : 550e8400-e29b-41d4-a716-446655440000  ← Vinculado
payment_id          : 123456789
external_reference  : 550e8400-e29b-41d4-a716-446655440000  ← Igual al order_id
status             : approved
amount             : 15000.00
created_at         : 2026-02-04T10:35:10Z
```

✅ **Éxito:** Payment log creado y vinculado correctamente

---

## 🔍 Verificación Cruzada (Reconciliación)

### Todas las Órdenes con Sus Pagos

**Query en Supabase:**

```sql
SELECT
  o.id AS order_id,
  o.external_reference,
  o.customer_email,
  o.total_amount,
  o.status AS order_status,
  pl.payment_id,
  pl.status AS payment_status,
  pl.amount AS payment_amount,
  COUNT(pl.id) AS payment_count
FROM orders o
LEFT JOIN payment_logs pl
  ON o.external_reference = pl.external_reference
WHERE o.created_at > NOW() - INTERVAL '1 day'
GROUP BY o.id, pl.payment_id
ORDER BY o.created_at DESC;
```

**Resultado esperado:**

```
order_id                         | external_reference              | order_status | payment_status | payment_count
550e8400-e29b-41d4-a716-446655440000 | 550e8400-e29b-41d4-a716-446655440000 | approved     | approved       | 1
660e8400-e29b-41d4-a716-446655440001 | 660e8400-e29b-41d4-a716-446655440001 | pending      | NULL           | 0
```

✅ **Éxito:** Todas las órdenes están correctamente vinculadas con sus pagos

---

## 🔗 Verificación desde URLs de Retorno

### /checkout/success

**URL después de pago:**

```
http://localhost:3000/checkout/success?
  collection_id=123456789
  &collection_status=approved
  &payment_id=123456789
  &status=approved
  &external_reference=550e8400-e29b-41d4-a716-446655440000
  &preference_id=12345678
```

**Extrae:** `?external_reference=550e8400-e29b-41d4-a716-446655440000`

Este parámetro te permite validar en el cliente que el pago corresponde a la orden esperada.

---

## 📊 Tabla de Seguimiento

Crea esta tabla para monitorear todas tus compras:

```
Fecha       | Email           | Orden ID                         | External Ref                     | Monto   | Status   | Pago OK?
2026-02-04  | usuario@email   | 550e8400-e29b-41d4...           | 550e8400-e29b-41d4...           | $15000  | approved | ✅
2026-02-04  | otro@email      | 660e8400-e29b-41d4...           | 660e8400-e29b-41d4...           | $25000  | approved | ✅
```

---

## 🆘 Problemas Comunes

### ❌ External Reference no Coincide

**Síntoma:**

```
BD Order:     id = "550e8400-e29b-41d4-a716-446655440000"
MP Payment:   external_reference = "550e8400-e29b-41d4-a716-446655440999" ← DIFERENTE
```

**Causa:** No se pasó correctamente a MP

**Solución:**

1. Verificar que `createOrderWithItems()` retorna el orden_id correcto
2. Verificar que se pasa a la preferencia antes de crear en MP
3. Ver logs del endpoint create-preference

### ❌ Payment Log no Se Guarda

**Síntoma:**

```
Orden en BD:     ✅ approved
Payment logs:    ❌ Vacío
```

**Causa:** Error al guardar payment log

**Solución:**

1. Ver logs del webhook: `[Webhook] Error saving payment log:`
2. Verificar tabla `payment_logs` existe
3. Verificar que el order_id existe en `orders`

### ❌ Webhook No Recibe External Reference

**Síntoma:**

```
[Webhook] Error: external_reference is NULL
```

**Causa:** No se pasó external_reference en la preferencia

**Solución:**

1. Verificar línea ~110 en `create-preference/route.ts`
2. Confirmar: `external_reference: orderId,`
3. Reiniciar dev server

---

## ✅ Checklist Final

- [ ] Orden creada con UUID en BD
- [ ] External reference igual al order_id
- [ ] External reference enviado en preferencia a MP
- [ ] Pago completado en MP con external reference correcto
- [ ] Webhook recibido con external reference
- [ ] Orden actualizada a "approved"
- [ ] Payment log guardado con external reference
- [ ] Reconciliación verifica coincidencia de datos
- [ ] Urls de retorno incluyen external reference

---

## 🎯 Resultado Esperado

Si todo está bien, debes poder:

1. ✅ **Ver una orden** en BD con UUID
2. ✅ **Completar un pago** en MP con ese UUID como external_reference
3. ✅ **Recibir webhook** con ese UUID
4. ✅ **Ver actualizada la orden** a "approved"
5. ✅ **Ver payment log** vinculado a esa orden
6. ✅ **Reconciliar datos** entre tu BD y MP

---

## 📞 Siguiente Paso

Si todo funciona: ¡Estás listo para producción! 🚀

Si algo no funciona: Revisa el archivo [EXTERNAL_REFERENCE.md](./EXTERNAL_REFERENCE.md) para más detalles técnicos.
