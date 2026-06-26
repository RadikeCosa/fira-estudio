# Copilot Instructions — Fira Estudio

La guia principal para agentes en este repositorio es [`/AGENTS.md`](../AGENTS.md).

Usar `AGENTS.md` como fuente canonica para:

- proposito del proyecto;
- stack y comandos disponibles;
- reglas de secretos;
- criterios de entornos;
- seguridad en checkout, webhooks y pagos;
- politica de cambios pequenos y auditables.

Este archivo queda como puente de compatibilidad para herramientas que buscan instrucciones en `.github/`.

## Instrucciones locales adicionales

- Si una instruccion de `.github/instructions/*.md` contradice `AGENTS.md` o el codigo real, prevalecen `AGENTS.md` y el codigo.
- Para checkout y webhook, usar `.github/instructions/checkout.instructions.md` solo como complemento especializado.
- No asumir que una instruccion historica sigue vigente sin verificarla contra `package.json` y el codigo actual.
