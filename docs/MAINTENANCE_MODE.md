# Modo mantenimiento

Este documento describe el uso vigente del maintenance mode. No define el alcance normal del producto.

El contrato de producto vigente esta en [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md).

## Que significa

Maintenance mode representa una interrupcion temporal del catalogo publico. Puede servir para mostrar un banner cuando el sitio o alguna parte visible requiere una pausa operativa.

No representa el estado normal sin checkout. Fira Estudio debe funcionar como catalogo sin activar maintenance mode.

## Que hace hoy el codigo

El codigo actual permite:

- mostrar un banner informativo con `NEXT_PUBLIC_MAINTENANCE_MODE=true`;
- personalizar el mensaje con `NEXT_PUBLIC_MAINTENANCE_MESSAGE`;

## Limites importantes

- Maintenance mode no debe usarse para comunicar que el e-commerce esta pausado.
- El catalogo debe poder desplegarse sin Mercado Pago, Resend, service role para carrito/ordenes ni tokens de webhook.
- Las flags historicas de checkout ya no forman parte del runtime vigente.

## Variables involucradas

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | activa o desactiva el banner |
| `NEXT_PUBLIC_MAINTENANCE_MESSAGE` | mensaje opcional para el banner |

## Activacion temporal

En el entorno que corresponda:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Estamos actualizando el catalogo.
```

Despues, hacer redeploy si el entorno lo requiere.

## Desactivacion

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

El catalogo deberia quedar operativo sin activar checkout.

## Consideraciones operativas

- No asumir desde esta doc si Preview o Production estan hoy en maintenance mode: queda `pendiente de confirmar`.
- Si se usa en Vercel, coordinarlo con variables por entorno y redeploy.
- Si cambia una variable `NEXT_PUBLIC_*`, tratarlo como cambio que requiere rebuild/redeploy.
- No usar maintenance mode para ocultar deuda funcional de comercio; el aislamiento de carrito, checkout y endpoints comerciales corresponde a una fase funcional posterior.

## Referencias

- `components/maintenance-banner.tsx`
- `lib/config/features.ts`
- [`VERCEL_SETUP.md`](./VERCEL_SETUP.md)
- material historico adicional: [`archive/maintenance-mode/`](./archive/maintenance-mode/)
