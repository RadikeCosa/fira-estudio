# Artículo 7 — Seguridad y operación del webhook

## Objetivo
Entender cómo proteger y operar el webhook en un entorno real sin sacrificar disponibilidad.

## Archivos foco
- `lib/mercadopago/webhook-security.ts`
- `lib/utils/security-logger.ts`
- `app/api/webhooks/status/route.ts`
- `app/api/webhooks/process-queue/route.ts`
- `app/api/webhooks/reconcile/route.ts`

## Estructura del artículo

### 1) Problema
- Endpoint expuesto a internet
- Riesgo de requests falsos o replay
- Necesidad de diagnóstico rápido en incidentes

### 2) Mecanismos de defensa
- Validación de origen (IP/rangos)
- Firma HMAC
- Ventana temporal anti-replay
- Logs de seguridad estructurados

### 3) Operación diaria
- Health/status del sistema de webhook
- Proceso manual de cola
- Reconciliación de pagos faltantes

### 4) Decisiones de diseño
- Defensa en profundidad
- Endpoints operativos protegidos por token
- Observabilidad orientada a incidentes

### 5) Alternativas
- Solo HMAC (menos mantenimiento)
- SIEM/APM externo para auditoría avanzada

### 6) Errores comunes
- Guardar secretos en cliente
- Logs sin contexto trazable
- Falta de runbook operativo

### 7) Checklist
- [ ] Secretos solo server-side
- [ ] Firma y timestamp validados
- [ ] Endpoints operativos autenticados
- [ ] Logs útiles para troubleshooting
