# Configuración de URLs por Entorno

## Resumen

El proyecto ahora tiene una configuración centralizada de URLs que detecta automáticamente el entorno (desarrollo/producción) y ajusta las URLs de Mercado Pago accordingly.

## Cómo Funciona

### Desarrollo Local (localhost)

Cuando ejecutas `npm run dev`, el sistema automáticamente:

- Detecta que `NODE_ENV === "development"`
- Usa `http://localhost:3000` como base
- Genera URLs:
  - Checkout Success: `http://localhost:3000/checkout/success`
  - Checkout Failure: `http://localhost:3000/checkout/failure`
  - Checkout Pending: `http://localhost:3000/checkout/pending`
  - Webhook: `http://localhost:3000/api/checkout/webhook`

### Producción Vercel

Cuando despliegos a Vercel:

- El sistema detecta `process.env.VERCEL_URL` automáticamente
- Usa `https://fira-estudio.vercel.app` como base
- Genera URLs:
  - Checkout Success: `https://fira-estudio.vercel.app/checkout/success`
  - Checkout Failure: `https://fira-estudio.vercel.app/checkout/failure`
  - Checkout Pending: `https://fira-estudio.vercel.app/checkout/pending`
  - Webhook: `https://fira-estudio.vercel.app/api/checkout/webhook`

## Variables de Entorno Requeridas

### En `.env.local` (Desarrollo)

```dotenv
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=http://localhost:3000/checkout/success
NEXT_PUBLIC_CHECKOUT_FAILURE_URL=http://localhost:3000/checkout/failure
NEXT_PUBLIC_CHECKOUT_PENDING_URL=http://localhost:3000/checkout/pending
MERCADOPAGO_WEBHOOK_URL=http://localhost:3000/api/checkout/webhook

MERCADOPAGO_ACCESS_TOKEN=APP_USR-... (tu token de Mercado Pago)
MERCADOPAGO_INTEGRATOR_ID=dev_... (tu ID de integrador)
```

### En Vercel Dashboard (Producción)

1. Ve a tu proyecto en https://vercel.com
2. Settings → Environment Variables
3. Agrega estas variables (sin valores de prueba):

```
MERCADOPAGO_ACCESS_TOKEN = [copiar de credentials.json]
MERCADOPAGO_INTEGRATOR_ID = dev_24c65fb163bf11ea96500242ac130004
```

**Nota:** Las URLs de checkout NO necesitas configurarlas en Vercel. Se generan automáticamente desde `VERCEL_URL`.

## Archivos Modificados

1. **lib/config/urls.ts** (NUEVO)
   - Centraliza la lógica de detección de entorno
   - Exporta: `CHECKOUT_URLS`, `WEBHOOK_URL`, `SITE_URL`
   - Detecta automáticamente: `VERCEL_URL`, `NEXT_PUBLIC_SITE_URL`, fallback a localhost

2. **app/api/checkout/create-preference/route.ts**
   - Usa `CHECKOUT_URLS` y `WEBHOOK_URL` del config centralizado
   - Eliminado código duplicado de determinación de baseUrl

3. **.env.local**
   - URLs comentadas para Vercel (como referencia)
   - Instrucciones claras sobre dónde configurar en Vercel

## Testing

### En Local

```bash
npm run dev
# Visita http://localhost:3000
# Abre Carrito → Ir a Checkout
# Verifica en consola que las URLs dicen http://localhost:3000
```

### En Vercel/Producción

Después de hacer push:

```bash
git add .
git commit -m "feat: centralize environment-specific URL configuration"
git push origin feat/fase2
```

Luego en Vercel:

1. Ir a Deployments
2. Esperar que termine de compilar
3. Visitar https://fira-estudio.vercel.app
4. Probar checkout
5. Verificar en Network tab que las URLs de Mercado Pago usan https://fira-estudio.vercel.app

## Troubleshooting

### "Error: Invalid success URL"

- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurado
- En desarrollo: asegúrate que `.env.local` está presente
- En Vercel: verifica Environment Variables en Settings

### URLs incorrectas en Mercado Pago

1. Abre DevTools → Network
2. Busca la solicitud a `/api/checkout/create-preference`
3. En Response, debería ver las URLs correctas según el entorno

### Webhook no recibe notificaciones

- En desarrollo: usa `ngrok http 3000` y actualiza `MERCADOPAGO_WEBHOOK_URL`
- En Vercel: webhook automáticamente es `https://fira-estudio.vercel.app/api/checkout/webhook`

## Configuración de Webhooks en Mercado Pago

1. Ve a https://www.mercadopago.com.ar/developers/panel/app
2. Tu aplicación
3. Webhooks
4. Agregar webhook:
   - **URL**: `https://fira-estudio.vercel.app/api/checkout/webhook`
   - **Tópicos**: `payment`

## Información Técnica

La detección de entorno usa este orden de prioridad:

```
1. process.env.VERCEL_URL (Vercel automático)
   ↓
2. process.env.NEXT_PUBLIC_SITE_URL (manual override)
   ↓
3. "http://localhost:3000" (default para desarrollo)
```

Esto garantiza que:

- ✅ Desarrollo local funciona automáticamente
- ✅ Producción en Vercel funciona automáticamente
- ✅ Otros despliegues pueden usar `NEXT_PUBLIC_SITE_URL` para override
