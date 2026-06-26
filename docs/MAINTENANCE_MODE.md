# Modo mantenimiento

Este documento describe el uso vigente del maintenance mode sin asumir estados actuales de Preview o Production.

## Que hace

El maintenance mode permite:

- mantener el sitio navegable;
- mostrar un banner informativo;
- deshabilitar el checkout;
- evitar cambios de codigo para activar o desactivar el estado.

## Variables involucradas

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | activa o desactiva el banner |
| `NEXT_PUBLIC_CHECKOUT_ENABLED` | habilita o bloquea el checkout |
| `NEXT_PUBLIC_MAINTENANCE_MESSAGE` | mensaje opcional para el banner |

## Activacion

En el entorno que corresponda:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Mensaje opcional"
```

Despues, hacer redeploy si el entorno lo requiere.

## Desactivacion

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

## Consideraciones operativas

- No asumir desde esta doc si Production esta hoy en maintenance mode: eso queda `pendiente de confirmar`.
- Si se usa en Vercel, coordinarlo con la carga de variables por entorno y el redeploy correspondiente.
- Si se cambia solo `NEXT_PUBLIC_MAINTENANCE_MESSAGE`, tratarlo igual como cambio de variable publica.

## Referencias

- `components/maintenance-banner.tsx`
- `lib/config/features.ts`
- [`VERCEL_SETUP.md`](./VERCEL_SETUP.md)
- Material historico adicional: [`archive/maintenance-mode/`](./archive/maintenance-mode/)
