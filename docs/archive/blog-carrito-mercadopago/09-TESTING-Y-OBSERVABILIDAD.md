# Artículo 9 — Testing y observabilidad de extremo a extremo

## Objetivo
Subir confianza técnica del flujo de cobro con pruebas útiles y señales operativas accionables.

## Archivos foco
- `app/api/checkout/create-preference/create-preference.test.ts`
- `app/api/checkout/webhook/webhook.test.ts`
- `hooks/useRateLimit.test.ts`
- `docs/TESTING_STRATEGY.md`

## Estructura del artículo

### 1) Problema
- “Tiene tests” no implica “está protegido en producción”
- Necesidad de cubrir casos de negocio y fallos reales

### 2) Pirámide de pruebas aplicada al flujo
- Unit: utilidades y validaciones
- Integración: routes + repositorios + SDK mock
- E2E (si aplica): flujo compra hasta confirmación

### 3) Qué probar sí o sí
- Validación server-side de totales y stock
- Casos de webhook duplicado
- Reintentos y dead letter
- Estados success/pending/failure en UI

### 4) Observabilidad mínima viable
- Logs estructurados por correlación
- Métricas clave (tasa de aprobación, retries, edad de cola)
- Alertas operativas básicas

### 5) Errores comunes
- Tests acoplados a detalles internos
- Mockear demasiado y perder señales reales
- No medir tiempos de procesamiento webhook

### 6) Checklist
- [ ] Casos felices y fallos críticos cubiertos
- [ ] Idempotencia con tests dedicados
- [ ] Señales operativas con umbrales definidos
- [ ] Procedimiento de incidentes documentado
