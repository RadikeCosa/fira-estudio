# Workflow

El desarrollo de Fira Estudio usa ramas cortas, validacion local y despliegue controlado. No se adopta GitFlow completo.

## Principios

- `main` representa el estado estable y desplegable.
- No desarrollar features, fixes o saneamientos directamente sobre `main`.
- Cada incremento se trabaja en una rama aislada creada desde `main` actualizado.
- Los cambios deben ser pequenos, auditables y faciles de revertir.
- Separar cambios funcionales de saneamientos documentales.
- Codex u otros agentes no deben hacer commit, push, merge ni deploy salvo pedido explicito.

## Ramas

Convenciones:

- `feature/<descripcion>` para funcionalidad nueva.
- `fix/<descripcion>` para correcciones.
- `docs/<descripcion>` para cambios exclusivamente documentales.
- `chore/<descripcion>` para mantenimiento tecnico.

Usar nombres cortos, descriptivos y en kebab-case.

## Ciclo recomendado

```text
main actualizado
  -> rama de trabajo
  -> implementacion local
  -> validacion segun alcance
  -> revision del diff
  -> commit y push cuando el usuario lo pida
  -> Vercel Preview cuando aporte valor
  -> PR hacia main
  -> merge
  -> production
  -> smoke test
```

La configuracion efectiva de GitHub, Vercel, previews automaticos, dominios y variables queda `pendiente de confirmar` hasta verificarse fuera del repo.

## Validaciones

Tomar siempre los comandos desde `package.json`.

Para cambios de codigo, usar segun alcance:

```bash
npm run lint
npm run test
npm run build
```

Usar e2e cuando el cambio dependa de navegador real, navegacion, responsive, foco, accesibilidad interactiva o comportamiento visual importante:

```bash
npm run test:e2e
```

Para cambios exclusivamente documentales, revisar como minimo:

```bash
git diff --check
git status
```

## Reglas de seguridad

- No editar `.env` reales salvo pedido explicito.
- No exponer tokens, secrets, API keys ni IDs sensibles.
- No instalar dependencias ni modificar infraestructura externa sin autorizacion.
- No reactivar carrito, checkout, pagos, webhooks, ordenes ni emails transaccionales como parte de un cambio incidental.
