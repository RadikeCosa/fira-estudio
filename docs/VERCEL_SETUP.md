# Configuracion de variables en Vercel

Esta guia documenta que variables deben cargarse en Vercel sin exponer valores reales.

## Estado sensible

Historicamente este archivo incluyo valores reales o aparentemente reales para integraciones de pago.

- Esos valores fueron removidos del repositorio.
- Cualquier credencial previamente versionada debe tratarse como `requiere rotacion manual`.
- No reutilizar ejemplos viejos de este archivo como si siguieran siendo seguros.

## Pasos

1. Ir a Vercel Dashboard.
2. Seleccionar el proyecto correspondiente a `fira-estudio`.
3. Abrir `Settings` → `Environment Variables`.
4. Cargar variables por entorno con placeholders seguros como referencia.
5. Hacer redeploy despues de cambios en variables.

## Variables habituales

```bash
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-mercadopago-webhook-secret
MERCADOPAGO_INTEGRATOR_ID=your-mercadopago-integrator-id

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL="Fira Estudio <noreply@example.com>"

NEXT_PUBLIC_SITE_URL=https://your-public-site.example
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

WEBHOOK_RECONCILIATION_TOKEN=your-reconciliation-token
WEBHOOK_QUEUE_PROCESSOR_TOKEN=your-queue-token
WEBHOOK_STATUS_TOKEN=your-status-token
CRON_SECRET=your-cron-secret
```

`VERCEL_URL` se genera automaticamente en Vercel. Las URLs de checkout y webhook se resuelven desde `lib/config/urls.ts`.

## Verificacion sugerida

- Confirmar que las variables quedaron cargadas en el entorno correcto.
- Hacer redeploy sin asumir cache reutilizable si se cambiaron `NEXT_PUBLIC_*`.
- Validar checkout y webhook solo con credenciales seguras de prueba o con un procedimiento operacional confirmado fuera del repo.

## Troubleshooting

### Build fallido

- Revisar Build Logs en Vercel.
- Verificar que no falten variables requeridas.
- Corroborar que la documentacion local no este mencionando scripts inexistentes.

### Error de runtime

- Revisar Runtime Logs del deployment.
- Confirmar que las variables sensibles existan en el entorno correcto.

### Integracion de Mercado Pago falla

- Confirmar que las credenciales cargadas sean las esperadas para ese entorno.
- Confirmar fuera del repo la URL publica final antes de usarla como webhook o `back_url`.
