---
title: "Accessibility & Performance - Fira Estudio"
description: "Best practices for accessible and high-performance e-commerce with Next.js"
version: "1.0"
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

- Usa roles y atributos ARIA solo cuando sea necesario.
- Todos los elementos interactivos deben ser accesibles por teclado (tab, enter, espacio).
- Provee etiquetas `alt` descriptivas en todas las imágenes.
- Usa etiquetas semánticas (`<nav>`, `<main>`, `<header>`, `<footer>`, `<button>`, etc.).
- Asegura contraste suficiente entre texto y fondo.
- Usa `aria-live` para mensajes dinámicos (errores, confirmaciones).
- Evita trampas de foco (focus trap) y asegura que los modales/drawers sean navegables.

### Ejemplo: Imagen accesible

```tsx
<Image src={url} alt="Mantel floral rojo sobre mesa de madera" ... />
```

### Ejemplo: Botón accesible

```tsx
<button type="button" aria-label="Abrir menú de navegación">
  <MenuIcon />
</button>
```

---

## 🚀 Principios de Performance

- Usa `<Image>` de Next.js para imágenes optimizadas y lazy loading.
- Implementa skeletons o loaders para contenido asíncrono.
- Usa Suspense y loading.tsx para mejorar la percepción de velocidad.
- Minimiza el uso de dependencias pesadas.
- Aprovecha la caché y la revalidación de Next.js (`revalidate`).
- Usa breakpoints y clases responsivas de Tailwind para mobile-first.
- Mide LCP, TTI y CLS con Lighthouse y corrige problemas detectados.

### Ejemplo: Skeleton Loader

```tsx
export function ProductosSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-muted rounded" />
      <div className="h-6 bg-muted rounded w-1/2" />
    </div>
  );
}
```

---

## 🧪 Herramientas de Testing

- Usa axe (extensión o npm) para detectar problemas de a11y.
- Usa Lighthouse (Chrome DevTools) para medir performance y accesibilidad.
- Usa queries de testing-library como `getByRole`, `getByLabelText` para tests accesibles.

---

## ✅ Checklist de Buenas Prácticas

- [ ] Todos los elementos interactivos son accesibles por teclado
- [ ] Imágenes tienen `alt` descriptivo y relevante
- [ ] Contraste de color suficiente (verificar con herramientas)
- [ ] Skeletons/loaders para contenido asíncrono
- [ ] Se usan breakpoints y clases responsivas
- [ ] Se mide y monitorea LCP, TTI, CLS en Lighthouse
- [ ] Se usan etiquetas semánticas y ARIA solo cuando es necesario
- [ ] Modales y drawers tienen focus trap y se pueden cerrar con Escape

---

## 📚 Documentación Relacionada

- [Testing Skill](../testing/SKILL.md)
- [Business Logic](../../reference/business-logic.md)
- [Component Patterns](../../instructions/copilot-instructions.instructions.md)
