# Guia de deployment

Esta guia documenta el proceso esperado de deploy para el relanzamiento catalogo, sin afirmar topologias o estados externos que no puedan verificarse solo desde el repo.

## Estado tecnico actual

Hoy el proyecto quedo en condicion tecnica apta para un redeploy de catalogo:

- `npm run lint` pasa
- `npm run test` pasa
- `npm run build` pasa

Esto no confirma por si solo el estado del entorno remoto, pero si deja la base local lista para un precheck final de variables y smoke tests.

## Checklist previo al deploy

Antes de promover cambios que afecten la aplicacion:

```bash
npm run lint
npm run test
npm run build
```

No documentar comandos que no existan en `package.json`.

Ademas, para la etapa catalogo:

- confirmar si Supabase remoto ya esta reactivado;
- confirmar datos y rutas de imagenes;
- confirmar variables reales por entorno;
- confirmar canal de contacto, idealmente con `NEXT_PUBLIC_CONTACT_EMAIL` y/o `NEXT_PUBLIC_INSTAGRAM_URL`;
- confirmar que checkout siga deshabilitado publicamente con `NEXT_PUBLIC_CHECKOUT_ENABLED=false`;
- confirmar proyecto Vercel y dominio, ambos `pendiente de confirmar` hasta validacion externa.

## Deploy esperado

- `preview`: despliegues de validacion en Vercel Preview.
- `production`: futuro despliegue principal en Vercel.

La estrategia exacta de ramas, promociones y dominios publicos queda `pendiente de confirmar` fuera del repositorio.

## Variables minimas para catalogo

```bash
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_CHECKOUT_ENABLED=false
```

## Variables opcionales para contacto y analytics

```bash
NEXT_PUBLIC_CONTACT_EMAIL
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_MAINTENANCE_MODE
NEXT_PUBLIC_MAINTENANCE_MESSAGE
NEXT_PUBLIC_MAINTENANCE_END_DATE
NEXT_PUBLIC_CHECKOUT_ENABLED
```

Para una experiencia publica completa del modo catalogo, conviene cargar al menos `NEXT_PUBLIC_CONTACT_EMAIL` o `NEXT_PUBLIC_INSTAGRAM_URL`.
Search Console se prepara/configura en deploy. GA4 queda opcional y puede postergarse si todavia no hay un objetivo claro de medicion.

## Variables suspendidas que no deberian ser necesarias para catalogo

```bash
SUPABASE_SERVICE_ROLE_KEY
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_WEBHOOK_SECRET
MERCADOPAGO_INTEGRATOR_ID
MERCADOPAGO_WEBHOOK_URL
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL
NEXT_PUBLIC_CHECKOUT_FAILURE_URL
NEXT_PUBLIC_CHECKOUT_PENDING_URL
RESEND_API_KEY
RESEND_FROM_EMAIL
WEBHOOK_RECONCILIATION_TOKEN
WEBHOOK_QUEUE_PROCESSOR_TOKEN
WEBHOOK_STATUS_TOKEN
CRON_SECRET
REVALIDATE_SECRET
```

## Cambios de variables de entorno

Si cambian variables:

1. actualizarlas en Vercel;
2. hacer redeploy del entorno afectado;
3. considerar rebuild completo cuando cambien variables `NEXT_PUBLIC_*`.

## Rollback

Opciones tipicas:

- promover un deployment estable desde Vercel;
- revertir el cambio en Git y volver a desplegar.

El procedimiento operativo exacto depende de la configuracion real del proyecto en Vercel y queda `pendiente de confirmar`.

## Checklist de verificacion

- build exitosa;
- sin errores obvios en runtime logs;
- variables minimas de catalogo presentes;
- catalogo renderiza home, listado y detalle de producto;
- contacto visible segun el canal definido para esta etapa;
- no presentar carrito o checkout como parte del relanzamiento publico si el patch funcional de recorte aun no se aplico;
- checkout no debe iniciar compra online;
- `/carrito` y `/checkout` deben redirigir fuera del flujo publico;
- checkout y webhooks solo se revisan mediante un procedimiento seguro y autorizado.

## Smoke tests de catalogo

Despues de un futuro deploy listo para validar:

- abrir `/`
- abrir `/productos`
- abrir al menos un `/productos/[slug]`
- verificar imagenes de producto
- verificar metadata basica y sitemap
- verificar que el contenido de contacto visible coincida con lo configurado
- verificar que analytics y dominio sigan `pendiente de confirmar` si aun no fueron validados
- confirmar que `/api/checkout/create-preference` no inicie checkout si esta suspendido

## Riesgos a tener en cuenta

- checkout, pagos y webhooks son areas sensibles: cualquier cambio ahi requiere validacion mas estricta;
- `NEXT_PUBLIC_CHECKOUT_ENABLED=false` no alcanza por si solo para garantizar un relanzamiento sin compra online;
- para catalogo sin venta online hace falta recortar carrito y checkout del flujo publico en un patch funcional posterior;
- la configuracion real de Preview y Production no debe asumirse solo por documentacion historica.
