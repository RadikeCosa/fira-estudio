# Artículo 6 — Webhook robusto: ACK rápido + cola + retries + idempotencia

## Objetivo
Aprender a diseñar recepción de pagos para producción: confirmar recepción rápido, procesar seguro después y evitar duplicados.

## Archivos foco
- `app/api/checkout/webhook/route.ts`
- `lib/webhooks/queue-processor.ts`

## Estructura del artículo

### 1) Problema
- Proveedores pueden reenviar eventos
- Tu backend puede fallar temporalmente
- Si perdés un webhook, perdés consistencia de negocio

### 2) Flujo recomendado
- Recibir evento
- Validar estructura mínima
- Encolar
- Responder rápido (`200`)
- Procesar asíncronamente

### 3) Archivo por archivo
#### `webhook/route.ts`
- Normalización de formatos de evento
- Estrategia de respuesta temprana
- Registro de contexto operativo

#### `queue-processor.ts`
- Obtención de lote pendiente
- Backoff exponencial en reintentos
- Dead letter
- Idempotencia por evento/pago

### 4) Decisiones de diseño
- ACK temprano para confiabilidad
- Cola interna en DB para trazabilidad
- Reintentos automáticos con límites

### 5) Alternativas
- Procesamiento sin cola
- Cola externa (SQS/Rabbit) según escala

### 6) Errores comunes
- Bloquear respuesta esperando integraciones externas
- Falta de idempotencia
- No separar errores transitorios de errores permanentes

### 7) Checklist
- [ ] Webhook responde rápido
- [ ] Hay cola de eventos persistente
- [ ] Hay estrategia de retries
- [ ] Hay dead letter + observabilidad
- [ ] Duplicados no generan efectos dobles
