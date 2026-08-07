# 📊 Analytics para Beginners - GA4 en 5 Minutos

> Archivo historico: este onboarding describe eventos comerciales retirados del producto vigente. No usar como guia activa de analytics para el catalogo.

No necesitas experiencia en analytics. Este documento explica **qué es GA4** y **cómo usarlo** en Fira Estudio.

---

## ¿Qué es Google Analytics 4?

**Versión corta:** Es un contador invisible que sigue qué hacen tus usuarios.

**Versión larga:** GA4 es un servicio gratuito de Google que te muestra:

- ¿Cuántas personas visitaron?
- ¿De dónde vinieron? (Google, Instagram, directamente)
- ¿Qué hicieron? (Vieron producto, agregaron al carrito, compraron)
- ¿Cuándo se fueron? (dónde abandonaron)

---

## Analogía: Tienda Física vs Online

### Tienda Física (sin analytics)

```
Estás parado en la puerta de tu tienda. Ves gente entrar, pero:
- No sabes cuántos entraron exactamente
- No sabes qué miraban
- No sabes qué los hizo irse
- No sabes quién compró qué
```

### Online (con GA4)

```
GA4 es un "mini gerente" que:
- Cuenta cada usuario
- Ve cuándo hacen click
- Nota cuándo se van
- Registra CUÁNDO compraron
```

---

## 7 Eventos que Rastreamos en Fira

### Eventos Básicos (Siempre Activos)

1. **page_view** - Usuario entró en una página
2. **scroll** - Usuario scrolleó hacia abajo
3. **click** - Usuario hizo click en algo

(GA4 los hace automáticamente, no necesitas código)

### Eventos de Carrito (Necesitan Código)

4. **add_to_cart** - Usuario agregó un producto al carrito
5. **view_cart** - Usuario vio el carrito
6. **remove_from_cart** - Usuario sacó un producto del carrito

### Evento de Compra (Necesitan Código)

7. **purchase** - Usuario compró (Carrito V2 Phase 1)

---

## Cómo Funciona el Rastreo

### Visual

```
1. Usuario clickea "Agregar al Carrito"
   ↓
2. Tu código corre: trackAddToCart(...)
   ↓
3. GA4 recibe evento en Google servers
   ↓
4. Google Analytics Dashboard actualiza en tiempo real
   ↓
5. Tú ves en dashboard: "+1 add_to_cart"
```

---

## Los 3 Eventos de Carrito Explicados

### 1. Add to Cart

**¿Cuándo?** Usuario hace click en "Agregar al Carrito"

**¿Por qué importa?** Si ves:

- 100 people visitaron producto
- 20 agregaron al carrito
- Significa: "Solo el 20% de quiénes ven el producto lo agregan"

Eso te dice: "¿Está el precio muy alto? ¿La descripción no es clara?"

**Código:**

```typescript
// components/AddToCartButton.tsx
"use client"

import { trackAddToCart } from "@/lib/analytics/gtag";

export function AddToCartButton({ producto, variacion }) {
  async function handleClick() {
    // Primero agrega al carrito
    await addToCarrito(producto.id, variacion.id);

    // DESPUÉS registra en GA4
    trackAddToCart(
      producto,
      variacion,
      cantidad,
      precio_unitario
    );
  }

  return <button onClick={handleClick}>Agregar al Carrito</button>;
}
```

### 2. View Cart

**¿Cuándo?** Usuario abre el carrito

**¿Por qué importa?** Si ves:

- 20 agregaron al carrito
- Pero solo 5 vieron el carrito
- Significa: "El 75% agregó al carrito pero nunca lo vio"

**Código:**

```typescript
// components/CartDrawer.tsx
"use client"

import { useEffect } from "react";
import { trackViewCart } from "@/lib/analytics/gtag";

export function CartDrawer({ items, isOpen }) {
  useEffect(() => {
    if (isOpen && items.length > 0) {
      trackViewCart(items);  // Una vez cuando se abre
    }
  }, [isOpen]);

  return (
    <div>
      {items.map(item => <CartItem key={item.id} item={item} />)}
    </div>
  );
}
```

### 3. Remove from Cart

**¿Cuándo?** Usuario saca un producto del carrito

**¿Por qué importa?** Si ves:

- 20 agregaron al carrito
- 15 sacaron un producto
- Significa: "Después de agregar, cambian de idea"

Eso indica problema de confianza, precio o envío.

**Código:**

```typescript
// components/CartItemCard.tsx
"use client"

import { trackRemoveFromCart } from "@/lib/analytics/gtag";

export function CartItemCard({ item }) {
  async function handleRemove() {
    // Primero saca del carrito
    await removeFromCarrito(item.id);

    // DESPUÉS registra en GA4
    trackRemoveFromCart(item);
  }

  return (
    <div>
      <p>{item.nombre} - ${item.precio}</p>
      <button onClick={handleRemove}>Eliminar</button>
    </div>
  );
}
```

---

## Cómo Verificar que Funciona

### Opción 1: GA4 Real-time Dashboard

```
1. Entra a https://analytics.google.com/
2. Busca tu propiedad "Fira Estudio"
3. Click en "Real-time" (lado izquierdo)
4. Haz acción en tu sitio (agrega al carrito)
5. Deberías ver "+1 event" en el dashboard
```

### Opción 2: Browser Console

```javascript
// En el navegador:
// 1. Abre la página de producto
// 2. Presiona F12 (Dev Tools)
// 3. Pega en Console:

window.gtag("event", "test_event", {
  evento_test: true,
  timestamp: new Date(),
});

// Si no sale error, ✓ GA4 está conectado
```

### Opción 3: Google Analytics Debugger Extension

```
1. Chrome Web Store: "Google Analytics Debugger"
2. Instala la extensión
3. Visita tu sitio
4. La extensión muestra eventos en tiempo real
```

---

## Datos que Recoge GA4

Cada evento incluye:

```typescript
{
  event: "add_to_cart",           // Nombre del evento
  event_category: "ecommerce",    // Tipo
  producto_id: "prod_123",        // Qué producto
  producto_nombre: "Remera azul", // Nombre legible
  precio: 45,                     // Precio
  cantidad: 2,                    // Cuántos
  valor_total: 90,                // 45 * 2
  user_id: "user_abc123",         // Quién lo hizo
  timestamp: 1704067200000,       // Cuándo
  session_id: "sess_xyz789"       // En qué sesión
}
```

---

## Cómo Leer el Dashboard

### Dashboard Básico

```
Google Analytics → Reportes → Engagement

Verás gráficos como:

📈 EVENTOS POR TIPO
add_to_cart:     245 eventos
view_cart:       89 eventos
remove_from_cart: 34 eventos
purchase:        0 eventos (aún no implementado)
```

**Lo que te dice:**

- 245 veces alguien agregó al carrito
- 89 veces alguien vio el carrito
- 34 veces alguien sacó un producto
- Todavía nadie compró (porque purchase no está en código)

### Dashboard de Funnel (Embudo)

```
100 usuarios ven producto
  ↓
20 agregan al carrito (20%)
  ↓
10 ven el carrito (50% de quiénes agregaron)
  ↓
3 compran (30% de quiénes vieron carrito)
```

**Lo que te dice:**

- "50% de quiénes agregan nunca ven el carrito" → Bug?
- "30% de quiénes ven carrito compran" → Conversión normal

---

## Errores Comunes

### ❌ Error 1: GA4 no registra eventos

```typescript
// ✗ MALO
function handleAddToCart() {
  addToCarrito(); // Sin GA4
  // Acción no se registra nunca
}
```

**Solución:**

```typescript
// ✓ CORRECTO
function handleAddToCart() {
  addToCarrito();
  trackAddToCart(producto, variacion, cantidad, precio); // ← GA4
}
```

### ❌ Error 2: Registrar en desarrollo

```typescript
// ✗ MALO
trackAddToCart(producto, variacion, cantidad, precio);
// Se registra en desarrollo
// Dashboard GA4 está sucio con datos de prueba
```

**Cómo funciona en el código:**

```typescript
// lib/analytics/gtag.ts
export function trackAddToCart(...) {
  // Solo registra en PRODUCCIÓN
  if (process.env.NODE_ENV !== "production") {
    console.log("[Dev] trackAddToCart no registrado");
    return;
  }

  window.gtag!("event", "add_to_cart", {...});
}
```

**Por eso:** Cuando haces `npm run dev`, GA4 NO registra.

### ❌ Error 3: Rastrear datos sensibles

```typescript
// ✗ MALO
trackAddToCart({
  ...producto,
  precio_costo: 15, // ← No! Data sensible
  margen_ganancia: 200, // ← No! Data sensible
});
```

**Solución:** Solo envía datos públicos:

```typescript
// ✓ CORRECTO
trackAddToCart({
  id: producto.id,
  nombre: producto.nombre,
  precio: producto.precio, // Público
  // Sin: precio_costo, margen_ganancia
});
```

---

## Case Study: Entender Tu Negocio

### Escenario 1

```
Ves en GA4:
- 1000 page_views
- 100 add_to_cart
- 10 purchase
- Conversión: 1%

Interpretación: "Está muy bajo. ¿Por qué?"
```

### Escenario 2

```
Profundizas:
- 1000 page_views
- 100 add_to_cart (10% → normal)
- 80 view_cart (80% de quiénes agregan ven carrito → ✓ bien)
- 10 purchase (12.5% de quiénes ven carrito)

Interpretación: "El problema es los últimos pasos"
Acción: Revisa el checkout, opciones de envío, formas de pago
```

---

## Checklist: ¿GA4 Está Bien?

- [ ] Puedo ver eventos en Real-time dashboard
- [ ] add_to_cart se registra cuando agrego producto
- [ ] view_cart se registra cuando abro carrito
- [ ] remove_from_cart se registra cuando saco producto
- [ ] Los números NO son cero
- [ ] Events aparecen solo en `npm run build && npm run start`, no en dev
- [ ] Datos NO incluyen precios de costo o márgenes

---

## ¿Por Qué Importa?

```
Sin Analytics:
"¿Cómo va el negocio?"
→ Sin idea

Con Analytics:
"¿Cómo va el negocio?"
→ "1000 visitantes, 100 agregaron al carrito, 10 compraron"
→ "Conversión: 1%, necesito mejorar checkout"
```

**Resultado:** Datos = mejor decisiones = más ventas.

---

## Para Cuando Necesites Carrito V2 Phase 1

Cuando llegue el momento de carrito V2, necesitaremos:

```typescript
// trackPurchase - NO está en código aún
export function trackPurchase(order: Order) {
  if (!canTrack()) return;

  window.gtag!("event", "purchase", {
    event_category: "ecommerce",
    transaction_id: order.id,
    value: order.total,
    currency: "ARS",
    items: order.items.map((item) => ({
      item_id: item.producto_id,
      item_name: item.nombre,
      price: item.precio,
      quantity: item.cantidad,
    })),
  });
}
```

Eso viene después. Por ahora solo los 6 eventos.

---

## Resumen

| Evento           | Qué significa           | Ejemplo                    |
| ---------------- | ----------------------- | -------------------------- |
| page_view        | Usuario entró en página | Abrió /productos           |
| scroll           | Usuario scrolleó        | Pasó mitad de página       |
| click            | Usuario hizo click      | Clickeó un botón           |
| add_to_cart      | Agregó al carrito       | Remera azul agregada       |
| view_cart        | Vio el carrito          | Abrió el drawer de carrito |
| remove_from_cart | Sacó del carrito        | Cambió de idea             |
| purchase         | Compró (futura)         | Completó orden             |

---

## 📚 Próximos Pasos

1. Lee `lib/analytics/gtag.ts` para ver cómo se implementa
2. Revisa `lib/analytics/` y los eventos del codigo real para detalles tecnicos vigentes
3. Abre `npm run dev` y verifica que GA4 NO registra (modo dev)
4. Ahora que entiendas, ayuda a implementar tracking en nuevos componentes

---

**Hecho por:** Fira Estudio Dev Team  
**Última actualización:** 29/01/2026
