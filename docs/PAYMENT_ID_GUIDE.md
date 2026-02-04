# Obtener Payment ID para Certificación de Mercado Pago

## 📍 ¿Dónde se encuentra el Payment ID?

El **Payment ID** es el identificador único que Mercado Pago asigna a cada pago. Se encuentra en:

### **Opción 1: Dashboard de Mercado Pago** (Recomendado)

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Selecciona tu aplicación
3. Ir a: **Sales → Payments**
4. Busca el pago por:
   - **external_reference:** `ramirocosa@gmail.com|...` (que viste en tu compra)
   - **Monto:** 3999.00 ARS
   - **Fecha:** de hoy

5. Haz clic en el pago → Se abre el detalle
6. **Allí verás el Payment ID** (número grande, ej: `123456789`)

---

### **Opción 2: En los Logs de tu Dev Server** (Si configuraste webhooks)

Cuando haces una compra y Mercado Pago envía la notificación webhook, verás en la consola:

```
[Webhook] Received event: type=payment, id=123456789
[Webhook] Payment status: approved
[Webhook] External reference: ramirocosa@gmail.com|550e8400-e29b-41d4-a716-446655440000
```

El número `123456789` es tu **Payment ID**.

---

### **Opción 3: En la URL de Retorno** (Mercado Pago pasa parámetros)

Cuando te redirige a `/checkout/success`, la URL podría tener parámetros como:

```
https://tu-dominio.com/checkout/success?
  collection_id=123456789        ← Este es el Payment ID
  collection_status=approved
  payment_id=123456789           ← También aquí
  external_reference=ramirocosa@gmail.com|...
```

---

## 🔍 Flujo Completo para Obtener el Payment ID

```
1. Haces compra en /checkout
   ↓
2. Mercado Pago procesa el pago
   ↓
3. Si es aprobado → Te redirige a /checkout/success
   ↓
4. Mercado Pago envía webhook a /api/checkout/webhook
   (aquí está el Payment ID)
   ↓
5. Consultas MP Dashboard
   ↓
6. Buscas por external_reference y copias el Payment ID
```

---

## 📋 Paso a Paso para Obtener tu Payment ID

### **Pasos que ya hiciste:**

✅ 1. Hiciste una compra con el Dispositivo de tienda móvil
✅ 2. Mercado Pago procesó el pago (dijeron "operación exitosa")
✅ 3. Fuiste redirigido a `/checkout/success` (esperemos que ahora funcione)

### **Pasos que falta hacer:**

**4. Ir a MP Dashboard a buscar el Payment ID**

```
1. Abre: https://www.mercadopago.com.ar/developers/panel
2. Click en tu aplicación
3. Sales → Payments
4. Busca por monto: 3999.00 ARS (o por fecha: hoy)
5. Click en el pago
6. En el detalle, verás: "Payment ID: 123456789"
7. **Copia este número**
```

**5. Compartir con Mercado Pago para validación**

En el proceso de certificación, Mercado Pago te pedirá compartir:

- El **Payment ID**
- El **external_reference** (ramirocosa@gmail.com|...)
- Que confirmes que el pago aparece en tu BD como "approved"

---

## 🔐 Información que Verás en MP Dashboard para Validación

Cuando abras el pago en el Dashboard, verás:

```json
{
  "id": 123456789,                          ← PAYMENT ID (compartir esto)
  "status": "approved",                     ← Estado
  "status_detail": "accredited",
  "money_release_date": "2026-02-06",
  "external_reference": "ramirocosa@gmail.com|550e...",  ← Tu referencia
  "amount": 3999.00,
  "currency_id": "ARS",
  "payer": {
    "id": 3160593713,
    "email": "ramirocosa@gmail.com",
    "name": "Ramiro Cosa"
  },
  "items": [
    {
      "title": "Dispositivo de tienda móvil de comercio electrónico",
      "unit_price": 3999.00,
      "quantity": 1,
      "description": "..."
    }
  ],
  "created_at": "2026-02-04T14:30:00Z"
}
```

**Todo esto es lo que necesitas para validar tu integración.**

---

## ✅ Checklist Final para Certificación

Después de completar la compra, verifica:

- [ ] **Payment ID obtenido** del Dashboard MP
- [ ] **External reference visible** en MP (debe incluir tu email)
- [ ] **Pago en estado aprobado** (o el estado que probaste)
- [ ] **Items con descripción correcta** en MP
- [ ] **Orden creada en tu BD** (estado = approved/rejected/pending)
- [ ] **Webhook recibido** (si tienes logs configurados)
- [ ] **Redireccionamiento funciona** (/checkout/success|failure|pending)

---

## 📌 Resumen

**Para obtener el Payment ID:**

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Sales → Payments
3. Busca tu pago (monto 3999 ARS)
4. Abre el detalle
5. **Copia el número del Payment ID**
6. **Comparte con Mercado Pago en el formulario de certificación**

¡Eso es todo lo que necesitas!
