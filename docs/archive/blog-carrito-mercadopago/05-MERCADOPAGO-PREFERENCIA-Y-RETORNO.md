# Artículo 5 — Integración con Mercado Pago: preferencia, retorno y correlación

## Objetivo
Entender cómo se crea una preferencia de pago, cómo se correlaciona con una orden interna y qué significa realmente volver por success/pending/failure.

## Archivos foco
- `lib/mercadopago/client.ts`
- `app/api/checkout/create-preference/route.ts`
- `app/checkout/success/page.tsx`
- `app/checkout/pending/page.tsx`
- `app/checkout/failure/page.tsx`

## Estructura del artículo

### 1) Problema
- El retorno del comprador no siempre refleja estado final del pago
- Necesidad de correlación confiable entre MP y orden interna

### 2) Flujo
- Crear preferencia
- Redirigir a MP
- Volver por URL de estado
- Consultar orden y renderizar estado real

### 3) Archivo por archivo
#### `lib/mercadopago/client.ts`
- Configuración SDK
- Manejo de credenciales

#### `create-preference/route.ts`
- Payload de preferencia
- Uso de `external_reference`

#### páginas `success` / `pending` / `failure`
- Qué se muestra en cada caso
- Qué debe evitarse (falsos positivos de éxito)

### 4) Decisiones de diseño
- Correlación por `external_reference`
- Separar “retorno UX” de “confirmación final”

### 5) Alternativas
- Correlación con UUID puro
- Metadata enriquecida en provider
- Polling controlado post-retorno

### 6) Errores comunes
- Tratar `success` como “pago aprobado” garantizado
- No validar existencia de orden al retornar
- Parseos frágiles del identificador de correlación

### 7) Checklist
- [ ] Preferencia tiene referencia trazable
- [ ] Retornos no asumen aprobación final
- [ ] Mensajes UX distinguen pendiente vs aprobado
