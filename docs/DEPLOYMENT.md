# Guia de deployment

Esta guia documenta el proceso esperado de deploy sin afirmar topologias o estados externos que no puedan verificarse solo desde el repo.

## Prevalidacion local

Antes de promover cambios que afecten la aplicacion:

```bash
npm run lint
npm run test
npm run build
```

No documentar comandos que no existan en `package.json`.

## Deploy esperado

- `preview`: despliegues de validacion en Vercel Preview.
- `production`: despliegue principal en Vercel.

La estrategia exacta de ramas, promociones y dominios publicos queda `pendiente de confirmar` fuera del repositorio.

## Cambios de variables de entorno

Si cambian variables:

1. Actualizarlas en Vercel.
2. Hacer redeploy del entorno afectado.
3. Considerar rebuild completo cuando cambien variables `NEXT_PUBLIC_*`.

## Rollback

Opciones tipicas:

- promover un deployment estable desde Vercel;
- revertir el cambio en Git y volver a desplegar.

El procedimiento operativo exacto depende de la configuracion real del proyecto en Vercel y queda `pendiente de confirmar`.

## Checklist de verificacion

- Build exitosa.
- Sin errores obvios en runtime logs.
- Variables requeridas presentes.
- Checkout y webhooks verificados solo mediante un procedimiento seguro y autorizado.

## Riesgos a tener en cuenta

- Checkout, pagos y webhooks son areas sensibles: cualquier cambio ahi requiere validacion mas estricta.
- La configuracion real de Preview y Production no debe asumirse solo por documentacion historica.
