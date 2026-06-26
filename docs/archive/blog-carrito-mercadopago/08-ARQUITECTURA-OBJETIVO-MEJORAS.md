# Artículo 8 — Arquitectura objetivo: mejorar sin reescribir todo

## Objetivo
Definir un plan de mejoras incremental para cerrar desvíos reales sin frenar el negocio.

## Insumos
- Implementación actual en `app/`, `components/`, `lib/`
- Reglas en `.github/instructions/*.md`
- Documentación operativa en `docs/*.md`

## Estructura del artículo

### 1) Diagnóstico rápido (actual)
- Fortalezas del diseño actual
- Deudas de arquitectura prioritarias

### 2) Gap 1: rate limit en serverless
- Estado actual (en memoria local)
- Riesgo
- Objetivo: rate limit distribuido
- Migración por etapas

### 3) Gap 2: consistencia de `session_id`
- Estado actual del fallback
- Riesgo en trazabilidad del carrito
- Objetivo y plan de corrección

### 4) Gap 3: política de stock
- Regla de negocio esperada vs implementación visible
- Opciones de alineación

### 5) Gap 4: documentación vs código
- Cómo detectar drift
- Proceso mínimo para mantener docs vivas

### 6) Hoja de ruta (30/60/90 días)
- Quick wins
- Cambios estructurales
- Métricas de éxito

### 7) Checklist
- [ ] Mejora propuesta tiene riesgo, costo y beneficio
- [ ] Hay plan de rollout gradual
- [ ] Se define cómo verificar impacto
