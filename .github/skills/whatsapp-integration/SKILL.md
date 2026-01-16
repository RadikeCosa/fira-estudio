---
name: whatsapp-integration-muma
description: Use when asked "cómo integrar WhatsApp", "crear enlace de consulta", "mensaje pre-formateado", "botón de contacto", "generar URL de WhatsApp", or working with WhatsApp integration in Muma Estudio
---

# WhatsApp Integration Skill - Muma Estudio

Complete implementation patterns for WhatsApp business integration with pre-formatted messages.

---

## How It Works

1. **Configure WhatsApp number** in constants
2. **Build message** with product details
3. **URL encode** the message
4. **Generate wa.me link** with encoded message
5. **Open in new tab** (desktop) or app (mobile)

**Current Implementation:** V1 uses WhatsApp for all customer inquiries (no checkout).

---

## Core Implementation

### WhatsApp Configuration

Central configuration in constants file:

```typescript
// lib/constants/index.ts

/** WhatsApp business configuration */
export const WHATSAPP = {
  // Phone number in international format (no + symbol, no spaces)
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492999XXXXXX",
  
  /**
   * Generate WhatsApp URL with pre-formatted message
   * @param message - Message text to send
   * @returns Complete wa.me URL with encoded message
   */
  getUrl: (message: string): string =>
    `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`,
} as const;
```

**Environment Variable (.env.local):**
```bash
# WhatsApp business number (international format)
# Argentina: 549 + area code + number
# Example: 5492999123456
NEXT_PUBLIC_WHATSAPP_NUMBER=5492999XXXXXX
```

**Number Format Rules:**
- Start with country code (54 for Argentina)
- Include "9" for mobile numbers
- Include area code without leading 0
- No spaces, hyphens, or special characters
- Example: `5492995551234` = +54 9 299 555-1234

---

### Generate WhatsApp Link Function

Utility function to create formatted messages:

```typescript
// lib/utils/whatsapp.ts
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";
import type { Producto, Variacion } from "@/lib/types";

/**
 * Generate pre-formatted WhatsApp message for product inquiry
 * @param producto - Product information
 * @param variacion - Selected variation (optional)
 * @returns Complete WhatsApp URL
 */
export function generateWhatsAppUrl(
  producto: Producto,
  variacion?: Variacion
): string {
  const mensaje = buildProductMessage(producto, variacion);
  return WHATSAPP.getUrl(mensaje);
}

/**
 * Build product inquiry message
 * @param producto - Product information
 * @param variacion - Selected variation (optional)
 * @returns Formatted message string
 */
function buildProductMessage(
  producto: Producto,
  variacion?: Variacion
): string {
  const lines: string[] = [
    `Hola! Me interesa este producto de ${SITE_CONFIG.name}:`,
    "",
    `📦 Producto: ${producto.nombre}`,
  ];
  
  if (variacion) {
    lines.push(`📏 Tamaño: ${variacion.tamanio}`);
    lines.push(`🎨 Color: ${variacion.color}`);
    lines.push(`💰 Precio: $${formatPrice(variacion.precio)}`);
    
    if (variacion.stock > 0) {
      lines.push(`📊 Stock: ${variacion.stock} disponibles`);
    } else {
      lines.push(`📊 Disponibilidad: A pedido`);
    }
  }
  
  lines.push("");
  lines.push("¿Podrías darme más información?");
  
  return lines.join("\n");
}

/**
 * Format price in Argentine pesos
 */
function formatPrice(precio: number): string {
  return precio.toLocaleString("es-AR");
}
```

---

### WhatsApp Button Component (Client Component)

Interactive button for product detail pages:

```typescript
// components/productos/WhatsAppButton.tsx
"use client";

import { MessageCircle } from "lucide-react";
import type { Producto, Variacion } from "@/lib/types";
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";

interface WhatsAppButtonProps {
  producto: Producto;
  variacion?: Variacion;
  disabled?: boolean;
  className?: string;
}

/**
 * WhatsAppButton - Interactive button to contact via WhatsApp
 * 
 * Opens WhatsApp with pre-formatted product inquiry message.
 * Use in product detail pages after variation selection.
 * 
 * @param producto - Product information
 * @param variacion - Selected variation (optional)
 * @param disabled - Disable button (e.g., no variation selected)
 * @param className - Additional CSS classes
 */
export function WhatsAppButton({
  producto,
  variacion,
  disabled = false,
  className = "",
}: WhatsAppButtonProps) {
  
  const formatPrice = (precio: number): string => {
    return precio.toLocaleString("es-AR");
  };
  
  const buildMessage = (): string => {
    let mensaje = `Hola! Me interesa este producto de ${SITE_CONFIG.name}: `;
    mensaje += `${producto.nombre}`;
    
    if (variacion) {
      mensaje += ` - Tamaño: ${variacion.tamanio}`;
      mensaje += `, Color: ${variacion.color}`;
      mensaje += `, Precio: $${formatPrice(variacion.precio)}`;
    }
    
    mensaje += `. ¿Podrías darme más información?`;
    
    return mensaje;
  };
  
  const whatsappUrl = WHATSAPP.getUrl(buildMessage());
  
  if (disabled) {
    return (
      <button
        disabled
        className={`
          inline-flex items-center justify-center gap-3
          w-full px-8 py-4 rounded-xl
          bg-gray-300 text-gray-500
          font-semibold text-base
          cursor-not-allowed
          ${className}
        `}
      >
        <MessageCircle className="w-5 h-5" />
        <span>Seleccione una variación</span>
      </button>
    );
  }
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group
        inline-flex items-center justify-center gap-3
        w-full
        px-8 py-4 rounded-xl
        bg-gradient-to-r from-green-600 to-green-500
        hover:from-green-700 hover:to-green-600
        text-white font-semibold text-base
        shadow-lg
        transition-all duration-300
        hover:shadow-xl
        hover:scale-[1.02]
        focus:outline-none
        focus:ring-2
        focus:ring-green-500
        focus:ring-offset-2
        ${className}
      `}
    >
      <MessageCircle className="w-5 h-5 motion-safe:transition-transform motion-safe:group-hover:rotate-12" />
      <span>Consultar por WhatsApp</span>
    </a>
  );
}
```

**Usage:**
```typescript
// In product detail page
"use client";

import { useState } from "react";
import { WhatsAppButton } from "@/components/productos/WhatsAppButton";

export function ProductoDetail({ producto }: { producto: ProductoCompleto }) {
  const [variacionSeleccionada, setVariacionSeleccionada] = useState<Variacion | null>(null);
  
  return (
    <div>
      <VariationSelector
        variaciones={producto.variaciones}
        onVariacionChange={setVariacionSeleccionada}
      />
      
      <WhatsAppButton
        producto={producto}
        variacion={variacionSeleccionada || undefined}
        disabled={!variacionSeleccionada}
      />
    </div>
  );
}
```

---

### Simple Link Version (Server Component)

For simpler use cases without state:

```typescript
// components/productos/WhatsAppLink.tsx
import { MessageCircle } from "lucide-react";
import type { Producto } from "@/lib/types";
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";

interface WhatsAppLinkProps {
  producto: Producto;
}

/**
 * WhatsAppLink - Simple link for general product inquiries
 * 
 * Use in product cards or listings for quick contact.
 * Does not include variation details.
 */
export function WhatsAppLink({ producto }: WhatsAppLinkProps) {
  const mensaje = `Hola! Me interesa el producto "${producto.nombre}" de ${SITE_CONFIG.name}. ¿Podrías darme más información?`;
  
  const whatsappUrl = WHATSAPP.getUrl(mensaje);
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center gap-2
        text-green-600 hover:text-green-700
        font-medium text-sm
        transition-colors
      "
    >
      <MessageCircle className="w-4 h-4" />
      <span>Consultar</span>
    </a>
  );
}
```

---

### Message Templates

Different message types for various contexts:

```typescript
// lib/utils/whatsapp-templates.ts
import { SITE_CONFIG } from "@/lib/constants";
import type { Producto, Variacion } from "@/lib/types";

/**
 * Message template for product detail inquiry
 */
export function productDetailMessage(
  producto: Producto,
  variacion?: Variacion
): string {
  const lines = [
    `Hola! Me interesa este producto de ${SITE_CONFIG.name}:`,
    "",
    `📦 ${producto.nombre}`,
  ];
  
  if (variacion) {
    lines.push(`📏 Tamaño: ${variacion.tamanio}`);
    lines.push(`🎨 Color: ${variacion.color}`);
    lines.push(`💰 Precio: $${variacion.precio.toLocaleString("es-AR")}`);
  }
  
  lines.push("");
  lines.push("¿Está disponible? ¿Cuál es el tiempo de entrega?");
  
  return lines.join("\n");
}

/**
 * Message template for general catalog inquiry
 */
export function generalInquiryMessage(): string {
  return `Hola! Vi el catálogo de ${SITE_CONFIG.name} y me gustaría recibir más información sobre sus productos textiles.`;
}

/**
 * Message template for custom order request
 */
export function customOrderMessage(
  producto: Producto,
  customDetails: string
): string {
  return [
    `Hola! Me interesa hacer un pedido personalizado basado en: ${producto.nombre}`,
    "",
    `Detalles del pedido:`,
    customDetails,
    "",
    "¿Es posible? ¿Cuál sería el precio y tiempo de entrega?",
  ].join("\n");
}

/**
 * Message template for bulk order inquiry
 */
export function bulkOrderMessage(
  producto: Producto,
  cantidad: number
): string {
  return [
    `Hola! Estoy interesado/a en hacer un pedido mayorista de ${SITE_CONFIG.name}:`,
    "",
    `📦 Producto: ${producto.nombre}`,
    `📊 Cantidad: ${cantidad} unidades`,
    "",
    "¿Tienen descuento por cantidad? ¿Cuál sería el precio total y tiempo de entrega?",
  ].join("\n");
}

/**
 * Message template for after-sale support
 */
export function supportMessage(orderReference: string): string {
  return [
    `Hola! Necesito ayuda con mi pedido de ${SITE_CONFIG.name}:`,
    "",
    `📋 Referencia: ${orderReference}`,
    "",
    "¿Podrían ayudarme?",
  ].join("\n");
}
```

**Usage:**
```typescript
import { productDetailMessage, bulkOrderMessage } from "@/lib/utils/whatsapp-templates";
import { WHATSAPP } from "@/lib/constants";

// Product detail
const url1 = WHATSAPP.getUrl(productDetailMessage(producto, variacion));

// Bulk order
const url2 = WHATSAPP.getUrl(bulkOrderMessage(producto, 50));
```

---

### Product Detail Page Integration

Complete example with variation selector:

```typescript
// app/productos/[slug]/page.tsx
import { getProductoBySlug } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import { ProductoDetailClient } from "./ProductoDetailClient";

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const producto = await getProductoBySlug(params.slug);
  
  if (!producto) {
    notFound();
  }
  
  return <ProductoDetailClient producto={producto} />;
}
```

```typescript
// app/productos/[slug]/ProductoDetailClient.tsx
"use client";

import { useState } from "react";
import type { ProductoCompleto, Variacion } from "@/lib/types";
import { VariationSelector } from "@/components/productos/VariationSelector";
import { WhatsAppButton } from "@/components/productos/WhatsAppButton";
import { ProductGallery } from "@/components/productos/ProductGallery";

export function ProductoDetailClient({ producto }: { producto: ProductoCompleto }) {
  const [variacionSeleccionada, setVariacionSeleccionada] = useState<Variacion | null>(null);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gallery */}
      <div>
        <ProductGallery imagenes={producto.imagenes} />
      </div>
      
      {/* Info & Actions */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{producto.nombre}</h1>
        <p className="text-muted-foreground">{producto.descripcion}</p>
        
        {/* Variation Selector */}
        <VariationSelector
          variaciones={producto.variaciones}
          onVariacionChange={setVariacionSeleccionada}
        />
        
        {/* WhatsApp Button */}
        <WhatsAppButton
          producto={producto}
          variacion={variacionSeleccionada || undefined}
          disabled={!variacionSeleccionada}
        />
        
        {/* Product Details */}
        <div className="border-t pt-6 space-y-3 text-sm">
          <p><strong>Material:</strong> {producto.material || "Consultar"}</p>
          <p><strong>Tiempo de fabricación:</strong> {producto.tiempo_fabricacion}</p>
          {producto.cuidados && (
            <p><strong>Cuidados:</strong> {producto.cuidados}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Mobile vs Desktop Detection (Optional)

Detect if user is on mobile to optimize WhatsApp experience:

```typescript
// lib/utils/device-detection.ts

/**
 * Detect if user is on mobile device
 * Use in Client Components only (requires window)
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get appropriate WhatsApp URL based on device
 * Mobile: whatsapp://send (opens app directly)
 * Desktop: https://wa.me (opens web version)
 */
export function getWhatsAppUrl(number: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  
  if (isMobileDevice()) {
    // Opens WhatsApp app directly
    return `whatsapp://send?phone=${number}&text=${encodedMessage}`;
  } else {
    // Opens WhatsApp Web
    return `https://wa.me/${number}?text=${encodedMessage}`;
  }
}
```

**Usage:**
```typescript
"use client";

import { getWhatsAppUrl } from "@/lib/utils/device-detection";
import { WHATSAPP } from "@/lib/constants";

export function WhatsAppButton({ mensaje }: { mensaje: string }) {
  const url = getWhatsAppUrl(WHATSAPP.number, mensaje);
  
  return <a href={url}>Contactar</a>;
}
```

---

### Analytics Tracking (Future)

Track WhatsApp button clicks for analytics:

```typescript
// lib/analytics.ts

/**
 * Track WhatsApp button click
 * Use Google Analytics, Plausible, or custom solution
 */
export function trackWhatsAppClick(
  producto: string,
  variacion?: string
): void {
  // Google Analytics (gtag)
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: producto,
      value: variacion,
    });
  }
  
  // Custom API call (future)
  fetch("/api/analytics/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ producto, variacion }),
  });
}
```

**Integration:**
```typescript
"use client";

import { trackWhatsAppClick } from "@/lib/analytics";

export function WhatsAppButton({ producto, variacion }: Props) {
  const handleClick = () => {
    trackWhatsAppClick(producto.nombre, variacion?.id);
  };
  
  return (
    <a
      href={whatsappUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
    >
      Consultar por WhatsApp
    </a>
  );
}
```

---

## Testing WhatsApp Links

### Manual Testing Checklist

- [ ] Link opens in new tab/window
- [ ] WhatsApp Web opens (desktop) or app opens (mobile)
- [ ] Message is pre-filled correctly
- [ ] Special characters encoded properly (emojis, Spanish accents)
- [ ] Product name displays correctly
- [ ] Variation details accurate
- [ ] Price formatted correctly
- [ ] No broken line breaks

### Test Function

```typescript
// lib/utils/whatsapp.test.ts

/**
 * Test WhatsApp message generation
 */
export function testWhatsAppMessage(): void {
  const testProducto: Producto = {
    id: "test-id",
    nombre: "Mantel Floral Café & Crema",
    slug: "mantel-floral-cafe-crema",
    descripcion: "Test description",
    categoria_id: "cat-id",
    precio_desde: 15000,
    destacado: false,
    activo: true,
    tiempo_fabricacion: "2-3 días",
    material: "100% algodón",
    cuidados: "Lavar a máquina",
    created_at: new Date().toISOString(),
  };
  
  const testVariacion: Variacion = {
    id: "var-id",
    producto_id: "test-id",
    tamanio: "150x200cm",
    color: "Café con leche",
    precio: 15000,
    stock: 5,
    sku: null,
    activo: true,
  };
  
  const mensaje = buildProductMessage(testProducto, testVariacion);
  const url = WHATSAPP.getUrl(mensaje);
  
  console.log("Generated Message:");
  console.log(mensaje);
  console.log("\nGenerated URL:");
  console.log(url);
  console.log("\nDecoded URL:");
  console.log(decodeURIComponent(url));
}
```

---

## Common Issues & Solutions

### Issue: Message gets cut off or breaks

**Cause:** Special characters not properly encoded.

**Solution:**
```typescript
// ✅ Always use encodeURIComponent
const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

// ❌ Don't manually encode
const url = `https://wa.me/${number}?text=${message.replace(/ /g, '%20')}`;
```

---

### Issue: Link doesn't open WhatsApp app on mobile

**Cause:** Using wrong URL scheme.

**Solution:**
```typescript
// ✅ Use wa.me (works on both mobile and desktop)
https://wa.me/5492999123456?text=...

// ❌ Avoid whatsapp:// (may not work in browsers)
whatsapp://send?phone=5492999123456&text=...
```

---

### Issue: Number format invalid

**Cause:** Incorrect international format.

**Solution:**
```typescript
// ✅ Correct format
5492999123456  // +54 9 299 9123456 (Argentina mobile)

// ❌ Wrong formats
+5492999123456  // Don't include +
549 2999 123456  // Don't include spaces
5402999123456  // Don't include leading 0 in area code
```

---

### Issue: Emojis don't display correctly

**Cause:** Encoding issue.

**Solution:**
```typescript
// ✅ Use native emojis (they encode fine)
const mensaje = "📦 Producto: Mantel\n🎨 Color: Rojo";

// ✅ URL encodes correctly
encodeURIComponent(mensaje);
// Output: "%F0%9F%93%A6%20Producto%3A%20Mantel%0A%F0%9F%8E%A8%20Color%3A%20Rojo"
```

---

## Security Considerations

### Input Validation

```typescript
// ✅ Sanitize user input if allowing custom messages
function sanitizeMessage(input: string): string {
  // Remove potentially harmful characters
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .slice(0, 1000); // Limit length
}
```

### Rate Limiting (Future)

```typescript
// Prevent spam by limiting WhatsApp clicks per user
const RATE_LIMIT_KEY = "whatsapp_clicks";
const MAX_CLICKS_PER_HOUR = 10;

function checkRateLimit(): boolean {
  const clicks = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "[]");
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  // Filter recent clicks
  const recentClicks = clicks.filter((timestamp: number) => timestamp > oneHourAgo);
  
  if (recentClicks.length >= MAX_CLICKS_PER_HOUR) {
    return false; // Rate limit exceeded
  }
  
  // Add current click
  recentClicks.push(Date.now());
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentClicks));
  
  return true;
}
```

---

## Future Enhancements (V2)

### 1. Order Confirmation via WhatsApp

After payment confirmation, send order details via WhatsApp:

```typescript
export function orderConfirmationMessage(pedido: Pedido): string {
  return [
    `¡Gracias por tu compra en ${SITE_CONFIG.name}! 🎉`,
    "",
    `📋 Pedido #${pedido.numero}`,
    `💰 Total: $${pedido.total.toLocaleString("es-AR")}`,
    `📦 Productos: ${pedido.items.length}`,
    "",
    "Te estaremos contactando pronto para coordinar la entrega.",
  ].join("\n");
}
```

### 2. Automated Responses (WhatsApp Business API)

Integrate WhatsApp Business API for automated responses:

```typescript
// Future: Server-side webhook for WhatsApp messages
export async function POST(request: Request) {
  const webhook = await request.json();
  
  // Handle incoming message
  if (webhook.type === "message") {
    const message = webhook.message.text;
    
    // Auto-respond to common queries
    if (message.includes("horario")) {
      await sendWhatsAppMessage(
        webhook.from,
        "Nuestro horario de atención es Lunes a Viernes de 9 a 18hs."
      );
    }
  }
}
```

### 3. Chat Widget

Embed WhatsApp chat widget on website:

```tsx
// components/WhatsAppWidget.tsx
"use client";

export function WhatsAppWidget() {
  return (
    <a
      href={WHATSAPP.getUrl("Hola! Necesito ayuda.")}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-6 right-6
        z-50
        w-14 h-14
        bg-green-500 hover:bg-green-600
        rounded-full
        flex items-center justify-center
        shadow-lg
        transition-all
      "
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </a>
  );
}
```

---

## Related Resources

- Constants Configuration: `lib/constants/index.ts`
- WhatsApp Button Component: `components/productos/WhatsAppButton.tsx`
- Product Types: `lib/types.ts`
- Business Logic: `.github/reference/business-logic.md`
