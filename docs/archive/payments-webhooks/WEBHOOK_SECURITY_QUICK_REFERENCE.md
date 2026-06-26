# 🔐 Webhook Security - Quick Reference

> Documento archivado.
> La referencia operativa vigente es [`../../WEBHOOK_SECURITY.md`](../../WEBHOOK_SECURITY.md).

## 📋 Checklist Pre-Deployment

```bash
# 1. Verificar que el secret está en .env.local
echo $MERCADOPAGO_WEBHOOK_SECRET

# 2. Ejecutar tests
npx vitest run lib/mercadopago/webhook-security.test.ts

# 3. Verificar que el webhook está implementado
grep -r "validateWebhookSignature" app/api/checkout/webhook/

# 4. Verificar imports
grep -r "webhook-security" app/api/

# 5. Ver logs en desarrollo
npm run dev
# Buscar: "[Webhook Security]" o "[Webhook]"
```

---

## 🔧 Configuración

### Mercado Pago Dashboard

1. **Settings** → **Webhooks**
2. **Crear webhook:**
   - **URL:** `https://tu-dominio.com/api/checkout/webhook`
   - **Eventos:** `payment.created`, `payment.updated`
3. **Copiar Signing Secret** → `MERCADOPAGO_WEBHOOK_SECRET`

### Vercel Environment Variables

```
Name: MERCADOPAGO_WEBHOOK_SECRET
Value: [Copiar del dashboard de MP]
```

---

## 🧪 Testing Local

### Test Rápido: Webhook Válido

```bash
TS=$(date +%s)
SECRET="tu-webhook-secret"
PAYLOAD="id=12345;type=payment;ts=$TS"
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "x-signature: ts=$TS;v1=$SIG" \
  -H "x-forwarded-for: 127.0.0.1" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"type":"payment"}'
```

### Esperado

```json
HTTP 200 OK
(O 200 si falla por razones de negocios, pero seguridad ✓)
```

---

## 🚨 Errores Comunes

| Error                           | Causa                                  | Solución                               |
| ------------------------------- | -------------------------------------- | -------------------------------------- |
| `403 Unauthorized IP`           | IP no está en rango permitido          | En desarrollo, debe ser `127.0.0.1`    |
| `401 Invalid signature`         | Secret incorrecto o payload modificado | Verificar `MERCADOPAGO_WEBHOOK_SECRET` |
| `401 Request timestamp too old` | Webhook es mayor a 5 minutos           | Verificar reloj del servidor           |
| `Missing x-signature header`    | Falta header de firma                  | Mercado Pago debe enviar el header     |

---

## 📊 Logs de Seguridad

### Búsqueda en Vercel

```
Functions → Logs → Search: "[Webhook Security]"
```

### Ejemplos de Log

```log
# ✓ Éxito
[Webhook] Signature validated for payment 12345
[Webhook] Payment log saved for payment 12345

# ✗ IP rechazada
[Webhook Security] Rejected request from IP: 192.168.1.100

# ✗ Firma inválida
[Webhook Security] Invalid webhook signature - possible tampering

# ✗ Timestamp antiguo
[Webhook Security] Request timestamp too old: 600s
```

---

## 🔑 Variables de Entorno

```bash
# Requerido
MERCADOPAGO_WEBHOOK_SECRET=mp_webhook_secret_xyz...

# Ya debe existir
MERCADOPAGO_ACCESS_TOKEN=prod_access_token_xyz...

# Opcional
MERCADOPAGO_INTEGRATOR_ID=integrator_id...
```

---

## 🎯 Archivos Clave

| Archivo                                    | Propósito               |
| ------------------------------------------ | ----------------------- |
| `lib/mercadopago/webhook-security.ts`      | Funciones de validación |
| `app/api/checkout/webhook/route.ts`        | Endpoint (modificado)   |
| `lib/mercadopago/webhook-security.test.ts` | Tests                   |
| `docs/WEBHOOK_SECURITY.md`                 | Guía completa           |

---

## ✅ Validaciones Implementadas

```typescript
// En orden de ejecución:

1. validateMercadoPagoIP(clientIP)
   → 403 si no autorizada

2. validateWebhookSignature(headers, body, id, ts)
   → 401 si inválida
   → Incluye: timestamp check, HMAC-SHA256, timing-safe compare

3. Procesar pago de forma segura
```

---

## 📞 Soporte

**Preguntas frecuentes:**

### ¿Por qué debo obtener un secret de Mercado Pago?

Mercado Pago usa el secret para firmar webhooks. Sin él, cualquiera podría enviar webhooks falsos.

### ¿Qué es HMAC-SHA256?

Algoritmo criptográfico que firma el mensaje. Solo quién conoce el secret puede crear firmas válidas.

### ¿Qué protege la validación de IP?

Incluso sin el secret, un atacante no podría enviar requests desde cualquier IP (en producción).

### ¿Qué es timing-safe?

Compara las firmas sin revelar en qué punto fallan, protegiendo contra timing attacks.

---

## 🚀 Deployment

### Antes de Deploy

- [ ] `MERCADOPAGO_WEBHOOK_SECRET` configurado en Vercel
- [ ] Webhook URL correcto en Mercado Pago Dashboard
- [ ] Tests pasando: `npx vitest run` ✓
- [ ] No hay errores de TypeScript: `npm run build`

### Post-Deploy

- [ ] Verificar logs en Vercel Functions
- [ ] Enviar pago de prueba en sandbox
- [ ] Verificar que el webhook se procesó (buscar logs)
- [ ] Revisar estado de la orden en base de datos

---

## 🔍 Monitoreo

### Métricas a Vigilar

- Tasa de webhooks rechazados (debe ser baja)
- Webhooks con timestamp antiguo (debug)
- Intentos desde IPs no autorizadas (alertar)
- Firmas inválidas (alertar - posible ataque)

### Setup en Sentry (Opcional)

```typescript
import * as Sentry from "@sentry/nextjs";

// Capturar eventos de seguridad
if (!isSignatureValid) {
  Sentry.captureException(new Error("Invalid webhook signature"), {
    level: "error",
  });
}
```

---

## 📚 Documentación Completa

- [WEBHOOK_SECURITY.md](./WEBHOOK_SECURITY.md) - Guía técnica
- [WEBHOOK_SECURITY.md](../../WEBHOOK_SECURITY.md) - Referencia vigente
- [WEBHOOK_SECURITY_VISUAL.md](./WEBHOOK_SECURITY_VISUAL.md) - Diagramas
- [WEBHOOK_SECURITY_SUMMARY.md](./WEBHOOK_SECURITY_SUMMARY.md) - Resumen ejecutivo

---

**Status**: ✅ Implementado y testeado (18/18 tests ✓)
