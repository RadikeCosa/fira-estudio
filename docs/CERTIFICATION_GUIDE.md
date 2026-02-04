# Guía de Certificación - Mercado Pago Checkout Pro

## 📋 Requisitos de Configuración

Este documento describe la configuración necesaria para realizar la certificación de integración con Mercado Pago Checkout Pro.

---

## 🛍️ Producto de Certificación

### Datos del Producto

| Campo           | Valor                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| **ID**          | 1001                                                                      |
| **Nombre**      | Dispositivo de tienda móvil de comercio electrónico                       |
| **Descripción** | Dispositivo de tienda móvil de comercio electrónico para testing de pagos |
| **SKU**         | 1001-STD                                                                  |
| **Cantidad**    | 1                                                                         |
| **Precio**      | ARS 3,999.00 (superior a USD 1)                                           |
| **Stock**       | 100 unidades                                                              |

**Nota:** El producto está preconfigurado en la base de datos. Para insertarlo, ejecuta:

```bash
# En Supabase SQL Editor, ejecuta:
-- Copiar contenido de sql-code/certification-product.sql
```

---

## 💳 Métodos de Pago - Configuración

### ✅ Configuración Actual (Correcta)

**Archivo:** `app/api/checkout/create-preference/route.ts` (línea 157-160)

```typescript
payment_methods: {
  excluded_payment_methods: [
    {
      id: "visa",
    },
  ],
  installments: 6,
},
```

### Requisitos Cumplidos

✅ **Exclusión de Visa:** Se excluye el pago con tarjeta Visa  
✅ **Máximo de cuotas:** Se permite máximo 6 cuotas con tarjeta de crédito  
✅ **Otros métodos:** Se permiten: MasterCard, Amex, Tarjetas de débito, Efectivo, Transferencia bancaria, etc.

---

## 🔗 URLs de Retorno (Back URLs)

### Configuración Actual

Las URLs están centralizadas en `lib/config/urls.ts`:

```typescript
export const CHECKOUT_URLS = {
  success: NEXT_PUBLIC_CHECKOUT_SUCCESS_URL || getFullUrl("checkout/success"),
  failure: NEXT_PUBLIC_CHECKOUT_FAILURE_URL || getFullUrl("checkout/failure"),
  pending: NEXT_PUBLIC_CHECKOUT_PENDING_URL || getFullUrl("checkout/pending"),
};
```

### ✅ Tres Escenarios Configurados

| Escenario          | URL                 | Archivo                         |
| ------------------ | ------------------- | ------------------------------- |
| **Pago Aprobado**  | `/checkout/success` | `app/checkout/success/page.tsx` |
| **Pago Rechazado** | `/checkout/failure` | `app/checkout/failure/page.tsx` |
| **Pago Pendiente** | `/checkout/pending` | `app/checkout/pending/page.tsx` |

**En producción**, las URLs completas serán:

- `https://fira-estudio.vercel.app/checkout/success`
- `https://fira-estudio.vercel.app/checkout/failure`
- `https://fira-estudio.vercel.app/checkout/pending`

---

## 🔐 External Reference (Identificación de Operaciones)

### Formato Actual

```typescript
external_reference: `${customerEmail}|${orderId}`;
```

### Ejemplo

Si haces una compra con:

- **Email:** ramirocosa@gmail.com
- **Order ID:** 550e8400-e29b-41d4-a716-446655440000

El external_reference será:

```
ramirocosa@gmail.com|550e8400-e29b-41d4-a716-446655440000
```

### Propósito

- **Identificar operaciones:** Mercado Pago incluirá este valor en cada pago y webhook
- **Vinculación:** Permite relacionar pagos con órdenes en tu sistema
- **Auditoría:** Facilita el seguimiento de transacciones

---

## 🧪 Pasos para Realizar la Compra de Certificación

### 1. Acceder a la tienda

```
https://tu-dominio.com/productos
```

### 2. Agregar producto al carrito

- Busca o navega hasta: **Dispositivo de tienda móvil de comercio electrónico**
- Selecciona tamaño y color
- Cantidad: **1**
- Click en **Agregar al carrito**

### 3. Ir a checkout

```
https://tu-dominio.com/checkout
```

### 4. Completar datos

- **Email:** ramirocosa@gmail.com
- **Nombre:** Ramiro Cosa (o tu nombre)
- **Teléfono:** Tu teléfono
- **Dirección:** Tu dirección

### 5. Ir a Mercado Pago

- Click en **Ir a pagar**
- Serás redirigido a `init_point` de Mercado Pago

### 6. Seleccionar método de pago

En Mercado Pago, selecciona uno de estos métodos (Visa estará excluido):

- **Tarjeta de crédito:** Mastercard, American Express, etc. (máximo 6 cuotas)
- **Tarjeta de débito**
- **Efectivo** (Rapipago, Pago Fácil)
- **Transferencia bancaria**
- **Billetera virtual** (Mercado Pago wallet)

### 7. Completar pago

- Usa credenciales de prueba de Mercado Pago
- Aprueba o rechaza el pago según necesites

### 8. Validar retorno

Serás redirigido a:

- `/checkout/success` → Si pago fue aprobado
- `/checkout/failure` → Si pago fue rechazado
- `/checkout/pending` → Si pago está pendiente

---

## 📊 Validación en Mercado Pago Dashboard

### 1. Verificar Pago Creado

**Dashboard:** https://www.mercadopago.com.ar/developers/panel

1. Ir a **Sales → Payments**
2. Buscar por `external_reference` (ramirocosa@gmail.com|...)
3. Verificar:
   - ✅ `status: approved` (o rechazado/pendiente)
   - ✅ `amount: 3999.00`
   - ✅ `external_reference` visible
   - ✅ `items` con detalles del producto

### 2. Verificar Preferencia

**Dashboard:** https://www.mercadopago.com.ar/developers/panel

1. Ir a **Webhooks**
2. Ver historial de notificaciones enviadas
3. Verificar que se recibió webhook con:
   - `resource: /v1/payments/{payment_id}`
   - `action: payment.created` o `payment.updated`

---

## 📝 Checklist de Certificación

- [ ] **Producto creado** (ID 1001, precio > USD 1)
- [ ] **Producto visible** en `/productos`
- [ ] **Carrito funciona** (puedo agregar producto)
- [ ] **Checkout funciona** (puedo completar datos)
- [ ] **Preferencia creada** con:
  - [ ] Items con descripción completa
  - [ ] Payer info (email, nombre, teléfono)
  - [ ] Back URLs (success, failure, pending)
  - [ ] External reference con email y order_id
  - [ ] Exclusión de Visa
  - [ ] Máximo 6 cuotas
  - [ ] Notification URL configurada
- [ ] **Redireccionamiento a MP** funciona
- [ ] **Pago completado** (aprobado/rechazado/pendiente)
- [ ] **Retorno correcto** a `/checkout/success|failure|pending`
- [ ] **Pago visible** en MP Dashboard
- [ ] **Webhook recibido** (ver en MP Webhooks)
- [ ] **Orden actualizada** en BD (status = approved/rejected/pending)

---

## 🔧 Variables de Entorno Requeridas

```bash
# En .env.local

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR_XXXXXXXXXXXXXXXXXXXX...
MERCADOPAGO_INTEGRATOR_ID=tu_integrator_id (opcional)

# URLs de Checkout (opcional, se usan defaults si no están)
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=https://tu-dominio.com/checkout/success
NEXT_PUBLIC_CHECKOUT_FAILURE_URL=https://tu-dominio.com/checkout/failure
NEXT_PUBLIC_CHECKOUT_PENDING_URL=https://tu-dominio.com/checkout/pending

# Site URL (auto-detectado en Vercel, necesario en otros deploys)
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# Webhook
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.com/api/checkout/webhook
```

---

## 🚀 Ejecución

### En Desarrollo Local

```bash
npm run dev
# http://localhost:3000

# Acceder a:
# - Productos: http://localhost:3000/productos
# - Checkout: http://localhost:3000/checkout
```

### En Producción (Vercel)

```bash
# Las URLs se detectan automáticamente desde VERCEL_URL
# Solo asegúrate de configurar webhooks en MP Dashboard:
# https://www.mercadopago.com.ar/developers/panel/webhooks
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Ver logs del dev server** (npm run dev)
2. **Buscar en Webhooks** de MP Dashboard
3. **Verificar BD** (Supabase) - orden debe estar creada
4. **Validar variables de entorno** (.env.local)

---

## ✅ Resumen de Configuración

| Requisito          | Estado            | Ubicación                                         |
| ------------------ | ----------------- | ------------------------------------------------- |
| Producto 1001      | ✅ Preconfigurado | BD - categorías/productos/variaciones             |
| Exclusión Visa     | ✅ Implementado   | `app/api/checkout/create-preference/route.ts:157` |
| Max 6 cuotas       | ✅ Implementado   | `app/api/checkout/create-preference/route.ts:160` |
| URLs de retorno    | ✅ Implementado   | `lib/config/urls.ts`                              |
| External reference | ✅ Implementado   | `app/api/checkout/create-preference/route.ts:155` |
| Webhook            | ✅ Implementado   | `app/api/checkout/webhook/route.ts`               |

**La certificación está lista para ejecutarse. Solo necesitas insertar el producto en la BD y hacer una compra de prueba.**
