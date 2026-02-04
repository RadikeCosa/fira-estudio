# Configuración de URLs de Retorno - Mercado Pago Checkout Pro

**Última actualización:** 4 de febrero de 2026

## 📋 Descripción

El atributo `back_urls` en la preferencia de Mercado Pago permite configurar direcciones a las que el comprador será redirigido después de completar el proceso de pago, según el resultado del mismo.

---

## 🔄 Flujo de Redirección

```
Comprador hace clic en "Ir a pagar" (en /checkout)
        ↓
Se crea la preferencia con back_urls
        ↓
Se redirige a Mercado Pago (init_point)
        ↓
Comprador completa el pago
        ↓
┌─────────────────────────────────────────────────────────┐
│ Mercado Pago redirige según resultado:                  │
├─────────────────────────────────────────────────────────┤
│ ✅ APROBADO → /checkout/success                         │
│ ❌ RECHAZADO → /checkout/failure                        │
│ ⏳ PENDIENTE → /checkout/pending                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Configuración Actual

### Variables de Entorno Necesarias

Todas las URLs deben configurarse como **variables de entorno públicas** (prefijo `NEXT_PUBLIC_`):

```env
# .env.local o .env.production

# URL cuando el pago es aprobado
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=https://tu-dominio.com/checkout/success

# URL cuando el pago es rechazado
NEXT_PUBLIC_CHECKOUT_FAILURE_URL=https://tu-dominio.com/checkout/failure

# URL cuando el pago queda pendiente (ej: transferencia bancaria)
NEXT_PUBLIC_CHECKOUT_PENDING_URL=https://tu-dominio.com/checkout/pending

# Webhook de Mercado Pago (para notificaciones del servidor)
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.com/api/checkout/webhook
```

### Implementación en el Endpoint

**Archivo:** [`app/api/checkout/create-preference/route.ts`](../app/api/checkout/create-preference/route.ts)

```typescript
const preference = {
  items,
  payer: {
    /* ... */
  },
  back_urls: {
    success: process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL!,
    failure: process.env.NEXT_PUBLIC_CHECKOUT_FAILURE_URL!,
    pending: process.env.NEXT_PUBLIC_CHECKOUT_PENDING_URL!,
  },
  auto_return: "approved", // Redirige automáticamente tras pago aprobado
  external_reference: orderId, // Identificador único de la orden
  notification_url: process.env.MERCADOPAGO_WEBHOOK_URL!,
  payment_methods: {
    /* ... */
  },
};
```

---

## 📄 Páginas de Retorno Implementadas

### 1. **Success** (`/checkout/success`)

**Ubicación:** `app/checkout/success/page.tsx`

**Qué ocurre:**

- Usuario completó el pago exitosamente
- Mercado Pago redirige automáticamente (por `auto_return: "approved"`)
- Se muestra mensaje de confirmación

**Elementos:**

- ✅ Ícono de check verde
- Mensaje: "¡Pago exitoso!"
- Información sobre próximos pasos
- Botones: "Seguir comprando" y "Volver al inicio"

**Flujo recomendado:**

```
1. Usuario ve confirmación
2. Recibe email con resumen (via webhook)
3. Puede ver su pedido (próxima feature: cuenta de usuario)
4. Vuelve a comprar o al inicio
```

### 2. **Failure** (`/checkout/failure`)

**Ubicación:** `app/checkout/failure/page.tsx`

**Qué ocurre:**

- El pago fue rechazado
- Mercado Pago redirige manualmente (usuario hace clic en volver)
- Se muestra mensaje explicativo

**Razones comunes de rechazo:**

- Fondos insuficientes
- Datos de tarjeta incorrectos
- Transacción bloqueada por banco/entidad
- Límites de compra excedidos

**Elementos:**

- ❌ Ícono de alerta rojo
- Mensaje: "Pago no completado"
- Sugerencias para resolver
- Botones: "Volver al carrito" y "Reintentar pago"

**Flujo recomendado:**

```
1. Usuario ve el error
2. Revisa datos de pago
3. Intenta de nuevo con otra tarjeta/método
4. Contacta soporte si persiste
```

### 3. **Pending** (`/checkout/pending`)

**Ubicación:** `app/checkout/pending/page.tsx`

**Qué ocurre:**

- El pago está en proceso de verificación
- Típicamente ocurre con transferencias bancarias, pagos por efectivo, etc.
- El estado se actualizará vía webhook

**Estados pendientes comunes:**

- Transferencia bancaria en proceso (24-48h)
- Pago en efectivo (efectivo en punto de venta)
- Validación del banco

**Elementos:**

- ⏳ Ícono de reloj amarillo
- Mensaje: "Pago pendiente"
- Explicación del estado
- Botones: "Contactar soporte" y "Volver al inicio"

**Flujo recomendado:**

```
1. Usuario ve que está en proceso
2. Recibe email cuando se confirme
3. Si no confirma en plazo, se cancela automáticamente
4. Puede contactar soporte para preguntar
```

---

## 🔐 Configuración por Entorno

### Desarrollo Local (localhost)

```env
# .env.local
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=http://localhost:3000/checkout/success
NEXT_PUBLIC_CHECKOUT_FAILURE_URL=http://localhost:3000/checkout/failure
NEXT_PUBLIC_CHECKOUT_PENDING_URL=http://localhost:3000/checkout/pending
MERCADOPAGO_WEBHOOK_URL=http://localhost:3000/api/checkout/webhook
```

**Nota:** Para webhooks en desarrollo, usar servicio como **ngrok** para tunelizar requests:

```bash
ngrok http 3000
# Copiar URL generada: https://abc123.ngrok.io/api/checkout/webhook
# Usar en MERCADOPAGO_WEBHOOK_URL
```

### Staging (pre-producción)

```env
# .env.staging
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=https://staging.tu-dominio.com/checkout/success
NEXT_PUBLIC_CHECKOUT_FAILURE_URL=https://staging.tu-dominio.com/checkout/failure
NEXT_PUBLIC_CHECKOUT_PENDING_URL=https://staging.tu-dominio.com/checkout/pending
MERCADOPAGO_WEBHOOK_URL=https://staging.tu-dominio.com/api/checkout/webhook
```

### Producción

```env
# .env.production (o en Vercel)
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=https://tu-dominio.com/checkout/success
NEXT_PUBLIC_CHECKOUT_FAILURE_URL=https://tu-dominio.com/checkout/failure
NEXT_PUBLIC_CHECKOUT_PENDING_URL=https://tu-dominio.com/checkout/pending
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.com/api/checkout/webhook
```

---

## 🔗 Parámetros de Query Disponibles

Mercado Pago puede agregar parámetros a las URLs de retorno. Aunque la implementación actual no los usa, están disponibles:

```
/checkout/success?
  collection_id=123456789         # ID único de la colección (pago)
  collection_status=approved      # Estado: approved, pending, rejected
  payment_id=123456789            # ID del pago en Mercado Pago
  status=approved                 # Estado del pago
  external_reference=order-123    # Tu order_id (external_reference)
  preference_id=12345678          # ID de la preferencia
```

**Uso en componentes:**

```typescript
// En las páginas de retorno puedes leer estos parámetros
const searchParams = await props.searchParams;
const collectionId = searchParams.collection_id;
const paymentId = searchParams.payment_id;

// Luego validar contra la BD (verificar que el pago existe)
const payment = await CartRepository.getPaymentLogByPaymentId(paymentId);
```

---

## 📊 Flujo Completo de Pagos

### Happy Path (Pago Aprobado)

```
1. Usuario en /checkout completa el formulario
2. Se crea preferencia en MP con back_urls
3. Se redirige a MP (init_point)
4. Usuario selecciona método de pago
5. Usuario completa el pago ✅
6. MP redirige a /checkout/success (auto_return)
7. Se muestra confirmación
8. Webhook actualiza estado a "completed"
9. Email de confirmación enviado
```

### Unhappy Path (Pago Rechazado)

```
1. Usuario en /checkout completa el formulario
2. Se crea preferencia en MP con back_urls
3. Se redirige a MP (init_point)
4. Usuario selecciona método de pago
5. Pago es rechazado ❌
6. Usuario ve pantalla de error en MP
7. Usuario hace clic "Volver a mi sitio"
8. MP redirige a /checkout/failure
9. Se muestra mensaje de error
10. Usuario puede volver al carrito o reintentar
11. Webhook registra el rechazo
12. Orden queda con estado "rejected" o "cancelled"
```

### Neutral Path (Pago Pendiente)

```
1. Usuario en /checkout completa el formulario
2. Se crea preferencia en MP con back_urls
3. Se redirige a MP (init_point)
4. Usuario selecciona método (ej: transferencia)
5. Pago queda pendiente ⏳
6. MP redirige a /checkout/pending
7. Se muestra mensaje explicativo
8. Usuario recibe instrucciones por email
9. Webhook monitorea estado
10. Cuando se confirme o cancele, se actualiza orden
```

---

## ✅ Checklist de Implementación

- [x] URLs configuradas como variables de entorno públicas
- [x] Endpoint `create-preference` incluye `back_urls`
- [x] `auto_return: "approved"` para redirección automática
- [x] `external_reference: orderId` para tracking
- [x] Página `/checkout/success` implementada
- [x] Página `/checkout/failure` implementada
- [x] Página `/checkout/pending` implementada
- [x] Webhook en `/api/checkout/webhook` escucha eventos
- [x] `.env.example` documentado
- [ ] Variables de entorno configuradas en Vercel (próximo paso)
- [ ] Webhook URL configurada en dashboard de Mercado Pago (próximo paso)

---

## 🚀 Próximos Pasos

### Para Vercel (Producción)

1. **Ir a tu proyecto en Vercel**
2. **Proyecto Settings → Environment Variables**
3. **Agregar las siguientes variables:**
   - `NEXT_PUBLIC_CHECKOUT_SUCCESS_URL`
   - `NEXT_PUBLIC_CHECKOUT_FAILURE_URL`
   - `NEXT_PUBLIC_CHECKOUT_PENDING_URL`
   - `MERCADOPAGO_WEBHOOK_URL`
   - `MERCADOPAGO_ACCESS_TOKEN`

### Para Mercado Pago Dashboard

1. **Ir a [Mercado Pago Developer Console](https://www.mercadopago.com.ar/developers)**
2. **Aplicaciones → Tu aplicación**
3. **Webhooks → Agregar webhook**
4. **URL:** `https://tu-dominio.com/api/checkout/webhook`
5. **Eventos:** Payments (payment.created, payment.updated)
6. **Guardar y probar**

---

## 🔍 Debugging

### Webhook no recibe eventos

**Posibles causas:**

- ❌ URL no accesible desde internet
- ❌ URL no configurada en dashboard de MP
- ❌ Access Token incorrecto
- ❌ Firewall bloqueando

**Soluciones:**

```bash
# 1. Verificar que el sitio es accesible
curl https://tu-dominio.com/api/checkout/webhook

# 2. Usar ngrok para testing local
ngrok http 3000
# Copiar URL y ponerla en MERCADOPAGO_WEBHOOK_URL

# 3. Revisar logs de Mercado Pago
# → Dashboard → Webhooks → Ver intentos
```

### Usuario ve página en blanco

**Causas:**

- Variables de entorno faltantes
- Error 500 en servidor
- URL no válida

**Soluciones:**

```bash
# Verificar variables en servidor
console.log(process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL)

# Ver logs en Vercel
vercel logs --function

# Probar localmente antes de deploy
npm run dev
```

---

## 📚 Referencias

- [Mercado Pago Checkout Pro - Back URLs](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/integrate-preferences-create#back_urls)
- [Mercado Pago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/webhooks/overview)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🎯 Resumen

✅ **URLs de retorno configuradas:** 3 escenarios (success/failure/pending)  
✅ **Redirección automática:** `auto_return: "approved"`  
✅ **Tracking:** `external_reference: orderId`  
✅ **Webhooks:** Escuchando eventos en `/api/checkout/webhook`  
✅ **Documentación:** Variables de entorno en `.env.example`

**Próximo paso:** Configurar variables en Vercel y URL de webhook en Mercado Pago
