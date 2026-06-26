# Artículo 4 — Checkout robusto: validaciones server-side y creación de orden

## Objetivo
Entender por qué la validación fuerte sucede en backend y cómo se construye una orden confiable antes de iniciar el pago.

## Archivos foco
- `components/carrito/CheckoutForm.tsx`
- `app/api/checkout/create-preference/route.ts`
- `lib/config/urls.ts`

## Estructura del artículo

### 1) Problema
- El frontend no es confiable para montos/stock
- El checkout requiere trazabilidad y seguridad

### 2) Flujo
- Formulario envía datos mínimos
- API valida payload
- API revalida stock y total
- API crea orden e items
- API crea preferencia en MP

### 3) Archivo por archivo
#### `CheckoutForm.tsx`
- Datos recolectados
- Manejo de submit/error
- Redirección a init point

#### `create-preference/route.ts`
- Rate limit (estado actual)
- Validaciones de negocio
- Creación de orden
- Integración con cliente MP

#### `lib/config/urls.ts`
- Centralización de URLs de retorno y webhook

### 4) Decisiones de diseño
- Orden antes de pago
- Validación doble (cliente + servidor)
- Contratos explícitos de entrada/salida

### 5) Alternativas
- Orden post-pago
- Checkout en múltiples pasos
- Validación con esquema compartido (ej: Zod) en ambos lados

### 6) Errores comunes
- Confiar total enviado por el navegador
- No contemplar rate limit distribuido en serverless
- Exponer mensajes internos de error al cliente

### 7) Checklist
- [ ] Total recalculado server-side
- [ ] Stock validado server-side
- [ ] Orden creada con estado inicial claro
- [ ] URLs de retorno centralizadas
