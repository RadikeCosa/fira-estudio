---
title: "Accessibility & Performance - Fira Estudio"
description: "Best practices for accessible and high-performance e-commerce with Next.js"
version: "1.1"
lastUpdated: "2026-01-29"
activationTriggers:
  - "accesibilidad"
  - "accessibility"
  - "a11y"
  - "performance"
  - "lighthouse"
  - "alt"
  - "aria"
---

# Accessibility & Performance Skill

## 🎯 Quick Reference

- Todos los usuarios deben poder navegar y comprar, sin importar sus capacidades.
- El sitio debe cargar rápido y ser usable en dispositivos móviles y conexiones lentas.

---

## ♿ Principios de Accesibilidad

- Usa roles/ARIA solo cuando sea necesario.
- Todo elemento interactivo debe ser accesible por teclado (Tab/Enter/Espacio).
- Todas las imágenes con `alt` descriptivo (decorativas con `alt=""`).
- Usa etiquetas semánticas (`<nav>`, `<main>`, `<header>`, `<footer>`, `<button>`, etc.).
- Asegura contraste suficiente (WCAG AA).
- Usa `aria-live` para mensajes dinámicos (errores/confirmaciones).
- Evita trampas de foco: modales/drawers con focus trap + Escape.

### Skip to Content (obligatorio)

**Ubicación:** `app/layout.tsx`

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg focus:shadow-lg"
>
  Saltar al contenido principal
</a>

<main id="main-content">{children}</main>
```

### Focus Trap (MobileNav)

**Ubicación:** `components/layout/MobileNav.tsx`

```tsx
import FocusTrap from "focus-trap-react";

{
  isOpen && (
    <FocusTrap
      focusTrapOptions={{ onDeactivate: close, clickOutsideDeactivates: true }}
    >
      <div className="mobile-nav-overlay">{/* ... */}</div>
    </FocusTrap>
  );
}
```

### Keyboard Selection (VariationSelector)

**Ubicación:** `components/productos/VariationSelector.tsx`

```tsx
function handleKeyDown(e: React.KeyboardEvent, value: string) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    setSelected(value);
  }
}
```

### ARIA en checkboxes (FilterBar)

**Ubicación:** `components/productos/FilterBar.tsx`

```tsx
<input
  aria-label={`Filtrar por categoría ${categoria.nombre}`}
  aria-checked={filters.categorias.includes(categoria.id)}
/>
```

### Alt Text (productos)

**Bueno:**

```tsx
<img alt="Mantel rectangular con estampado floral rojo y blanco, ideal para 6 personas" />
```

---

## 🚀 Principios de Performance

- Usa `<Image>` de Next.js (lazy + sizes).
- Skeletons/loaders para contenido asíncrono.
- Suspense + loading.tsx para percepción de velocidad.
- Minimiza dependencias pesadas.
- Usa cache/revalidate de Next.js.
- Mobile-first con Tailwind.
- Medí LCP/TTI/CLS con Lighthouse.

---

## 🧪 Testing y Auditoría

- axe DevTools (a11y)
- Lighthouse (a11y/perf)
- WAVE / Pa11y
- Testing Library: `getByRole`, `getByLabelText`

---

## 🟡 Mejoras Prioritarias (orden)

1. Skip to content + Focus trap (HIGH)
2. ARIA en FilterBar + teclado en VariationSelector (HIGH)
3. Contraste + alt text (MEDIUM)
4. `aria-live` en formularios + reduced motion (MEDIUM/LOW)
5. focus-visible + landmarks (LOW)

---

## ✅ Checklist

- [ ] Navegación 100% por teclado
- [ ] Imágenes con alt descriptivo
- [ ] Contraste WCAG AA
- [ ] `aria-live` en errores
- [ ] Focus trap en overlays
- [ ] Lighthouse a11y > 90

---

## 📚 Documentación Relacionada

- [Testing Skill](../testing/SKILL.md)
- [Business Logic](../../reference/business-logic.md)
- [Component Patterns](../../instructions/copilot-instructions.instructions.md)
