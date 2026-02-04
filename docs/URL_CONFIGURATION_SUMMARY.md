# ✅ Configuración de URLs por Entorno - COMPLETADO

## Resumen de Cambios

He configurado un sistema centralizado de URLs que automáticamente detecta el entorno (desarrollo/producción) y ajusta las URLs de Mercado Pago.

## Archivos Creados/Modificados

### 1. **lib/config/urls.ts** (NUEVO)

Archivo centralizado que exporta las URLs configuradas según el entorno:

```typescript
export const CHECKOUT_URLS = {
  success: "http://localhost:3000/checkout/success", // o https://fira-estudio.vercel.app/...
  failure: "http://localhost:3000/checkout/failure",
  pending: "http://localhost:3000/checkout/pending",
};

export const WEBHOOK_URL = "http://localhost:3000/api/checkout/webhook";
export const SITE_URL = "http://localhost:3000";
```

**Detección automática:**

- Si está en Vercel → Usa `VERCEL_URL` automáticamente
- Si está en local → Usa `http://localhost:3000`
- Si tienes `NEXT_PUBLIC_SITE_URL` → Lo usa como override

### 2. **app/api/checkout/create-preference/route.ts** (MODIFICADO)

Ahora usa la configuración centralizada:

```typescript
import { CHECKOUT_URLS, WEBHOOK_URL } from "@/lib/config/urls";

// Antes: código duplicado con lógica de detección
// Ahora: importa y usa directamente
const successUrl = CHECKOUT_URLS.success;
const webhookUrl = WEBHOOK_URL;
```

### 3. **.env.local** (MODIFICADO)

- Configuración para desarrollo local (localhost:3000)
- Instrucciones comentadas para Vercel
- Variables de Mercado Pago centralizadas

### 4. **docs/ENVIRONMENT_CONFIGURATION.md** (NUEVO)

Documentación técnica completa sobre:

- Cómo funciona la detección de entorno
- Variables necesarias en cada entorno
- Orden de prioridad de detección
- Troubleshooting

### 5. **docs/VERCEL_SETUP.md** (NUEVO)

Guía paso a paso para configurar Vercel:

- Cómo agregar variables en Vercel Dashboard
- Qué variables configurar (solo las secretas)
- Cómo verificar que funciona
- Testing sin modo incógnito

## Cómo Funciona

### En Desarrollo Local

```bash
npm run dev
# Las URLs automáticamente son:
# - Success: http://localhost:3000/checkout/success
# - Failure: http://localhost:3000/checkout/failure
# - Pending: http://localhost:3000/checkout/pending
# - Webhook: http://localhost:3000/api/checkout/webhook
```

### En Producción (Vercel)

```
El sistema automáticamente detecta https://fira-estudio.vercel.app
y genera:
# - Success: https://fira-estudio.vercel.app/checkout/success
# - Failure: https://fira-estudio.vercel.app/checkout/failure
# - Pending: https://fira-estudio.vercel.app/checkout/pending
# - Webhook: https://fira-estudio.vercel.app/api/checkout/webhook
```

## Variables de Entorno Requeridas

### En .env.local (desarrollo)

```dotenv
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_INTEGRATOR_ID=dev_...
# URLs se generan automáticamente
```

### En Vercel Dashboard (producción)

1. Settings → Environment Variables
2. Agrega:
   - `MERCADOPAGO_ACCESS_TOKEN` = tu token
   - `MERCADOPAGO_INTEGRATOR_ID` = dev_24c65fb163bf11ea96500242ac130004

**Nota importante:** No necesitas agregar variables de URLs en Vercel. Se generan automáticamente.

## Testing

### Local

```bash
npm run dev
# Ir a http://localhost:3000/productos
# Agregar al carrito
# Ir a checkout
# En DevTools → Network → crear-preference, ver que URLs usan localhost:3000
```

### Producción

```bash
git push origin feat/fase2
# Esperar que Vercel termine deployment
# Ir a https://fira-estudio.vercel.app/productos
# Agregar al carrito y probar checkout
# Las URLs automáticamente serán https://fira-estudio.vercel.app
```

## Beneficios

✅ **Automático** - No tienes que cambiar variables al cambiar de entorno
✅ **Centralizado** - Una sola fuente de verdad para las URLs
✅ **Flexible** - Soporta localhost, Vercel, y despliegues custom con `NEXT_PUBLIC_SITE_URL`
✅ **Sin errores** - Validación de URLs en la ruta de checkout

## Próximos Pasos

1. Hacer push a Vercel (ya hecho: `git push origin feat/fase2`)
2. Vercel detectará los cambios y hará rebuild automático
3. Ir a https://fira-estudio.vercel.app y probar checkout
4. Si hay problemas, revisar logs en Vercel Deployments

## Notas

- Las URLs locales usan `http://` (sin HTTPS)
- Las URLs en Vercel usa `https://` (HTTPS requerido por Mercado Pago)
- El sistema es "batteries included" - no necesitas configuration manual
- Logging automático en desarrollo mostrando qué URLs se está usando

¡Listo para probar! 🚀
