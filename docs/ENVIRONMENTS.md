# Guia de entornos

Esta guia define como documentar y pensar los entornos del proyecto sin asumir estados operativos que no pueden verificarse solo desde el repositorio.

## Resumen

| Entorno | Uso esperado | Fuente de variables | Estado verificable desde repo |
| --- | --- | --- | --- |
| `local` | desarrollo | `.env.local` | si |
| `preview` | validacion en Vercel Preview | Vercel | no |
| `production` | despliegue publico principal | Vercel | no |

## Local

Se usa para desarrollo en `http://localhost:3000`.

Setup minimo:

```bash
cp .env.local.example .env.local
npm run dev
```

Comandos verificables desde `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Preview

Se asume un flujo de deploy en Vercel Preview para ramas no productivas, pero los detalles exactos de:

- nombres de ramas activas;
- URLs publicas vigentes;
- configuracion de autenticacion;
- variables cargadas;
- estado de maintenance mode;

quedan `pendiente de confirmar`.

## Production

Se asume un despliegue principal en Vercel, pero cualquier afirmacion sobre:

- URL final en uso;
- maintenance mode activo o inactivo;
- credenciales de Mercado Pago;
- estado del checkout;
- configuracion efectiva de analytics;

queda `pendiente de confirmar` si no surge del codigo versionado.

## Variables de entorno

Plantilla versionada:

- `.env.local.example`

Secretos que no deben versionarse:

- Mercado Pago
- `SUPABASE_SERVICE_ROLE_KEY`
- Resend
- tokens de reconciliacion, cola y status de webhooks
- cualquier secreto operacional de Vercel

## Reglas de documentacion

- No commitear `.env.local` ni otros `.env` reales.
- No documentar credenciales con valores concretos.
- Si una doc vieja afirma estados de Preview o Production como hechos, actualizarla o marcarla `pendiente de confirmar`.
- Si una variable existe en el codigo pero no en los templates o docs, registrar el gap antes de tocar comportamiento.
