# Pagos y seguridad de webhooks

> Archivo historico: describe una capa de Mercado Pago y webhooks retirada del arbol ejecutable principal. No usar como guia operativa vigente.

Este documento resume la capa sensible de Mercado Pago y webhooks que existia en el repo antes del reinicio como catalogo.

La documentacion historica ampliada esta en [`../../payments-webhooks/`](../../payments-webhooks/).

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
MERCADOPAGO_INTEGRATOR_ID=your-integrator-id

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

- la URL publica exacta del webhook queda `pendiente de confirmar` fuera del repo;
- si se modifican credenciales o URLs, coordinar con `VERCEL_SETUP.md`;
- si se revisa o ejecuta SQL relacionado con webhooks, usar como referencia `scripts/sql-code/README.md`;
- no reactivar esta capa sin autorizacion explicita.

## Testing y verificacion

- validar que las variables requeridas existan en el entorno;
- verificar logs del webhook y de la cola;
- usar solo credenciales seguras de prueba o un procedimiento operativo autorizado;
- evitar presentar como confirmados estados de Sandbox o Production que no surjan del repo.

## Resumen de flujo de validacion

Secuencia tecnica resumida de la capa vigente:

1. recibir request en `app/api/checkout/webhook/route.ts`
2. validar IP de origen si no hay bypass de debug
3. parsear body
4. extraer firma y datos necesarios
5. validar firma y consistencia del evento
6. recuperar datos del pago
7. encolar y procesar el evento de forma controlada

Los detalles extendidos, visuales y material de apoyo quedaron en `archive/payments-webhooks/`.

## Monitoreo y logs

Todos los eventos de seguridad deberian observarse en logs del entorno correspondiente.

Referencias de observacion:

- local: consola durante `npm run dev`
- Vercel: logs de funciones, `pendiente de confirmar`
- otras integraciones de observabilidad: `pendiente de confirmar`

## Documentacion relacionada

- [`../emails/ORDER_CONFIRMATION_EMAIL.md`](../emails/ORDER_CONFIRMATION_EMAIL.md)
- [`../testing/CHECKOUT_TESTING_STRATEGY.md`](../testing/CHECKOUT_TESTING_STRATEGY.md)
- [`../../../VERCEL_SETUP.md`](../../../VERCEL_SETUP.md)
- [`../../../../scripts/sql-code/README.md`](../../../../scripts/sql-code/README.md)
- material archivado: [`../../payments-webhooks/`](../../payments-webhooks/)

## Referencias

- [Mercado Pago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/webhooks)
- [Verificacion de Webhooks](https://www.mercadopago.com.ar/developers/es/docs/webhooks/additional-info/verifying-webhooks)
- [HMAC-SHA256 en Node.js](https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key)
- [OWASP Webhook Security](https://owasp.org/www-community/attacks/Webhook_Attack)
