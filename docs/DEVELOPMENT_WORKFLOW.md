# Flujo de desarrollo

Este documento define el flujo operativo de `fira-estudio` para un proyecto mantenido por un solo desarrollador.

El objetivo es tener ramas aisladas, validaciones claras y promociones seguras sin implementar GitFlow clasico completo.

## Principios

- `main` representa siempre el estado estable y desplegable.
- No desarrollar features, fixes o saneamientos directamente sobre `main`.
- Cada incremento se trabaja en una rama aislada creada desde `main` actualizado.
- Los cambios deben ser pequenos, auditables y faciles de revertir.
- El desarrollo y las primeras validaciones ocurren en local.
- Vercel Preview puede usarse para validar una rama antes de integrarla.
- Production debe provenir de codigo ya integrado y validado en `main`.
- Un experimento descartado en una rama de trabajo no debe afectar `main`.
- Codex u otros agentes no deben hacer commit, push, merge ni deploy salvo pedido explicito del usuario.

No se adopta una rama permanente `develop`. No se crean ramas `release/*` ni `hotfix/*` por defecto; pueden evaluarse en el futuro si aparece una necesidad concreta.

## Ramas

Convencion:

- `feature/<descripcion>`: funcionalidad nueva.
- `fix/<descripcion>`: correccion.
- `docs/<descripcion>`: cambios exclusivamente documentales.
- `chore/<descripcion>`: mantenimiento tecnico.

Usar nombres cortos, descriptivos y en kebab-case.

Ejemplo:

```text
feature/theme-switcher
```

Antes de crear una rama:

```bash
git status
git switch main
git pull
git switch -c feature/descripcion-corta
```

Si el working tree tiene cambios previos que no pertenecen al trabajo actual, no descartarlos ni hacer stash automatico. Resolver primero la situacion con una decision explicita.

## Ciclo de una feature

Flujo recomendado:

```text
main estable
   ->
crear rama de trabajo
   ->
implementacion local
   ->
tests especificos durante desarrollo
   ->
validacion completa correspondiente al alcance
   ->
revision del diff
   ->
commit
   ->
push de la rama
   ->
Vercel Preview / revision remota cuando corresponda
   ->
smoke test y revision visual/accesibilidad
   ->
PR hacia main cuando corresponda
   ->
merge
   ->
production
   ->
smoke test de production
```

Este flujo es la politica adoptada por el repositorio. La configuracion efectiva de GitHub y Vercel queda `pendiente de confirmar` hasta verificarse fuera del repo.

## Validaciones

Tomar comandos exclusivamente de `package.json`.

Para cambios normales de codigo, el cierre deberia incluir, cuando corresponda:

```bash
npm run lint
npm run test
npm run build
```

Usar tambien e2e cuando el cambio dependa de:

- comportamiento real de navegador;
- navegacion;
- responsive;
- foco;
- accesibilidad interactiva;
- persistencia del lado cliente;
- comportamiento visual importante.

Comando e2e vigente:

```bash
npm run test:e2e
```

Para cambios exclusivamente documentales no es necesario ejecutar suites de aplicacion si no aportan valor. Antes de pedir commit, revisar como minimo:

```bash
git diff --check
git status
```

Tambien resumir el diff para confirmar alcance y detectar cambios fuera de lugar.

## Preview

Preview es el entorno esperado para validar una rama antes de integrarla a `main`, especialmente cuando el cambio requiere:

- smoke tests;
- revision visual;
- responsive;
- accesibilidad;
- comportamiento real de navegador;
- variables o configuracion propias del entorno.

No asumir como hecho que Vercel genera Preview para cada rama ni que todas las variables estan cargadas. Esa configuracion externa debe verificarse y documentarse cuando exista certeza.

## Pull requests y merge

Aunque haya un solo desarrollador, un PR hacia `main` es un checkpoint recomendable para cambios funcionales o de riesgo medio.

Sirve para concentrar:

- diff final;
- checks;
- Preview;
- revision visual o de accesibilidad;
- historial claro antes del merge.

No debe convertirse en burocracia obligatoria para cambios triviales si no aporta valor.

Antes de mergear, confirmar que el diff sea pequeno, que las validaciones correspondan al alcance y que no se hayan tocado areas fuera del objetivo.

## Production

Production debe provenir de `main` estable.

La promocion esperada es:

```text
rama validada -> main -> Production
```

No hacer correcciones improvisadas directamente sobre Production. Si hay una regresion, resolverla en Git y promover nuevamente codigo validado.

La configuracion real de despliegue automatico, dominio y variables de Vercel queda `pendiente de confirmar` hasta verificarse fuera del repo.

## Rollback

Antes del merge, una rama puede abandonarse sin afectar `main`.

Despues del merge, una regresion puede resolverse mediante:

- revert del cambio en Git y nuevo deploy validado;
- promocion de un deployment estable desde Vercel, si la configuracion real lo permite.

El procedimiento operativo exacto de Vercel queda `pendiente de confirmar`.

## Responsabilidades de agentes

Codex y otros agentes deben:

- trabajar en una rama de tarea, no directamente sobre `main`;
- no descartar cambios ajenos;
- no editar `.env` reales salvo pedido explicito;
- no instalar dependencias, modificar configuracion externa ni tocar infraestructura sin autorizacion;
- no hacer commit, push, merge ni deploy salvo pedido explicito;
- tomar comandos desde `package.json`;
- mantener separados cambios documentales y cambios funcionales;
- respetar el alcance vigente de catalogo publico definido en [`PRODUCT_SCOPE.md`](./PRODUCT_SCOPE.md).
