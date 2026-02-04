# Configurar Variables en Vercel Dashboard

## Pasos para Producción

### 1. Ir a Settings en Vercel

- https://vercel.com → Dashboard
- Selecciona tu proyecto `muma-estudio`
- Settings → Environment Variables

### 2. Agregar Variables Requeridas

Copia exactamente estas variables (cambia los valores por los reales):

#### Variable 1: MERCADOPAGO_ACCESS_TOKEN

- **Name**: `MERCADOPAGO_ACCESS_TOKEN`
- **Value**: `APP_USR-2041126739898991-012617-97a492e49f68b199a8724a914f712b4d-3160583787`
- **Environment**: Production, Preview, Development
- Click: **Save**

#### Variable 2: MERCADOPAGO_INTEGRATOR_ID

- **Name**: `MERCADOPAGO_INTEGRATOR_ID`
- **Value**: `dev_24c65fb163bf11ea96500242ac130004`
- **Environment**: Production, Preview, Development
- Click: **Save**

### 3. Verificar Configuración

Las siguientes variables se generan automáticamente (NO necesitas configurarlas):

- ✅ `VERCEL_URL` → Auto-generado por Vercel
- ✅ URLs de Checkout → Generadas automáticamente en `/lib/config/urls.ts`
- ✅ Webhook URL → Generada automáticamente

### 4. Redeploy

Después de agregar variables:

1. Ve a **Deployments**
2. Haz click en los 3 puntos del último deploy
3. **Redeploy**

O simplemente hace push:

```bash
git push origin feat/fase2
```

## Verificar que Funciona

1. Abre https://fira-estudio.vercel.app
2. Navega a: Productos → Agregar al carrito → Ir a Checkout
3. Llena el formulario y continúa a Mercado Pago
4. En DevTools (F12) → Network tab:
   - Busca `/api/checkout/create-preference`
   - Response debería mostrar:
     ```json
     {
       "back_urls": {
         "success": "https://fira-estudio.vercel.app/checkout/success",
         "failure": "https://fira-estudio.vercel.app/checkout/failure",
         "pending": "https://fira-estudio.vercel.app/checkout/pending"
       }
     }
     ```

## Para Testing sin Incógnito

Si necesitas probar sin modo incógnito en Vercel:

1. Inicia sesión en tu cuenta real en Mercado Pago
2. En el checkout, selecciona "Pagar con Tarjeta"
3. Usa tarjetas de prueba:
   - **Visa**: 4111 1111 1111 1111
   - **Master**: 5555 5555 5555 4444
   - Fecha: 12/25
   - CVV: 123

Las transacciones de prueba no se cobran realmente.

## Troubleshooting en Vercel

### Vercel Build falló

- Revisa los logs en Deployments
- Busca errores TypeScript
- Verifica que todos los imports están correctos

### 500 Error en Checkout

- Revisa Environment Variables están configuradas
- Revisa logs en Vercel Functions
- Verifica que MERCADOPAGO_ACCESS_TOKEN es correcto

### Mercado Pago retorna 400

- Verifica URLs en respuesta de `/api/checkout/create-preference`
- Asegúrate que URLs usan `https://` (no http://)
- Verifica que dominio es exacto: `fira-estudio.vercel.app`
