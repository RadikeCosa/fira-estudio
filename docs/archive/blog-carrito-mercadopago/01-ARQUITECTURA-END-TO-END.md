# Artículo 1 — Arquitectura end-to-end: del botón “Agregar” al “Pago aprobado”

## Qué vas a aprender
Al terminar este artículo vas a poder:

- Entender el flujo completo de compra de este proyecto
- Ubicar qué parte vive en UI, qué parte en backend y qué parte en Mercado Pago
- Explicar por qué hay procesamiento asíncrono con webhook + cola
- Reconocer alternativas de diseño y cuándo elegir cada una

---

## 1) El problema real en e-commerce
En un e-commerce no alcanza con “cobrar”.
Necesitamos garantizar, al mismo tiempo:

- que el carrito sea consistente,
- que el stock no se rompa,
- que la orden quede trazable,
- y que el pago se confirme aunque haya errores transitorios.

Por eso este proyecto divide el flujo en etapas claras y desacopladas.

---

## 2) Mapa de alto nivel

### Capas
1. **UI (React/Next)**
   - Muestra productos, carrito y formulario de checkout.
2. **Backend de aplicación (Server Actions + API Routes)**
   - Valida reglas, crea orden y habla con Mercado Pago.
3. **Infra de persistencia (Supabase/PostgreSQL)**
   - Guarda carrito, orden, logs de pago y cola de webhooks.
4. **Proveedor externo (Mercado Pago)**
   - Crea preferencia y envía notificaciones de pago.

### Flujo resumido
1. Usuario hace click en agregar al carrito.
2. UI llama Server Action y persiste en base.
3. Usuario completa checkout y backend crea orden.
4. Backend crea preferencia en Mercado Pago.
5. Usuario paga en Mercado Pago.
6. Mercado Pago notifica por webhook.
7. Backend encola evento y lo procesa con retries.
8. Se actualiza estado final de la orden y la página de éxito lo refleja.

---

## 3) Recorrido archivo por archivo

## 3.1 Entrada al flujo: botón de agregar al carrito
**Archivo:** `components/carrito/AddToCartButton.tsx`

### Qué hace
- Toma el producto/variación seleccionada
- Dispara la acción para agregar al carrito
- Maneja estados de loading y feedback al usuario

### Por qué está así
- Mantener la UX en cliente, pero delegar reglas críticas al servidor
- Evitar que el cliente sea la fuente de verdad de inventario/precio

### Alternativa
- Carrito solo en estado local + localStorage
  - Pro: simple al inicio
  - Contra: inconsistencia entre pestañas/dispositivos y mayor riesgo al pasar a checkout

---

## 3.2 Reglas del carrito en servidor
**Archivo:** `app/api/cart/actions.ts`

### Qué hace
- Resuelve `session_id` (cookie) para usuarios anónimos
- Expone acciones: agregar, actualizar cantidad, limpiar, obtener carrito
- Aplica validaciones básicas antes de persistir

### Por qué está así
- Centralizar lógica de negocio del carrito en un lugar auditable
- Minimizar manipulación sensible desde el cliente

### Alternativa
- Endpoint REST clásico (`/api/cart`) en vez de Server Actions
  - Pro: patrón conocido por más equipos
  - Contra: más boilerplate para app router si ya estás en Next moderno

---

## 3.3 Persistencia del carrito
**Archivo:** `lib/repositories/cart.repository.ts`

### Qué hace
- Encapsula acceso a tablas de carrito e items
- Guarda snapshot de precio al momento de agregar (`price_at_addition`)

### Por qué está así
- Separar “cómo guardo datos” de “qué regla de negocio aplico”
- Facilitar testeo y reemplazo de implementación

### Alternativa
- Consultas SQL directas dentro de actions/routes
  - Pro: menos archivos al principio
  - Contra: deuda técnica rápida y lógica mezclada

---

## 3.4 Inicio del checkout y creación de orden
**Archivo:** `app/api/checkout/create-preference/route.ts`

### Qué hace
- Recibe datos del formulario
- Aplica rate limit (actualmente en memoria por IP)
- Revalida carrito/stock/precios en servidor
- Crea orden + detalle de ítems
- Crea preferencia de Mercado Pago

### Por qué está así
- El backend vuelve a calcular total para evitar manipulación del cliente
- Crear orden antes del pago permite trazabilidad temprana

### Alternativa
- Crear orden solo cuando el pago se confirme
  - Pro: menos órdenes “canceladas” en DB
  - Contra: más difícil correlacionar intentos de pago fallidos

---

## 3.5 Cliente Mercado Pago desacoplado
**Archivo:** `lib/mercadopago/client.ts`

### Qué hace
- Inicializa SDK/config de Mercado Pago
- Expone operaciones de preferencia/pago usadas por routes

### Por qué está así
- Aislar detalles del proveedor externo
- Evitar repetir configuración y facilitar cambios futuros

### Alternativa
- Instanciar SDK en cada route
  - Pro: directo
  - Contra: duplicación y riesgo de configuración inconsistente

---

## 3.6 Confirmación asíncrona por webhook
**Archivo:** `app/api/checkout/webhook/route.ts`

### Qué hace
- Recibe notificación de Mercado Pago
- Valida seguridad (IP/firma/tiempo)
- Normaliza payload y encola evento
- Responde rápido para no perder notificaciones

### Por qué está así
- Un webhook debe ser resistente: responder rápido y procesar después
- Evita timeout del proveedor en picos o fallas transitorias

### Alternativa
- Procesar todo en el mismo request del webhook
  - Pro: menos componentes
  - Contra: más frágil y propenso a perder eventos

---

## 3.7 Cola, retries e idempotencia
**Archivo:** `lib/webhooks/queue-processor.ts`

### Qué hace
- Procesa eventos encolados
- Reintenta en fallas transitorias (backoff)
- Aplica idempotencia para no duplicar efectos
- Mueve a dead letter cuando agota reintentos

### Por qué está así
- En pagos, “eventualmente correcto” es mejor que “sincrónicamente frágil”
- Permite recuperar incidentes sin perder trazabilidad

### Alternativa
- Sin cola (MVP)
  - Pro: simple para demo
  - Contra: riesgo alto en producción real

---

## 3.8 Estado final para el usuario
**Archivo:** `app/checkout/success/page.tsx`

### Qué hace
- Lee parámetros de retorno
- Consulta estado de orden
- Muestra información final al comprador

### Por qué está así
- El usuario necesita feedback confiable y accionable
- Permite mostrar “pendiente” si webhook aún no cerró ciclo

### Alternativa
- Mostrar solo mensaje fijo de éxito
  - Pro: implementación mínima
  - Contra: mala experiencia cuando el estado real todavía no está confirmado

---

## 4) Decisiones de arquitectura (resumen)
1. **Server Actions para carrito** en lugar de estado local como fuente de verdad.
2. **Orden creada antes de preferencia de pago** para trazabilidad.
3. **Webhook desacoplado con cola** para robustez en producción.
4. **Idempotencia explícita** para evitar doble procesamiento.
5. **Seguridad en capas** para proteger endpoint de webhook.

Estas decisiones aumentan complejidad, pero reducen riesgos críticos en pagos.

---

## 5) Arquitectura actual vs arquitectura objetivo

### Actual (observada)
- Buen desacople en capas
- Buen enfoque de resiliencia en webhooks
- Algunos desvíos puntuales entre docs e implementación

### Objetivo (propuesto)
- Rate limit distribuido (no en memoria local)
- Corrección consistente de fallback de `session_id`
- Política de stock alineada con decisión de negocio “a pedido”
- Documentación sincronizada con código ejecutable

---

## 6) Errores comunes de juniors en este tipo de integración
- Confiar en precio/total que viene del frontend
- Procesar webhook de forma sincrónica y lenta
- No contemplar eventos duplicados
- Asumir que `success` implica estado final aprobado
- No diseñar para fallas temporales de red o proveedor

---

## 7) Checklist práctico
- [ ] El carrito persiste fuera del cliente
- [ ] El checkout recalcula total en servidor
- [ ] La orden queda trazable antes o durante el pago (según estrategia)
- [ ] El webhook responde rápido y procesa asíncrono
- [ ] Existe idempotencia para pagos duplicados
- [ ] Hay logs operativos y estrategia de reintentos

---

## Próximo artículo
**Artículo 2: Carrito con Server Actions + Supabase**

Vamos a bajar un nivel técnico y explicar, paso a paso, cómo `session_id`, repositorio y tablas trabajan juntos para sostener el carrito de un usuario anónimo sin romper la UX.
