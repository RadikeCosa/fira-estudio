# AGENTS.md

## Proyecto

`fira-estudio` es un e-commerce construido con Next.js App Router para mostrar un catalogo de textiles artesanales, permitir agregar productos al carrito y completar un checkout integrado con Mercado Pago.

Este archivo es la guia canonica para agentes de codigo en este repositorio. Si una instruccion secundaria contradice el codigo real o este archivo, prevalecen el codigo real y este archivo.

## Stack principal

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Mercado Pago
- Resend + React Email
- Vercel
- Google Analytics 4
- Vitest + `node:test`

## Fuente de verdad

Usar este orden de prioridad al analizar o documentar el proyecto:

1. `package.json`, `next.config.ts`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.mjs`
2. Codigo ejecutable en `app/`, `components/`, `lib/`, `hooks/`
3. Documentacion del repositorio

Si una doc contradice el codigo, gana el codigo. La documentacion debe actualizarse para reflejar ese estado real.

## Comandos disponibles

Tomar siempre los comandos desde `package.json`. A la fecha de este archivo:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:node
npm run test:unit
npm run test:watch
npm run test:coverage
```

No documentar ni sugerir scripts inexistentes.

## Secretos y credenciales

- No exponer tokens, secrets, API keys ni IDs sensibles en docs, commits, issues o respuestas.
- No copiar valores reales a `.md`, ejemplos de `.env` ni comentarios de codigo.
- No editar `.env` reales salvo pedido explicito del usuario.
- Si se detecta una credencial versionada, reemplazarla por placeholders seguros en documentacion y marcarla como `requiere rotacion manual`.
- Asumir sensibles estas variables: Mercado Pago, Supabase service role, Resend, cron/webhook tokens y cualquier secreto de Vercel.

## Reglas para Mercado Pago

- Tratar checkout, webhooks y pagos como zonas sensibles.
- No cambiar comportamiento de checkout, pagos, webhooks o estados de orden sin aprobacion explicita.
- Mantener `lib/config/urls.ts` como fuente de verdad para URLs de checkout y webhook.
- No afirmar estados de produccion, credenciales o configuraciones de Mercado Pago que no puedan verificarse desde el repo.
- Si una mejora afecta pagos, exigir validacion adicional y documentar el riesgo.

## Reglas para Supabase

- Diferenciar claramente variables publicas (`NEXT_PUBLIC_*`) de secretos server-side (`SUPABASE_SERVICE_ROLE_KEY`).
- No mover logica sensible o acceso con privilegios al cliente.
- No documentar esquemas, tablas o flujos como definitivos si no estan respaldados por el codigo o scripts actuales.
- Si una doc menciona SQL o tablas historicas, verificar que existan en el arbol real antes de tratarlas como vigentes.

## Entornos

- `local`: desarrollo en `localhost`, usando `.env.local`.
- `preview`: despliegues de Vercel Preview. El detalle exacto de ramas, auth, URLs o variables queda sujeto a verificacion externa.
- `production`: despliegue publico esperado en Vercel. Cualquier estado operativo concreto debe marcarse como `pendiente de confirmar` si no surge del repo.

Nunca presentar staging o produccion como hechos confirmados solo por una doc historica.

## Testing y validacion

- Antes de cerrar cambios, validar como minimo que la documentacion siga alineada con `package.json` y los archivos reales.
- Si se toca documentacion de comandos, entornos o integraciones, revisar que no haya scripts inexistentes, paths rotos ni secretos visibles.
- Si un cambio futuro afecta checkout, webhooks, carrito o emails, priorizar tambien `npm run lint`, `npm run test` y `npm run build` cuando el alcance incluya codigo.

## Seguridad para checkout, webhooks y pagos

- No degradar validaciones de seguridad en webhook o checkout sin aprobacion explicita.
- No documentar flags de bypass como aptos para produccion.
- No cambiar semantica de ordenes, `external_reference`, URLs de retorno ni flujo de confirmacion de pagos sin revision especifica.
- Si hay drift entre instrucciones viejas y el codigo sensible actual, documentar el hallazgo antes de proponer cambios.

## Compatibilidad con Vercel

- Preservar compatibilidad con Vercel y App Router.
- No asumir servicios externos opcionales como configurados si el repo no lo prueba.
- Si una doc menciona pasos manuales de Vercel, deben quedar genericos y sin secretos reales.

## Estilo de cambio

- Preferir cambios pequenos, auditables y faciles de revertir.
- No mezclar saneamiento documental con cambios funcionales.
- Si una decision tecnica cambia el contrato del proyecto, actualizar la doc relevante en el mismo patch.
- Cuando algo no pueda confirmarse desde el repo, escribir `pendiente de confirmar`.
