# Pagos y seguridad de webhooks

Este documento resume la parte operativa vigente de Mercado Pago y webhooks. La documentacion historica ampliada fue movida a [`archive/payments-webhooks/`](./archive/payments-webhooks/).

## Alcance

Aplica a:

- creacion de preferencias de pago;
- recepcion de webhooks de Mercado Pago;
- seguridad de firma e IP;
- cola y reconciliacion de eventos;
- variables operativas asociadas.

## Archivos clave

- `app/api/checkout/create-preference/route.ts`
- `app/api/checkout/webhook/route.ts`
- `app/api/webhooks/reconcile/route.ts`
- `app/api/webhooks/process-queue/route.ts`
- `app/api/webhooks/status/route.ts`
- `lib/mercadopago/client.ts`
- `lib/mercadopago/webhook-security.ts`
- `lib/webhooks/queue-processor.ts`
- `lib/webhooks/reconciliation-job.ts`

## Variables relacionadas

```bash
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-mercadopago-webhook-secret
MERCADOPAGO_INTEGRATOR_ID=your-mercadopago-integrator-id

WEBHOOK_RECONCILIATION_TOKEN=your-reconciliation-token
WEBHOOK_QUEUE_PROCESSOR_TOKEN=your-queue-token
WEBHOOK_STATUS_TOKEN=your-status-token
CRON_SECRET=your-cron-secret
```

No documentar ni versionar valores reales.

## Controles de seguridad vigentes

- validacion de firma `HMAC-SHA256`;
- validacion de IP de origen;
- respuesta controlada para evitar retries infinitos;
- cola de procesamiento con retries y reconciliacion;
- endpoints operativos protegidos por tokens dedicados.

## Consideraciones operativas

- La URL publica exacta del webhook queda `pendiente de confirmar` fuera del repo.
- Si se modifican credenciales o URLs, coordinar con `VERCEL_SETUP.md`.
- Si se revisa o ejecuta SQL relacionado con webhooks, usar como referencia `scripts/sql-code/README.md`.

## Testing y verificacion

- validar que las variables requeridas existan en el entorno;
- verificar logs del webhook y de la cola;
- usar solo credenciales seguras de prueba o un procedimiento operativo autorizado;
- evitar presentar como confirmados estados de Sandbox o Production que no surjan del repo.

## Documentacion relacionada

- [`ORDER_CONFIRMATION_EMAIL.md`](./ORDER_CONFIRMATION_EMAIL.md)
- [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md)
- [`VERCEL_SETUP.md`](./VERCEL_SETUP.md)
- [`../scripts/sql-code/README.md`](../scripts/sql-code/README.md)
- Material archivado: [`archive/payments-webhooks/`](./archive/payments-webhooks/)
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
