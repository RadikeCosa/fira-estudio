# Seguridad del Webhook de Mercado Pago

## 📋 Resumen de Cambios

Se han implementado dos capas de seguridad críticas en el webhook de Mercado Pago:

### 1. Validación de Firma (HMAC-SHA256)

- **Archivo**: `lib/mercadopago/webhook-security.ts`
- **Función**: `validateWebhookSignature()`
- **Header requerido**: `x-signature`
- **Formato**: `ts=timestamp;v1=signature`
- **Algoritmo**: HMAC-SHA256
- **Protección**: Valida que el webhook fue enviado por Mercado Pago y no fue modificado

### 2. Validación de IP Origen

- **Función**: `validateMercadoPagoIP()`
- **IPs autorizadas**: Rangos de Mercado Pago (CIDR notation)
- **Desarrollo**: Permite localhost/127.0.0.1
- **Producción**: Solo acepta IPs de Mercado Pago
- **Protección**: Previene que atacantes externos envíen webhooks falsos

---

## 🔧 Configuración Requerida

### Variables de Entorno

Agregar a `.env.local` y `.env.production`:

```bash
# Webhook Secret obtenido de Mercado Pago Dashboard
# https://www.mercadopago.com.ar/developers/panel
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here

# Token de acceso de Mercado Pago (ya debe existir)
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here

# Integrator ID (opcional pero recomendado)
MERCADOPAGO_INTEGRATOR_ID=your_integrator_id_here
```

### Cómo Obtener el Webhook Secret

1. Ir a [Mercado Pago Developers Panel](https://www.mercadopago.com.ar/developers/panel)
2. Navegar a **Settings** → **Webhooks**
3. Crear o editar tu webhook:
   - URL: `https://tu-dominio.com/api/checkout/webhook`
   - Eventos: `payment.created`, `payment.updated`
4. Copiar el **Signing Secret** (clave para firmar webhooks)
5. Asignar a `MERCADOPAGO_WEBHOOK_SECRET`

---

## 🛡️ Cómo Funciona

### Validación de Firma

Mercado Pago envía cada webhook con:

- Header `x-signature`: `ts=1645678900;v1=abcdef...`
- El timestamp (`ts`) y la firma (`v1`) se regeneran para cada webhook

El servidor:

1. Extrae `ts` y `v1` del header
2. Reconstruye el payload: `id={paymentId};type=payment;ts={ts}`
3. Calcula HMAC-SHA256 con el webhook secret
4. Compara con seguridad contra timing attacks
5. Valida que el timestamp no sea más antiguo que 5 minutos

```typescript
// Ejemplo de cálculo de firma
const payload = `id=12345;type=payment;ts=1645678900`;
const signature = HMAC - SHA256(webhook_secret, payload);
// signature debe coincidir con v1 del header
```

### Validación de IP

Antes de procesar, verifica que la IP del cliente esté en rangos autorizados:

- Desarrollo: `127.0.0.1`, `localhost`
- Producción: Rangos CIDR de Mercado Pago

---

## ✅ Testing en Desarrollo

### 1. Simular Webhook Correcto

```bash
# Obtener timestamp actual (segundos)
TS=$(date +%s)

# Calcular firma (requiere webhook_secret)
WEBHOOK_SECRET="test-secret"
PAYLOAD="id=12345;type=payment;ts=$TS"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

# Enviar request
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "x-signature: ts=$TS;v1=$SIGNATURE" \
  -H "x-forwarded-for: 127.0.0.1" \
  -H "Content-Type: application/json" \
  -d '{"id": 12345, "type": "payment"}'
```

### 2. Testing con Node.js

```typescript
import { createHmac } from "crypto";

const webhookSecret = "test-secret";
const paymentId = 12345;
const ts = Math.floor(Date.now() / 1000);
const payload = `id=${paymentId};type=payment;ts=${ts}`;

const signature = createHmac("sha256", webhookSecret)
  .update(payload)
  .digest("hex");

const xSignature = `ts=${ts};v1=${signature}`;
console.log("x-signature header:", xSignature);
```

### 3. Casos de Error Esperados

```bash
# IP no autorizada
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "x-signature: ts=1645678900;v1=abcdef" \
  -H "x-forwarded-for: 192.168.1.100" \
  -d '{"id": 12345, "type": "payment"}'
# Respuesta: 403 Unauthorized IP

# Firma inválida
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "x-signature: ts=1645678900;v1=invalid" \
  -H "x-forwarded-for: 127.0.0.1" \
  -d '{"id": 12345, "type": "payment"}'
# Respuesta: 401 Invalid signature

# Timestamp antiguo (>5 min)
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "x-signature: ts=1645000000;v1=abcdef" \
  -H "x-forwarded-for: 127.0.0.1" \
  -d '{"id": 12345, "type": "payment"}'
# Respuesta: 401 Invalid signature
```

---

## 🚀 Deploying en Vercel

### 1. Configurar Variables de Entorno

En el dashboard de Vercel (Settings → Environment Variables):

```
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_INTEGRATOR_ID=your_integrator_id (opcional)
```

### 2. Configurar Webhook en Mercado Pago

1. URL: `https://tu-app.vercel.app/api/checkout/webhook`
2. Eventos: `payment.created`, `payment.updated`
3. Asegurarse de tener el Signing Secret actualizado

### 3. Pruebas en Staging

Mercado Pago permite crear webhooks diferentes para:

- **Sandbox** (pruebas): URL staging + secret de sandbox
- **Production** (real): URL production + secret de producción

---

## ⚠️ Notas Importantes

### Timestamp en Producción

En producción, Mercado Pago envía el timestamp (`ts`) en el header `x-signature`.
El código actual usa `x-request-id` como fallback, pero **debería extraerse de la firma**.

**TODO**: Actualizar extracción de timestamp del header x-signature:

```typescript
// Actualmente:
const xTimestamp = req.headers.get("x-request-id") || String(Date.now());

// Debería ser:
const xTimestamp = signatureParts.ts; // extraído del parsing de x-signature
```

### IPs de Mercado Pago

Los rangos CIDR en `webhook-security.ts` pueden cambiar. Verificar periódicamente:

- [Mercado Pago Webhooks Documentation](https://www.mercadopago.com.ar/developers/es/docs/webhooks)
- IP whitelist en dashboard de MP

### Ventana de Timestamp

La validación actual permite una ventana de 5 minutos. Esto protege contra:

- Replay attacks antiguos
- Diferencias de reloj del servidor

---

## 📊 Flujo de Seguridad

```
Request from Mercado Pago
    ↓
[1] Extraer IP cliente (x-forwarded-for, cf-connecting-ip)
    ↓
[2] Validar IP ∈ {Mercado Pago IPs}  ←─ Si falla: 403 Unauthorized IP
    ↓
[3] Parsear JSON body
    ↓
[4] Extraer header x-signature
    ↓
[5] Parsear x-signature → ts, v1
    ↓
[6] Validar timestamp (ahora - ts) < 5 min  ←─ Si falla: 401 Invalid signature
    ↓
[7] Reconstruir payload: id={id};type=payment;ts={ts}
    ↓
[8] Calcular HMAC-SHA256(secret, payload)
    ↓
[9] Comparación timing-safe vs v1  ←─ Si falla: 401 Invalid signature
    ↓
[10] Procesamiento del webhook seguro
     ↓
     Continuar con lógica de negocios...
```

---

## 🔍 Monitoreo y Logs

Todos los eventos de seguridad se registran:

```log
[Webhook Security] Request from unauthorized IP: 192.168.1.100
[Webhook Security] Invalid webhook signature - possible tampering
[Webhook] Signature validated for payment 12345
```

Revisar logs en:

- **Local**: Console durante `npm run dev`
- **Vercel**: Functions → Logs
- **Sentry** (si está configurado): Errores de webhook

---

## 📚 Referencias

- [Mercado Pago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/webhooks)
- [Verificación de Webhooks](https://www.mercadopago.com.ar/developers/es/docs/webhooks/additional-info/verifying-webhooks)
- [HMAC-SHA256 en Node.js](https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key)
- [OWASP Webhook Security](https://owasp.org/www-community/attacks/Webhook_Attack)
