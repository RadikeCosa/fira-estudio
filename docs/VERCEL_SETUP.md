# Configuracion de variables en Vercel

Esta guia documenta la configuracion esperada para desplegar el catalogo de Fira Estudio en Vercel, sin exponer valores reales.

El contrato de producto vigente esta en [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md).

## Estado sensible

Historicamente la documentacion del repositorio incluyo valores reales o aparentemente reales para integraciones de pago.

- esos valores fueron removidos del material activo;
- cualquier credencial previamente versionada debe tratarse como `requiere rotacion manual`;
- no reutilizar ejemplos viejos como si siguieran siendo seguros;
- no cargar variables historicas de pagos por defecto para el catalogo.

Estado de proyecto Vercel, dominio, analytics y variables reales: `pendiente de confirmar`.

## Variables minimas del catalogo

Cargar por entorno:

```bash
NEXT_PUBLIC_SITE_URL=https://your-public-site.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

## Variables opcionales

Contacto:

```bash
NEXT_PUBLIC_CONTACT_EMAIL=contacto@example.com
NEXT_PUBLIC_WHATSAPP_NUMBER=549XXXXXXXXXX
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/firaestudio
```

El canal principal de consulta manual sigue `pendiente de confirmar`.

Analytics y mantenimiento:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Mensaje opcional
```

GA4 puede postergarse si no hay objetivo de medicion confirmado.

## Variables historicas que no deben cargarse por defecto

No son requisitos del deploy catalogo:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-mercadopago-webhook-secret
MERCADOPAGO_INTEGRATOR_ID=your-mercadopago-integrator-id
MERCADOPAGO_WEBHOOK_URL=https://your-public-site.example/api/checkout/webhook
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL="Fira Estudio <noreply@example.com>"
WEBHOOK_RECONCILIATION_TOKEN=your-reconciliation-token
WEBHOOK_QUEUE_PROCESSOR_TOKEN=your-queue-token
WEBHOOK_STATUS_TOKEN=your-status-token
CRON_SECRET=your-cron-secret
REVALIDATE_SECRET=your-revalidate-secret
```

Si en el futuro se decide reactivar comercio, estas variables deben revisarse en una auditoria especifica antes de cargarse.

## Redeploy

`VERCEL_URL` se genera automaticamente en Vercel.

Cuando cambian variables `NEXT_PUBLIC_*`:

- hacer redeploy del entorno afectado;
- asumir que el cambio no queda efectivo hasta nuevo build;
- no confiar en cambios de panel sin redeploy posterior.

## Checklist de Preview

- Variables minimas de catalogo cargadas.
- `NEXT_PUBLIC_SITE_URL` apunta a la URL esperada del preview o a la URL publica que se quiera validar.
- Contacto visible segun el canal definido o marcado `pendiente de confirmar`.
- Home, `/productos`, un detalle de producto y `/contacto` renderizan.
- No se presenta carrito, checkout ni pagos como parte del producto publico.
- Mercado Pago, Resend y tokens de webhook no son necesarios para validar el catalogo.

## Checklist de Production

- Dominio y URL final confirmados.
- Proyecto Vercel y entorno production confirmados.
- Variables minimas cargadas sin valores reales en documentacion.
- Supabase remoto, datos, Storage e imagenes confirmados fuera del repo.
- Canal de contacto manual confirmado.
- Analytics activo o postergado con decision explicita.
- Smoke tests publicos completados.
- Cualquier credencial historica versionada tratada como `requiere rotacion manual`.

## Troubleshooting

### Build fallido

- revisar Build Logs en Vercel;
- verificar variables minimas de catalogo;
- comparar contra los comandos reales de `package.json`;
- revisar drift entre entorno local y remoto.

### Error de runtime

- revisar Runtime Logs del deployment;
- confirmar Supabase remoto, datos y Storage;
- confirmar que `NEXT_PUBLIC_SITE_URL` coincida con el entorno;
- no cargar variables historicas de pagos como solucion rapida.

### Variables historicas de pagos

- no reutilizar variables viejas como parte del relanzamiento catalogo;
- no presentar Mercado Pago como proximo paso;
- si se requiere revisar comercio, abrir una auditoria especifica.
