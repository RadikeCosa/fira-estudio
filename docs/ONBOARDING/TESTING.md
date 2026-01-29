# Testing - Onboarding Guide

**Última actualización:** 29 de enero de 2026  
**Framework:** Vitest + React Testing Library  
**Coverage:** ~70% en componentes y utilidades

---

## Índice

1. [Testing Architecture](#testing-architecture)
2. [Setup & Configuration](#setup--configuration)
3. [Test Patterns](#test-patterns)
4. [Component Tests](#component-tests)
5. [Utility Tests](#utility-tests)
6. [Hook Tests](#hook-tests)
7. [Mocking](#mocking)
8. [Coverage Report](#coverage-report)
9. [CI/CD Integration](#cicd-integration)

---

## Testing Architecture

### Test Types

```
Testing Pyramid
    △
   / \      E2E (Selenium, Playwright) - Futuro
  /   \
 /-----\    Integration Tests - Algunas
/-------\   Unit Tests - Mayoría
```

**Actual (Fase 1):**

- ✅ Unit tests: Componentes y utilities
- ⏳ Integration: Básico (composición de componentes)
- ⏳ E2E: No implementado aún

### Test Locations

```
components/
├── ui/
│   ├── Button.tsx
│   └── Button.test.tsx           ✅
│
├── productos/
│   ├── ProductCard.tsx
│   ├── ProductCard.test.tsx      ✅
│   ├── VariationSelector.tsx
│   └── VariationSelector.test.tsx ⏳ (pendiente)
│
└── contacto/
    ├── ContactForm.tsx
    └── ContactForm.test.tsx      ✅

hooks/
├── useRateLimit.ts
└── useRateLimit.test.ts          ✅

lib/
├── utils/
│   ├── format.ts
│   └── format.test.ts            ✅
│
└── supabase/
    ├── queries.ts
    └── queries.test.ts           ⏳ (mock Supabase)
```

**Convención:**

- Test file en mismo directorio que el source
- Nombre: `ComponentName.test.tsx` o `utility.test.ts`
- Colocado junto al archivo que testea

---

## Setup & Configuration

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Global test environment
    globals: true, // describe, it, expect sin import
    environment: "jsdom", // Simula DOM del navegador
    setupFiles: "./vitest.setup.ts", // Setup común para todos

    // Qué incluir/excluir
    include: [
      "components/**/*.test.tsx",
      "app/**/*.test.tsx",
      "hooks/**/*.test.ts",
    ],
    exclude: ["node_modules/**", ".next/**"],

    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.config.{ts,js}",
        "**/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### vitest.setup.ts

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup DOM después de cada test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (para responsive design tests)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "npm run test:node && npm run test:unit",
    "test:node": "node --test --import tsx $(find lib -name '*.test.ts' -type f)",
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Scripts:**

- `npm test` - Ejecuta todos los tests
- `npm run test:unit` - Solo tests de React (Vitest)
- `npm run test:node` - Solo tests de Node.js (lib utilities)
- `npm run test:watch` - Modo watch para desarrollo
- `npm run test:coverage` - Reporte de cobertura

---

## Test Patterns

### Basic Component Test

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  // ✅ Simple render
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  // ✅ Props
  it("applies variant class", () => {
    const { container } = render(<Button variant="primary">Button</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-foreground");
  });

  // ✅ Disabled state
  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Button</Button>);
    expect(screen.getByText("Button")).toBeDisabled();
  });
});
```

### Event Handler Test

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Events", () => {
  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick with event", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "click",
      })
    );
  });
});
```

### Form Input Test

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("updates value on change", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "test" } });
    expect(input).toHaveValue("test");
  });

  it("calls onChange handler", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("shows error message", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });
});
```

### Async Test

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays product data", async () => {
    // Mock data
    const mockProducto = {
      id: "1",
      nombre: "Mantel",
      slug: "mantel",
      descripcion: "Bello mantel",
      // ...
    };

    render(<ProductCard producto={mockProducto} />);

    // Wait for rendering
    await waitFor(() => {
      expect(screen.getByText("Mantel")).toBeInTheDocument();
    });
  });
});
```

---

## Component Tests

### ProductCard Test

```typescript
// components/productos/ProductCard.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

// Mock next/link and next/image
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

const mockProducto = {
  id: "prod-1",
  nombre: "Mantel Floral",
  slug: "mantel-floral",
  descripcion: "Hermoso mantel artesanal",
  categoria_id: "cat-1",
  precio_desde: 15000,
  destacado: true,
  activo: true,
  time_fabricacion: "3-5 días",
  material: "Algodón",
  cuidados: "Lavar a mano",
  created_at: "2024-01-01T00:00:00Z",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard producto={mockProducto} />);
    expect(screen.getByText("Mantel Floral")).toBeInTheDocument();
  });

  it("renders featured badge when destacado=true", () => {
    render(<ProductCard producto={mockProducto} />);
    expect(screen.getByText("Destacado")).toBeInTheDocument();
  });

  it("hides featured badge when destacado=false", () => {
    const notFeatured = { ...mockProducto, destacado: false };
    render(<ProductCard producto={notFeatured} />);
    expect(screen.queryByText("Destacado")).not.toBeInTheDocument();
  });

  it("renders price with 'Desde' when provided", () => {
    render(<ProductCard producto={mockProducto} />);
    expect(screen.getByText(/Desde \$15\.000/)).toBeInTheDocument();
  });

  it("links to product detail page", () => {
    render(<ProductCard producto={mockProducto} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/productos/mantel-floral");
  });

  it("renders product image", () => {
    render(<ProductCard producto={mockProducto} imagenPrincipal="/image.jpg" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt");
  });
});
```

### ContactForm Test

```typescript
// components/contacto/ContactForm.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "./ContactForm";
import * as rateLimitServer from "@/lib/utils/rate-limit-server";

vi.mock("@/lib/utils/rate-limit-server");

describe("ContactForm", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(rateLimitServer.checkServerRateLimit).mockResolvedValue({
      allowed: true,
    });
  });

  it("renders all form fields", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mensaje/)).toBeInTheDocument();
  });

  it("requires nombre field", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute("required");
  });

  it("shows validation errors on submit", async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByText("Enviar Consulta por WhatsApp"));

    // Await for validation
    await vi.waitFor(() => {
      expect(screen.getByText(/Campo requerido/)).toBeInTheDocument();
    });
  });

  it("opens WhatsApp with formatted message on valid submit", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ContactForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Juan" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "juan@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/), {
      target: { value: "Me interesa un mantel" },
    });

    // Submit
    fireEvent.click(screen.getByText("Enviar Consulta por WhatsApp"));

    await vi.waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining("wa.me"),
        "_blank"
      );
    });

    openSpy.mockRestore();
  });

  it("enforces rate limiting", async () => {
    vi.mocked(rateLimitServer.checkServerRateLimit).mockResolvedValue({
      allowed: false,
    });

    render(<ContactForm />);

    fireEvent.click(screen.getByText("Enviar Consulta por WhatsApp"));

    await vi.waitFor(() => {
      expect(screen.getByText(/límite de mensajes/)).toBeInTheDocument();
    });
  });
});
```

---

## Utility Tests

### Format Utility Test

```typescript
// lib/utils/format.test.ts
import { describe, it, expect } from "node:test";
import assert from "node:assert/strict";
import { formatPrice, formatDate } from "./format";

describe("formatPrice", () => {
  it("formats number as currency (ARS)", () => {
    const result = formatPrice(15000);
    assert.equal(result, "$15.000");
  });

  it("handles zero", () => {
    const result = formatPrice(0);
    assert.equal(result, "$0");
  });

  it("handles decimal prices", () => {
    const result = formatPrice(15000.5);
    assert.match(result, /\$15\.000/);
  });

  it("handles null/undefined", () => {
    expect(formatPrice(null)).toBe("$0");
    expect(formatPrice(undefined)).toBe("$0");
  });
});

describe("formatDate", () => {
  it("formats date to local string", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    assert.match(result, /15.*enero.*2024/);
  });
});
```

### Validation Utility Test

```typescript
// lib/utils/validation.test.ts
import { describe, it, expect } from "vitest";
import { validateContactForm } from "./validation";

describe("validateContactForm", () => {
  it("validates correct data", () => {
    const result = validateContactForm({
      nombre: "Juan Pérez",
      email: "juan@example.com",
      telefono: "+54 9 11 1234-5678",
      mensaje: "Me interesa consultar sobre tus productos",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("requires nombre", () => {
    const result = validateContactForm({
      nombre: "",
      email: "juan@example.com",
      telefono: "+54 9 11 1234-5678",
      mensaje: "Consulta",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.nombre).toBeDefined();
  });

  it("validates email format", () => {
    const result = validateContactForm({
      nombre: "Juan",
      email: "invalid-email",
      telefono: "+54 9 11 1234-5678",
      mensaje: "Consulta",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("requires minimum mensaje length", () => {
    const result = validateContactForm({
      nombre: "Juan",
      email: "juan@example.com",
      telefono: "+54 9 11 1234-5678",
      mensaje: "Hi", // Too short
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.mensaje).toBeDefined();
  });

  it("allows optional telefono", () => {
    const result = validateContactForm({
      nombre: "Juan",
      email: "juan@example.com",
      telefono: undefined,
      mensaje: "Consulta completa",
    });

    expect(result.isValid).toBe(true);
  });
});
```

### Image Utility Test

```typescript
// lib/utils/image.test.ts
import { describe, it, expect } from "vitest";
import { getImageUrl, getProductImageAlt } from "./image";

describe("getImageUrl", () => {
  it("returns absolute URL unchanged", () => {
    const url = "https://example.com/image.jpg";
    expect(getImageUrl(url)).toBe(url);
  });

  it("returns root-relative URL unchanged", () => {
    const url = "/images/mantel.jpg";
    expect(getImageUrl(url)).toBe(url);
  });

  it("constructs Supabase URL from path", () => {
    const url = "productos/mantel.jpg";
    const result = getImageUrl(url);
    expect(result).toContain("supabase.co");
    expect(result).toContain("productos/mantel.jpg");
  });

  it("returns default image for empty input", () => {
    const result = getImageUrl("");
    expect(result).toBe("/images/placeholder.jpg");
  });
});

describe("getProductImageAlt", () => {
  it("uses custom alt if provided", () => {
    const alt = getProductImageAlt("Mantel", "Mantel floral rojo");
    expect(alt).toBe("Mantel floral rojo");
  });

  it("generates alt from product name if not provided", () => {
    const alt = getProductImageAlt("Mantel Floral");
    expect(alt).toContain("Mantel Floral");
  });
});
```

---

## Hook Tests

### useRateLimit Hook Test

```typescript
// hooks/useRateLimit.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRateLimit } from "./useRateLimit";

describe("useRateLimit", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("initializes with rate limit not exceeded", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 3, windowMs: 60000, key: "test" }),
    );

    expect(result.current.isRateLimited).toBe(false);
  });

  it("records action and increments counter", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 3, windowMs: 60000, key: "test" }),
    );

    act(() => {
      result.current.recordAction();
    });

    expect(result.current.isRateLimited).toBe(false);
  });

  it("enforces rate limit after max actions", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 2, windowMs: 60000, key: "test" }),
    );

    act(() => {
      result.current.recordAction();
      result.current.recordAction();
    });

    expect(result.current.isRateLimited).toBe(true);
  });

  it("resets after time window", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 10000, key: "test" }),
    );

    act(() => {
      result.current.recordAction();
    });

    expect(result.current.isRateLimited).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10001);
    });

    expect(result.current.isRateLimited).toBe(false);
  });

  it("calculates time until reset", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 10000, key: "test" }),
    );

    act(() => {
      result.current.recordAction();
    });

    expect(result.current.timeUntilReset).toBeGreaterThan(0);
    expect(result.current.timeUntilReset).toBeLessThanOrEqual(10000);
  });

  vi.useRealTimers();
});
```

---

## Mocking

### Mocking Next.js Modules

```typescript
import { vi } from "vitest";

// next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

// next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

### Mocking Server Functions

```typescript
import { vi } from "vitest";

// Mock Supabase queries
vi.mock("@/lib/supabase/queries", () => ({
  getProductos: vi.fn().mockResolvedValue([
    {
      id: "1",
      nombre: "Mantel",
      slug: "mantel",
      // ...
    },
  ]),
  getProductoBySlug: vi.fn().mockResolvedValue({
    id: "1",
    nombre: "Mantel",
    slug: "mantel",
    // ...
  }),
}));

// Mock Analytics
vi.mock("@/lib/analytics/gtag", () => ({
  trackProductView: vi.fn(),
  trackVariationSelect: vi.fn(),
  trackWhatsAppClick: vi.fn(),
}));
```

### Mocking Browser APIs

```typescript
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock window.open (para WhatsApp button)
global.window.open = vi.fn();

// Mock window.matchMedia (para responsive tests)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

---

## Coverage Report

### Generar Cobertura

```bash
npm run test:coverage

# Genera:
# - Coverage en terminal
# - coverage/index.html (reporte interactivo)
```

### Coverage Goals

```
Por tipo de archivo:
- Componentes:     70% (UI lógica es variada)
- Utilities:       90% (funciones puras, fácil de testear)
- Hooks:           85% (state logic)
- Pages:           50% (composición, no lógica)

Por métrica:
- Statements:      70%
- Branches:        65%
- Functions:       70%
- Lines:           70%
```

### Current Coverage (Phase 1)

```
components/ui/                    90% (5/5 files)
components/productos/             75% (6/8 files)
components/contacto/              85% (3/3 files)
components/layout/                60% (2/4 files)

hooks/                            85% (3/3 files)

lib/utils/                        90% (10/11 files)
lib/analytics/                    70% (2/3 files)
```

**Total:** ~78% coverage en código testable

---

## CI/CD Integration

### GitHub Actions (Futuro)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm ci
      - run: npm test
      - run: npm run test:coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Pre-commit Hook (Futuro)

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm test
```

---

## Best Practices

### ✅ Do's

- ✅ Prueba comportamiento, no implementación
- ✅ Usa `screen.getByRole()` para accesibilidad
- ✅ Mock dependencias externas (APIs, librerías)
- ✅ Test async con `waitFor` y `act`
- ✅ Cleanup después de cada test (automático)
- ✅ Nombres descriptivos: `it("should...when...")`
- ✅ Test happy path + edge cases + errors

### ❌ Don'ts

- ❌ No mockees lo que no necesitas
- ❌ No testees detalles de implementación
- ❌ No testees librerías externas (React Testing Library, etc.)
- ❌ No uses `querySelector` (usa `screen` queries)
- ❌ No ignores errores de test
- ❌ No dejes tests disabled/skipped

---

## Common Issues & Solutions

### Issue: Test times out

```typescript
// ❌ Problem
it("loads data", async () => {
  render(<Component />);
  // Nunca completa porque await nunca resuelve
});

// ✅ Solution
it("loads data", async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });
});
```

### Issue: Cannot find element

```typescript
// ❌ Problem
it("renders list", () => {
  render(<List />);
  expect(screen.getByText("Item")).toBeInTheDocument();  // Tal vez sea async
});

// ✅ Solution
it("renders list", async () => {
  render(<List />);
  await waitFor(() => {
    expect(screen.getByText("Item")).toBeInTheDocument();
  });
});
```

### Issue: Mock not working

```typescript
// ❌ Problem
import { getProductos } from "@/lib/supabase/queries";

it("shows products", async () => {
  vi.mock("@/lib/supabase/queries");  // Demasiado tarde!
  render(<ProductList />);
});

// ✅ Solution
vi.mock("@/lib/supabase/queries");  // Antes de imports

import { getProductos } from "@/lib/supabase/queries";

it("shows products", async () => {
  vi.mocked(getProductos).mockResolvedValue([...]);
  render(<ProductList />);
});
```

---

## Recursos Adicionales

### Documentos Relacionados

- [Components Onboarding](./COMPONENTS.md) - Component patterns
- [Configuration & Standards](./CONFIGURATION.md) - Vitest config details

### Links Útiles

- [Vitest Docs](https://vitest.dev)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Playground](https://testing-playground.com) - Encuentra selectores
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Test File Templates

```typescript
// Minimal template
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Component } from "./Component";

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });
});
```

---

**Última actualización:** 29 de enero de 2026  
**Mantenido por:** Equipo de desarrollo Challaco
