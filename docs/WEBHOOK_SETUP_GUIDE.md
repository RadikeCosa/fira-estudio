# Guía Paso a Paso: Configurar Webhook en Mercado Pago

**Fecha:** 4 de febrero de 2026

## 📋 Resumen

Esta guía te permite configurar las notificaciones webhook de Mercado Pago para que tu aplicación reciba eventos en tiempo real cuando ocurren pagos.

---

## ✅ Requisitos Previos

- [ ] Acceso a [Mercado Pago Developer Console](https://www.mercadopago.com.ar/developers)
- [ ] Cuenta de seller en Mercado Pago
- [ ] URL pública de tu aplicación (Vercel, ngrok, etc.)
- [ ] Access Token de tu aplicación

---

## 🔗 PASO 1: Obtener tu URL Pública

### Opción A: Producción (Vercel)

Tu aplicación desplegada en Vercel:

```
https://tu-proyecto.vercel.app/api/checkout/webhook
```

### Opción B: Desarrollo (ngrok)

Para testing local:

```bash
# 1. Descargar e instalar ngrok (si no lo tienes)
# Desde: https://ngrok.com/download
# O con brew: brew install ngrok

# 2. En una terminal nueva, ejecutar:
ngrok http 3000

# 3. Verás output como:
# Forwarding https://abc123def.ngrok.io -> http://localhost:3000

# Tu URL webhook será:
# https://abc123def.ngrok.io/api/checkout/webhook
```

**Nota:** La URL cambia cada vez que reinicia ngrok (usa plan pro si quieres URL fija)

---

## 🚀 PASO 2: Ir a Mercado Pago Developer Console

1. **Abre:** https://www.mercadopago.com.ar/developers
2. **Inicia sesión** con tu cuenta de Mercado Pago
3. **Selecciona** tu aplicación en el menú

---

## 🔧 PASO 3: Acceder a Configuración de Webhooks

1. **En el panel izquierdo**, busca **"Settings"** o **"Configuración"**
2. **Haz clic en:** "Webhooks" o "Notificaciones"
3. Verás lista de webhooks existentes (puede estar vacía)

---

## ➕ PASO 4: Agregar Nuevo Webhook

### Opción: "Add a new webhook" o "Agregar nuevo webhook"

Completa los campos:

### Campo 1: URL

```
Pega tu URL:
https://tu-dominio.com/api/checkout/webhook
```

O en desarrollo:

```
https://abc123def.ngrok.io/api/checkout/webhook
```

### Campo 2: Eventos

Selecciona los eventos que quieres recibir:

✅ **SELECCIONAR:**

- `payment.created` ← Pago creado
- `payment.updated` ← Pago actualizado (cambio de estado)

❌ **NO NECESARIO POR AHORA:**

- `payment.preapproval.created`
- `payment.preapproval.updated`
- `merchant_order.created`
- `merchant_order.updated`

### Campo 3: Versión

Selecciona: **v1** (latest)

---

## 💾 PASO 5: Guardar

1. **Haz clic en:** "Save" o "Guardar"
2. Verás confirmación: "Webhook added successfully" o similar
3. Tu webhook aparecerá en la lista

---

## 🧪 PASO 6: Probar el Webhook

### Test desde Dashboard (Recomendado)

1. **En la lista de webhooks**, busca el que acabas de crear
2. **Haz clic en:** "Send test" o "Enviar prueba"
3. **Selecciona:**
   - Event type: `payment.updated`
   - Click "Send"

### Qué debe ocurrir:

**En tu servidor (logs):**

```
[Webhook] Received event: type=payment, id=123456789
[Webhook] Payment log saved for payment 123456789, order order-456
[Webhook] Order order-456 updated to status: approved
[Webhook] Processed successfully in 245ms
```

**En el dashboard de MP:**

```
✅ Status: Delivered (200 OK)
Time: 245ms
```

Si ves ❌ "Failed":

- Verifica que la URL es correcta
- Verifica que tu servidor está corriendo
- Verifica logs del servidor para errores

---

## 🔐 PASO 7: Verificar Configuración

### Ver Webhooks Registrados

1. **En Settings → Webhooks** verás tabla:
   | URL | Events | Status | Actions |
   |----|--------|--------|---------|
   | https://... | payment.created, payment.updated | Active | ... |

### Ver Intentos

1. **Haz clic en el webhook** de tu lista
2. Verás **"Recent Deliveries"** o **"Intentos Recientes"**
3. Podrás ver:
   - Timestamp
   - Evento
   - Status (200 OK, 500 Error, etc.)
   - Payload
   - Response

---

## 🔄 PASO 8: Configurar en Producción

Cuando estés listo para lanzar:

### Variables en Vercel

1. **Ve a:** Vercel Dashboard → Tu proyecto
2. **Settings → Environment Variables**
3. **Agregar:**
   ```
   Key: MERCADOPAGO_WEBHOOK_URL
   Value: https://tu-dominio-real.com/api/checkout/webhook
   ```
4. **Save & Deploy**

### Webhook en Mercado Pago

1. **Editar el webhook** que creaste
2. **Cambiar URL** de ngrok a producción:
   ```
   https://tu-dominio-real.com/api/checkout/webhook
   ```
3. **Save**

---

## 📊 Flujo Completo de Test

### Paso a Paso

1. **Dev server corriendo:** `npm run dev`
2. **ngrok corriendo:** `ngrok http 3000`
3. **Webhook registrado** en MP Dashboard
4. **Ir a:** http://localhost:3000
5. **Navegar a un producto** y **agregar al carrito**
6. **Ir a checkout** y **completar formulario**
7. **Hacer clic en "Ir a pagar"**
8. **En Mercado Pago, completar pago** con tarjeta de test:
   ```
   Tarjeta: 4235 6477 2456 6004
   Mes: 11
   Año: 25
   CVC: 123
   Titular: TEST
   DNI: 12345678
   ```
9. **Verás pantalla de confirmación** en MP
10. **MP enviará webhook** a tu servidor
11. **Verás logs en terminal** con "Processed successfully"
12. **Serás redirigido a** /checkout/success
13. **En MP Dashboard, verás** el webhook en "Recent Deliveries"

---

## 🆘 Troubleshooting

### ❌ "Connection refused"

**Causa:** URL no accesible o servidor no corriendo

**Soluciones:**

```bash
# 1. Verificar que dev server está corriendo
npm run dev

# 2. Verificar que ngrok está corriendo
ngrok http 3000

# 3. Probar URL en navegador
curl https://abc123.ngrok.io/api/checkout/webhook
# Debe dar error 405 (POST required), no "connection refused"
```

### ❌ "Timeout"

**Causa:** Servidor tarda más de 30 segundos

**Soluciones:**

- No hacer operaciones pesadas en webhook
- Procesar asincronamente (queue/background job)
- Responder rápido, procesar después

### ❌ "500 Internal Server Error"

**Causa:** Error en tu código

**Soluciones:**

```bash
# 1. Ver logs del dev server
npm run dev

# 2. Buscar errores como:
# "Error fetching payment from MP"
# "Error updating order status"

# 3. Verificar:
# - Access Token correcto
# - Tablas en BD existen
# - Permisos RLS
```

### ❌ "No recent deliveries"

**Causa:** Webhook no está recibiendo eventos

**Soluciones:**

1. Hacer test manual desde dashboard
2. Verificar URL en configuración
3. Verificar que los eventos están seleccionados
4. Esperar a que se realice un pago real

---

## 📈 Monitoreo

### Ver Logs en Desarrollo

```bash
# Terminal con dev server
npm run dev

# Buscar logs de webhook
# [Webhook] Received event: ...
```

### Ver Logs en Producción

```bash
# Ver últimos 100 logs
vercel logs

# Ver solo función webhook
vercel logs --function api/checkout/webhook

# Ver en tiempo real
vercel logs --function api/checkout/webhook --follow
```

### Dashboard de Mercado Pago

1. **Settings → Webhooks → Tu webhook**
2. **Ver "Recent Deliveries":**
   - Timestamp exacto
   - Event ID
   - Status code
   - Response body

---

## ✅ Checklist Final

- [ ] URL pública obtenida (ngrok o Vercel)
- [ ] Acceso a MP Developer Console
- [ ] Webhook registrado en MP Dashboard
- [ ] Eventos seleccionados (payment.created, payment.updated)
- [ ] Test ejecutado desde dashboard (✅ 200 OK)
- [ ] Logs verificados en tu servidor
- [ ] Variables de entorno configuradas
- [ ] URL en producción configurada

---

## 🎯 Siguiente Paso

Una vez confirmado que los webhooks funcionan:

1. **Realizar pago real de test** para validar todo el flujo
2. **Verificar** que orden pasa a "approved"
3. **Implementar** email de confirmación
4. **Configurar** monitoreo y alertas
5. **Documentar** procesos de debugging

---

## 💡 Tips

✅ **Mantén logs detallados** - Facilita debugging en producción  
✅ **Responde rápido** - MP tiene timeout de 30s  
✅ **Valida siempre** - Nunca confíes solo en webhook  
✅ **Usa idempotencia** - Maneja eventos duplicados  
✅ **Monitorea** - Alerts si webhooks fallan

---

**¿Necesitas ayuda?** Revisa el archivo [WEBHOOK_NOTIFICATIONS.md](./WEBHOOK_NOTIFICATIONS.md) para documentación técnica completa.
