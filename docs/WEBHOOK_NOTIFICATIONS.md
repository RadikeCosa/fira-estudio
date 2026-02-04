# Configuración de Notificaciones Webhook - Mercado Pago

**Última actualización:** 4 de febrero de 2026

## 📋 Descripción

Los Webhooks (o callbacks web) son notificaciones HTTP POST que Mercado Pago envía a tu servidor en tiempo real cuando ocurren eventos en el flujo de pagos. Permiten que tu aplicación reaccione inmediatamente a cambios de estado sin necesidad de polling.

---

## 🔄 Flujo de Webhooks

```
Comprador realiza una acción
        ↓
Mercado Pago procesa el evento
        ↓
MP envía HTTP POST a tu webhook
        ↓
Tu servidor procesa la notificación
        ↓
Actualiza base de datos (orden, estado, etc.)
        ↓
Responde con 200 OK
        ↓
MP registra como "entregado"
```

---

## 🛠️ Implementación Actual

### Endpoint Webhook

**Ubicación:** `app/api/checkout/webhook/route.ts`  
**Método:** POST  
**URL:** `https://tu-dominio.com/api/checkout/webhook`

### Eventos Escuchados

| Evento            | Descripción                      |
| ----------------- | -------------------------------- |
| `payment.created` | Un nuevo pago ha sido creado     |
| `payment.updated` | El estado de un pago ha cambiado |

### Características Implementadas

✅ **Idempotencia:**

- Detecta pagos duplicados
- No procesa dos veces el mismo evento
- Usa tabla `payment_logs` para tracking

✅ **Validación:**

- Verifica que el evento sea de tipo "payment"
- Valida `external_reference` (order_id)
- Obtiene datos completos del pago desde MP

✅ **Logging Detallado:**

- Timestamps de inicio/fin
- Duración de procesamiento
- IDs de pago y orden
- Stack traces en caso de error

✅ **Manejo de Errores:**

- Ignora eventos no-payment gracefully
- Log errors pero no falla por fallos de logging
- Reintenta si actualización de orden falla

### Mapeo de Estados

```typescript
Payment Status    →    Order Status
────────────────────────────────────
approved         →    approved ✅
pending          →    pending ⏳
rejected         →    rejected ❌
cancelled        →    rejected ❌
unknown          →    pending ⏳
```

---

## 🔧 Configuración del Webhook

### 1. Obtener la URL Pública

Tu webhook debe estar en una URL accesible desde internet:

**Desarrollo Local:**

```bash
# Opción 1: Usar ngrok
ngrok http 3000
# URL: https://abc123.ngrok.io/api/checkout/webhook

# Opción 2: Usar Vercel preview
# Automático si deployeas a Vercel
# URL: https://proyecto.vercel.app/api/checkout/webhook
```

**Producción:**

```
https://tu-dominio.com/api/checkout/webhook
```

### 2. Configurar en Mercado Pago Dashboard

**Pasos:**

1. **Ir a [Mercado Pago Developer Console](https://www.mercadopago.com.ar/developers)**

2. **Seleccionar tu aplicación**

3. **Ir a:** Settings → Webhooks

4. **Agregar nuevo webhook:**
   - **URL:** `https://tu-dominio.com/api/checkout/webhook`
   - **Eventos:** Seleccionar "Payments"
   - **Versión:** v1

5. **Guardar**

### 3. Configurar en Variables de Entorno

**`.env.local` (Desarrollo):**

```env
MERCADOPAGO_WEBHOOK_URL=https://abc123.ngrok.io/api/checkout/webhook
```

**Vercel (Producción):**

1. Ir a Project Settings → Environment Variables
2. Agregar: `MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.com/api/checkout/webhook`

---

## 📝 Estructura de Notificaciones

### Notificación Entrante (de MP a tu servidor)

```json
{
  "id": 123456789,
  "type": "payment",
  "live_mode": false,
  "user_id": 3160583787,
  "api_version": "v1"
}
```

### Qué Hace tu Webhook

1. **Recibe** el evento básico
2. **Valida** que sea un pago
3. **Obtiene** detalles completos del pago desde MP
4. **Verifica** idempotencia (payment_logs)
5. **Actualiza** estado de la orden
6. **Registra** el evento
7. **Responde** con 200 OK

### Respuesta que Envías (a MP)

```json
{
  "received": true,
  "payment_id": 123456789,
  "status": "approved",
  "external_reference": "order-456",
  "order_status": "approved",
  "duration_ms": 245
}
```

---

## 🔐 Seguridad

### Validación de Autenticidad

Para productción avanzada, puedes agregar firma:

```typescript
// Validar X-Signature header (opcional)
const signature = req.headers.get("x-signature");
const requestId = req.headers.get("x-request-id");

if (!verifySignature(signature, requestId, accessToken)) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}
```

### Best Practices

✅ **Siempre responder con 200 OK** - Incluso si hay error, responder rápido
✅ **Procesar asincronamente** - Queue los webhooks para procesamiento en background
✅ **Validar datos de MP** - Obtener info desde MP, no confiar solo en webhook
✅ **Logging detallado** - Para debugging en caso de problemas
✅ **Reintentos** - MP reintentar 3 veces si no recibe 200 OK
✅ **Idempotencia** - Manejar duplicados gracefully

---

## 📊 Tabla de Referencia: payment_logs

**Esquema:**

```sql
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,
  currency TEXT,
  amount NUMERIC,
  webhook_type TEXT,
  webhook_body JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Qué se guarda:**

- ID único del pago en MP
- Estado del pago (approved/pending/rejected)
- Detalles adicionales (reason_codes, etc.)
- Payload completo del webhook (para debugging)
- Timestamps para auditoría

---

## 🧪 Testing del Webhook

### Opción 1: Simular Desde Dashboard de MP

1. **Ir a:** Webhooks → Webhook que agregaste
2. **Ver intentos:** Historial de notificaciones
3. **Enviar test:** Botón "Enviar test"
4. **Verificar:** Ver el resultado en tu servidor

### Opción 2: Usar curl Local

```bash
# Terminal 1: Iniciar ngrok
ngrok http 3000

# Terminal 2: Iniciar dev server
npm run dev

# Terminal 3: Simular webhook
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456789,
    "type": "payment",
    "live_mode": false
  }'
```

### Opción 3: Usar MercadoPago MCP Tool

```bash
# Si tienes MCP server configurado
mcp_mercadochalla_simulate_webhook \
  --resource_id "123456789" \
  --topic "payment" \
  --callback_env_production false
```

---

## 🔍 Debugging

### Ver Logs en Desarrollo

```bash
# Terminal con dev server
npm run dev

# Verás logs como:
# [Webhook] Received event: type=payment, id=123456789
# [Webhook] Payment log saved for payment 123456789, order order-456
# [Webhook] Order order-456 updated to status: approved
# [Webhook] Processed successfully in 245ms
```

### Ver Logs en Producción (Vercel)

```bash
# Ver últimos logs
vercel logs --function api/checkout/webhook

# Ver logs en tiempo real
vercel logs --function api/checkout/webhook --follow
```

### Problemas Comunes

**❌ "Connection refused"**

- Webhook URL no es accesible
- Firewall bloqueando
- Solución: Usar ngrok en dev, verificar DNS en prod

**❌ "Timeout"**

- Tu servidor tarda mucho (>30s)
- Solución: Procesar async, queue en background

**❌ "Invalid signature"**

- Access Token incorrecto
- Solución: Verificar token en MP Dashboard

**❌ "Duplicate payment"**

- Payment ya procesado
- Solución: Sistema de idempotencia ya implementado ✅

---

## 📈 Eventos Disponibles

Mercado Pago puede enviar otros eventos (configurable en Dashboard):

| Evento                        | Descripción                 | Implementado |
| ----------------------------- | --------------------------- | ------------ |
| `payment.created`             | Pago creado                 | ✅           |
| `payment.updated`             | Pago actualizado            | ✅           |
| `payment.preapproval.created` | Preaprobación creada        | ❌           |
| `payment.preapproval.updated` | Preaprobación actualizada   | ❌           |
| `merchant_order.created`      | Orden comercial creada      | ❌           |
| `merchant_order.updated`      | Orden comercial actualizada | ❌           |

**Actual:** Solo se procesan `payment` events

---

## 🔄 Flujo Completo de un Pago con Webhook

```
1. Usuario en /checkout completa formulario
   ↓
2. Se crea preferencia con external_reference = order_id
   ↓
3. Se crea orden en BD con status = "pending"
   ↓
4. Usuario redirigido a Mercado Pago
   ↓
5. Usuario completa pago ✅
   ↓
6. Mercado Pago envía webhook:
   POST /api/checkout/webhook
   { id: 123456789, type: "payment" }
   ↓
7. Tu servidor:
   - Obtiene detalles del pago desde MP
   - Valida idempotencia (payment_logs)
   - Guarda payment_log
   - Actualiza orden a "approved"
   - Responde 200 OK
   ↓
8. MP registra webhook como "entregado"
   ↓
9. Usuario redirigido a /checkout/success (auto_return)
   ↓
10. Email de confirmación enviado (si implementas)
    ↓
11. Pedido listo para procesamiento
```

---

## ✅ Checklist de Configuración

- [x] Endpoint webhook implementado en `app/api/checkout/webhook/route.ts`
- [x] Idempotencia implementada con `payment_logs`
- [x] Validación de eventos
- [x] Logging detallado
- [x] Manejo de errores
- [x] Variables de entorno configuradas
- [ ] Webhook registrado en Mercado Pago Dashboard (próximo paso)
- [ ] Testeado con webhook real de MP (próximo paso)
- [ ] Monitoreo y alertas configuradas (próximo paso)

---

## 🚀 Próximos Pasos

### Inmediato

1. **Registrar webhook en MP Dashboard:**
   - URL: `https://tu-dominio.com/api/checkout/webhook`
   - Eventos: Payment

2. **Probar con webhook de test:**
   - Ir a Dashboard → Webhooks
   - Hacer clic en "Enviar test"
   - Verificar que recibe 200 OK

3. **Monitorear logs:**
   - Dev: Ver console.log del dev server
   - Prod: Usar `vercel logs`

### Futuro

- Implementar reintentos exponenciales
- Agregar firma de validación (X-Signature)
- Email notifications al confirmar pago
- Dashboard de órdenes para admin
- Reconciliación automática

---

## 📚 Referencias

- [Mercado Pago Webhooks Oficial](https://www.mercadopago.com.ar/developers/es/docs/webhooks/overview)
- [Notificaciones de Pagos](https://www.mercadopago.com.ar/developers/es/docs/webhooks/features)
- [Verificación de Firmas](https://www.mercadopago.com.ar/developers/es/docs/webhooks/verify-signature)
- [SDK NodeJS](https://github.com/mercadopago/sdk-nodejs)

---

## 🎯 Resumen

✅ **Webhook implementado:** Endpoint `/api/checkout/webhook`  
✅ **Idempotencia:** Sistema de `payment_logs`  
✅ **Validación:** Verifica authenticity de eventos  
✅ **Logging:** Detallado para debugging  
✅ **Errores:** Manejados gracefully

**Estado:** Listo para configurar en Mercado Pago Dashboard
