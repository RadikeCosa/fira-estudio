# Artículo 3 — UI del carrito para buena UX en red real

## Objetivo
Diseñar una experiencia de carrito que se sienta rápida y confiable, incluso con latencia o errores de red.

## Archivos foco
- `components/carrito/AddToCartButton.tsx`
- `components/layout/CartIndicator.tsx`
- `components/carrito/ShoppingCart.tsx`
- `hooks/useRateLimit.ts` (si aplica al flujo UI)

## Estructura del artículo

### 1) Problema
- El usuario percibe lentitud aunque el backend esté correcto
- Necesidad de feedback inmediato y claro

### 2) Estados de UI que importan
- idle / loading / success / error
- disabled states
- recuperación ante error

### 3) Archivo por archivo
#### `AddToCartButton`
- Manejo de submit
- Bloqueo de doble click
- Mensajes de feedback

#### `CartIndicator`
- Fuente de verdad de cantidad
- Actualización visual sin inconsistencias

#### `ShoppingCart`
- Render de items
- Cambios de cantidad
- Eliminación y vaciado

### 4) Decisiones de UX técnicas
- Optimistic UI: cuándo sí y cuándo no
- Toasts vs mensajes inline
- Reintentar automáticamente o pedir acción del usuario

### 5) Alternativas
- Estado global (Context) como orquestador
- React Query/SWR para sincronización

### 6) Errores comunes
- Spinner infinito sin timeout lógico
- Mensajes ambiguos para el usuario
- UI que asume éxito antes de confirmar servidor

### 7) Checklist
- [ ] Cada acción tiene estado visual
- [ ] Errores muestran próxima acción
- [ ] Acciones son idempotentes desde UX
- [ ] No hay saltos de cantidad inconsistentes
