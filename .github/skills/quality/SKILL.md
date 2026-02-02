---
title: "Quality - Fira Estudio"
description: "Testing patterns, accessibility, and performance optimization"
version: "2.0"
lastUpdated: "2026-02-02"
activationTriggers:
  # Testing
  - "test"
  - "testing"
  - "vitest"
  - "unitario"
  - "integration"
  - "mock"
  - "node:test"
  
  # Accessibility & Performance
  - "accesibilidad"
  - "accessibility"
  - "a11y"
  - "performance"
  - "lighthouse"
  - "alt"
  - "aria"
---

# Quality Skill

## 🎯 Quick Reference

This skill covers **testing** and **accessibility/performance** - essential for maintaining high-quality, inclusive, and fast applications.

**Key Principles:**
- Test logic with **node:test**, React with **Vitest**
- All users must be able to navigate and purchase
- Site must load fast on mobile and slow connections
- Accessibility and performance are not optional

---

## 📚 Part 1: Testing Patterns

### When to Use Each Tool

**node:test**:
- ✅ Pure functions
- ✅ Transformations and calculations
- ✅ SEO schemas, analytics helpers
- ✅ No dependencies on React or DOM

**Vitest**:
- ✅ React components
- ✅ Custom hooks
- ✅ Browser APIs (jsdom)
- ✅ Anything requiring DOM

---

### Testing Principles

1. **AAA Pattern** (Arrange-Act-Assert)
2. **Descriptive names** - Test should read like documentation
3. **Mock only external dependencies** - Don't mock internal code
4. **Smart coverage** - Not 100% at any cost, focus on critical paths

---

### Examples

#### node:test (Pure Logic)

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify } from "./index";

describe("slugify", () => {
  it("convierte a slug URL-safe", () => {
    assert.equal(slugify("Mantel Floral 150x200"), "mantel-floral-150x200");
  });

  it("maneja caracteres especiales", () => {
    assert.equal(slugify("Café & Té"), "cafe-te");
  });

  it("remueve espacios extras", () => {
    assert.equal(slugify("  Mantel   Floral  "), "mantel-floral");
  });
});
```

---

#### Vitest (React Components)

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("renderiza nombre y precio", () => {
    const producto = {
      nombre: "Mantel Floral",
      precio_desde: 15000,
      slug: "mantel-floral",
      imagenes: [],
    };

    render(<ProductCard producto={producto} />);
    
    expect(screen.getByText("Mantel Floral")).toBeInTheDocument();
    expect(screen.getByText(/15\.000/)).toBeInTheDocument();
  });

  it("muestra imagen principal", () => {
    const producto = {
      nombre: "Mantel",
      precio_desde: 15000,
      slug: "mantel",
      imagenes: [
        { url: "/img/mantel.jpg", es_principal: true, alt: "Mantel" }
      ],
    };

    render(<ProductCard producto={producto} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/img/mantel.jpg");
  });
});
```

---

#### Mock Supabase (Vitest)

```typescript
import { vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        data: [
          {
            id: "1",
            nombre: "Mantel",
            precio_desde: 15000,
          },
        ],
        error: null,
      }),
    }),
  }),
}));
```

---

#### Test Custom Hooks

```typescript
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
  it("locks body scroll when isLocked is true", () => {
    const { rerender } = renderHook(
      ({ isLocked }) => useScrollLock(isLocked),
      { initialProps: { isLocked: false } }
    );

    expect(document.body.style.overflow).toBe("");

    rerender({ isLocked: true });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores original overflow on cleanup", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });
});
```

---

### Testing Conventions

1. **Tests junto al código** - `*.test.ts(x)` files next to source
2. **Use accessibility queries** - `getByRole`, `getByLabelText`
3. **Independent tests** - No dependencies between tests
4. **Fast tests** - < 1s per file

---

### Commands

```bash
npm run test:node       # Run node:test tests
npm run test:unit       # Run Vitest tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

---

## 📚 Part 2: Accessibility

### Core Principles

1. **All users must be able to navigate** - Keyboard, screen reader, touch
2. **Interactive elements accessible by keyboard** - Tab/Enter/Space
3. **Images with descriptive alt text** - Or `alt=""` for decorative
4. **Semantic HTML** - `<nav>`, `<main>`, `<button>`, etc.
5. **Sufficient contrast** - WCAG AA minimum
6. **Dynamic messages announced** - `aria-live` for errors/confirmations
7. **No focus traps** - Modals/drawers with focus management

---

### Skip to Content (Required)

**Location**: `app/layout.tsx`

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg focus:shadow-lg"
>
  Saltar al contenido principal
</a>

<main id="main-content">{children}</main>
```

---

### Focus Trap (MobileNav)

**Location**: `components/layout/MobileNav.tsx`

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

---

### Keyboard Selection (VariationSelector)

**Location**: `components/productos/VariationSelector.tsx`

```tsx
function handleKeyDown(e: React.KeyboardEvent, value: string) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    setSelected(value);
  }
}

<button
  onClick={() => setSelected(value)}
  onKeyDown={(e) => handleKeyDown(e, value)}
  role="radio"
  aria-checked={selected === value}
  tabIndex={0}
>
  {value}
</button>
```

---

### ARIA in Checkboxes (FilterBar)

**Location**: `components/productos/FilterBar.tsx`

```tsx
<input
  type="checkbox"
  aria-label={`Filtrar por categoría ${categoria.nombre}`}
  aria-checked={filters.categorias.includes(categoria.id)}
  onChange={handleChange}
/>
```

---

### Alt Text Best Practices

**Good**:
```tsx
<img alt="Mantel rectangular con estampado floral rojo y blanco, ideal para 6 personas" />
```

**Bad**:
```tsx
<img alt="Mantel" />  // Too generic
<img alt="IMG_1234.jpg" />  // File name
<img />  // Missing alt
```

**Decorative**:
```tsx
<img alt="" />  // Empty alt for decorative images
```

---

## 📚 Part 3: Performance

### Core Principles

1. **Use `<Image>` from Next.js** - Automatic optimization
2. **Skeletons/loaders** - Show loading states
3. **Suspense boundaries** - Better perceived performance
4. **Minimize dependencies** - Keep bundle size small
5. **Cache strategy** - Use Next.js revalidation
6. **Mobile-first** - Optimize for slow connections

---

### Image Optimization

```tsx
import Image from "next/image";

// ✅ CORRECT - Next.js Image with sizes
<Image
  src={producto.imagen_url}
  alt={producto.nombre}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}  // For LCP images
/>

// ❌ WRONG - Regular img tag
<img src={producto.imagen_url} alt={producto.nombre} />
```

---

### Loading States

```tsx
import { Suspense } from "react";

// Option 1: Suspense boundaries
export default function Page() {
  return (
    <Suspense fallback={<ProductosSkeleton />}>
      <ProductosContent />
    </Suspense>
  );
}

// Option 2: loading.tsx file (App Router)
// app/productos/loading.tsx
export default function Loading() {
  return <ProductosSkeleton />;
}
```

---

### Performance Metrics

Monitor with Lighthouse:
- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1
- **TTI** (Time to Interactive) - < 3.5s

---

## 🔗 Integration Examples

### Accessible Product Card with Tests

**Component**:

```typescript
export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <article className="product-card">
      <Link href={`/productos/${producto.slug}`}>
        <Image
          src={producto.imagen_url}
          alt={`${producto.nombre} - Mantel artesanal`}
          width={400}
          height={300}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        <h3>{producto.nombre}</h3>
        <p aria-label={`Precio desde ${formatPrice(producto.precio_desde)}`}>
          Desde {formatPrice(producto.precio_desde)}
        </p>
      </Link>
    </article>
  );
}
```

**Tests**:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  const mockProducto = {
    id: "1",
    nombre: "Mantel Floral",
    precio_desde: 15000,
    slug: "mantel-floral",
    imagen_url: "/img/mantel.jpg",
  };

  it("renderiza con accesibilidad correcta", () => {
    render(<ProductCard producto={mockProducto} />);
    
    // Check semantic HTML
    expect(screen.getByRole("article")).toBeInTheDocument();
    
    // Check image alt text
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", expect.stringContaining("Mantel Floral"));
    
    // Check link
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/productos/mantel-floral");
  });

  it("tiene precio accesible", () => {
    render(<ProductCard producto={mockProducto} />);
    
    const precio = screen.getByLabelText(/Precio desde/);
    expect(precio).toBeInTheDocument();
  });
});
```

---

### Accessible Form with Validation

**Component**:

```typescript
export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form onSubmit={handleSubmit} aria-label="Formulario de contacto">
      <div>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-error">
            {errors.name}
          </p>
        )}
      </div>

      <button type="submit">Enviar</button>
    </form>
  );
}
```

**Tests**:

```typescript
describe("ContactForm", () => {
  it("muestra errores con aria-live", async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole("button", { name: /Enviar/ });
    await userEvent.click(submitButton);
    
    const error = screen.getByRole("alert");
    expect(error).toBeInTheDocument();
  });

  it("input tiene label asociado", () => {
    render(<ContactForm />);
    
    const input = screen.getByLabelText("Nombre");
    expect(input).toHaveAttribute("aria-required", "true");
  });
});
```

---

### Performance-Optimized Product Grid

```typescript
export function ProductGrid({ productos }: { productos: Producto[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto, index) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          priority={index < 3}  // First 3 images are priority (LCP)
        />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing & Auditing Tools

### Accessibility

- **axe DevTools** - Browser extension
- **Lighthouse** - Chrome DevTools
- **WAVE** - Web accessibility evaluator
- **Pa11y** - Automated a11y testing
- **Testing Library** - `getByRole`, `getByLabelText`

### Performance

- **Lighthouse** - Performance score
- **Web Vitals** - Chrome extension
- **Next.js Analytics** - Built-in metrics
- **DevTools Network tab** - Resource loading

---

## 🟡 Priority Improvements (Order)

1. **Skip to content + Focus trap** (HIGH)
2. **ARIA in FilterBar + keyboard in VariationSelector** (HIGH)
3. **Contrast + alt text** (MEDIUM)
4. **aria-live in forms + reduced motion** (MEDIUM/LOW)
5. **focus-visible + landmarks** (LOW)

---

## 📚 Related Documentation

- Testing patterns: `hooks/*.test.ts`, `lib/**/*.test.ts`
- Business logic: `.github/reference/business-logic.md`
- Component patterns: `.github/instructions/copilot-instructions.instructions.md`

---

## ✅ Best Practices Checklist

**Testing:**
- [ ] node:test para lógica pura
- [ ] Vitest para React/hooks
- [ ] Mocks de Supabase/fetch solo cuando necesario
- [ ] Estados loading/error cubiertos
- [ ] Nombres claros y descriptivos
- [ ] Tests rápidos (<1s por archivo)
- [ ] Use accessibility queries (`getByRole`, `getByLabelText`)

**Accessibility:**
- [ ] Navegación 100% por teclado
- [ ] Imágenes con alt descriptivo
- [ ] Contraste WCAG AA
- [ ] `aria-live` en mensajes dinámicos
- [ ] Focus trap en overlays
- [ ] Skip to content link
- [ ] Semantic HTML (`<nav>`, `<main>`, `<button>`)
- [ ] Lighthouse a11y > 90

**Performance:**
- [ ] Use `<Image>` de Next.js
- [ ] Skeletons/loaders para contenido asíncrono
- [ ] Suspense boundaries
- [ ] Cache strategy implementado
- [ ] Mobile-first responsive
- [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Lighthouse performance > 90
