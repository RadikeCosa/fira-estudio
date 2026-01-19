---
title: "WhatsApp Integration - Muma Estudio"
description: "WhatsApp contact link generation with analytics tracking and rate limiting"
version: "1.0"
lastUpdated: "2026-01-19"
activationTriggers:
  - "whatsapp"
  - "contact"
  - "consulta"
  - "mensaje"
---

# WhatsApp Integration Skill

## 🎯 Quick Reference

Use `WHATSAPP.getUrl()` to generate links and `trackWhatsAppClick()` for analytics.

---

## 📱 Basic Usage

### Generate WhatsApp Link

```typescript
import { WHATSAPP } from "@/lib/constants";

// Simple message
const url = WHATSAPP.getUrl("Hola! Tengo una consulta sobre los productos.");

// Product inquiry
const url = WHATSAPP.getUrl(
  `Hola! Me interesa el ${producto.nombre}. ¿Está disponible?`
);

// With variation details
const url = WHATSAPP.getUrl(
  `Hola! Consulta sobre:\n` +
  `Producto: ${producto.nombre}\n` +
  `Tamaño: ${variacion.tamanio}\n` +
  `Color: ${variacion.color}\n` +
  `Precio: ${formatPrice(variacion.precio)}`
);
```

**Returns**: Full WhatsApp Web URL ready for `href` attribute.

---

## 📊 Analytics Tracking

### Track WhatsApp Button Clicks

```typescript
import { trackWhatsAppClick } from "@/lib/analytics/gtag";

// Track product inquiry (without variation)
trackWhatsAppClick(producto);

// Track product inquiry (with variation)
trackWhatsAppClick(producto, variacion);
```

**Tracked Data**:
- `producto_id`, `producto_nombre`, `producto_slug`
- `variacion_tamanio`, `variacion_color`, `variacion_precio` (if provided)
- `value` (variation price or product base price)

**Note**: Only tracks in production (`NODE_ENV === 'production'`).

---

## 🛡️ Rate Limiting

### Client-Side Rate Limiting

Use the `useRateLimit` hook to prevent spam:

```typescript
'use client';
import { useRateLimit } from "@/hooks";

export function WhatsAppButton({ producto, variacion }) {
  const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
    maxActions: 5,
    windowMs: 60000, // 1 minute
    key: "whatsapp_clicks"
  });

  const handleClick = () => {
    if (!recordAction()) {
      alert(`Por favor esperá ${Math.ceil(timeUntilReset / 1000)}s antes de consultar nuevamente.`);
      return;
    }
    
    trackWhatsAppClick(producto, variacion);
    // Open WhatsApp...
  };

  return (
    <button onClick={handleClick} disabled={isRateLimited}>
      Consultar por WhatsApp
    </button>
  );
}
```

**Configuration**:
- `maxActions: 5` - Maximum 5 clicks
- `windowMs: 60000` - Per 60 seconds (1 minute)
- `key: "whatsapp_clicks"` - Unique identifier in localStorage

---

## 💬 Message Format Guidelines

### Best Practices

✅ **DO**:
- Use Spanish (Argentine dialect)
- Keep messages under 250 characters for mobile
- Include product name and key details
- Use polite, professional tone
- Line breaks with `\n` for readability

❌ **DON'T**:
- Don't use emojis (professional context)
- Don't include URLs (WhatsApp auto-detects)
- Don't encode special characters manually (handled by `getUrl()`)
- Don't send spam-like messages

### Example Messages

**General Inquiry**:
```typescript
const message = "Hola! Quisiera consultar sobre los productos disponibles.";
```

**Product Inquiry**:
```typescript
const message = `Hola! Me interesa el ${producto.nombre}. ¿Cuál es el tiempo de entrega?`;
```

**Detailed Inquiry**:
```typescript
const message = 
  `Hola! Consulta sobre:\n` +
  `\n` +
  `Producto: ${producto.nombre}\n` +
  `Tamaño: ${variacion.tamanio}\n` +
  `Color: ${variacion.color}\n` +
  `Precio: ${formatPrice(variacion.precio)}\n` +
  `\n` +
  `¿Está disponible para entrega inmediata?`;
```

---

## 🔧 Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_WHATSAPP_NUMBER=5492999123456

# Format: Country code + 10 digits, no spaces, no +
# Example: Argentina (54) + area code (299) + number (9123456)
```

### Constants

```typescript
// lib/constants/index.ts
export const WHATSAPP = {
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  getUrl: (message: string): string => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP.number}?text=${encodedMessage}`;
  },
};
```

---

## 🧪 Testing

### Manual Testing

1. **Verify message format**:
   ```typescript
   console.log(WHATSAPP.getUrl("Test message"));
   // Output: https://wa.me/5492999123456?text=Test%20message
   ```

2. **Test rate limiting**:
   - Click WhatsApp button 6+ times quickly
   - Should show "Esperá Xs" after 5th click

3. **Check analytics** (production only):
   - Open DevTools > Network tab
   - Click WhatsApp button
   - Look for gtag event with `whatsapp_click`

---

## 📚 Related Documentation

- Analytics events: `lib/analytics/gtag.ts`
- Rate limiting hook: `hooks/useRateLimit.ts`
- Rate limiting logic: `lib/storage/rate-limit.ts`
- Constants: `lib/constants/index.ts`

---

## ✅ Best Practices Checklist

- [ ] Use `WHATSAPP.getUrl()` for link generation
- [ ] Track clicks with `trackWhatsAppClick()`
- [ ] Implement rate limiting with `useRateLimit`
- [ ] Keep messages under 250 characters
- [ ] Use Spanish (Argentine dialect)
- [ ] Test message format before deploying
- [ ] Verify environment variable is set
- [ ] Don't hardcode phone numbers in components
