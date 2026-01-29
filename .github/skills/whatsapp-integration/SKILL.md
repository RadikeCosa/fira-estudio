---
title: "WhatsApp Integration - Fira Estudio"
description: "WhatsApp contact link generation with analytics tracking and rate limiting"
version: "1.1"
lastUpdated: "2026-01-29"
activationTriggers:
  - "whatsapp"
  - "contact"
  - "consulta"
  - "mensaje"
  - "rate-limit"
  - "rate limiting"
---

# WhatsApp Integration Skill

## 🎯 Quick Reference

Usar `WHATSAPP.getUrl()` para links y `trackWhatsAppClick()` para analytics.  
Rate limiting: **5 clicks/min** con `useRateLimit`.

---

## 📱 Basic Usage

```ts
import { WHATSAPP } from "@/lib/constants";

const url = WHATSAPP.getUrl(
  `Hola! Consulta sobre:\n` +
    `Producto: ${producto.nombre}\n` +
    `Tamaño: ${variacion.tamanio}\n` +
    `Color: ${variacion.color}\n` +
    `Precio: ${formatPrice(variacion.precio)}`,
);
```

---

## 📊 Analytics Tracking

```ts
import { trackWhatsAppClick } from "@/lib/analytics/gtag";

trackWhatsAppClick(producto);
trackWhatsAppClick(producto, variacion);
```

---

## 🛡️ Rate Limiting (Client-side)

**Objetivo:** prevenir spam sin romper UX.

```tsx
"use client";
import { useRateLimit } from "@/hooks";

export function WhatsAppButton({ producto, variacion }) {
  const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
    maxActions: 5,
    windowMs: 60000,
    key: "whatsapp_clicks",
  });

  const handleClick = () => {
    if (!recordAction()) {
      alert(`Por favor esperá ${Math.ceil(timeUntilReset / 1000)}s.`);
      return;
    }
    trackWhatsAppClick(producto, variacion);
  };

  return (
    <button onClick={handleClick} disabled={isRateLimited}>
      Consultar por WhatsApp
    </button>
  );
}
```

### Capas involucradas

- Storage: `lib/storage/rate-limit.ts`
- Hook: `hooks/useRateLimit.ts`
- UI: `components/productos/WhatsAppButton.tsx`

### Comportamiento

- 5 clicks en 60s → botón disabled + countdown
- Fail-open si localStorage falla (mejor UX)

---

## 🔧 Configuration

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5492999123456
```

```ts
export const WHATSAPP = {
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  getUrl: (message: string): string =>
    `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`,
};
```

---

## ✅ Best Practices Checklist

- [ ] Usar `WHATSAPP.getUrl()`
- [ ] Trackear con `trackWhatsAppClick()`
- [ ] Activar rate limiting con `useRateLimit`
- [ ] No hardcodear número
- [ ] Mensajes < 250 caracteres
