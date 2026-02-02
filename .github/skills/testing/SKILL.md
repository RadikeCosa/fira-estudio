---
title: "Testing Patterns - Fira Estudio"
description: "Best practices for unit, integration, and e2e testing in Next.js + Supabase projects"
version: "1.2"
lastUpdated: "2026-02-02"
activationTriggers:
  # Spanish
  - "test"
  - "testing"
  - "prueba"
  - "unitario"
  - "integración"
  
  # English
  - "unit test"
  - "integration"
  - "mock"
  - "coverage"
  
  # Technical
  - "vitest"
  - "node:test"
  - "@testing-library"
---

# Testing Skill

## 🎯 Quick Reference

- **node:test** para lógica pura (utils, SEO, analytics).
- **Vitest** para React, hooks, DOM y browser APIs.
- Tests rápidos, aislados y sin dependencias externas reales.
- Tests junto al código (`*.test.ts(x)`).

---

## 🧭 ¿Cuándo usar cada herramienta?

**node:test**

- ✅ funciones puras
- ✅ transformaciones y cálculos
- ✅ schemas SEO, analytics

**Vitest**

- ✅ componentes React
- ✅ hooks
- ✅ jsdom / browser APIs

---

## ✅ Principios

- AAA (Arrange-Act-Assert)
- nombres descriptivos
- mocks solo de dependencias externas
- cobertura inteligente (no 100% a cualquier costo)

---

## 🧪 Ejemplos esenciales

### node:test (lógica pura)

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify } from "./index";

describe("slugify", () => {
  it("convierte a slug URL-safe", () => {
    assert.equal(slugify("Mantel Floral 150x200"), "mantel-floral-150x200");
  });
});
```

### Vitest (React)

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("renderiza nombre y precio", () => {
    render(
      <ProductCard producto={{ nombre: "Mantel", precio_desde: 15000 }} />,
    );
    expect(screen.getByText("Mantel")).toBeInTheDocument();
  });
});
```

### Mock Supabase (Vitest)

```ts
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ data: [{ id: "1" }], error: null }),
    }),
  }),
}));
```

---

## 📏 Convenciones

- tests junto al código
- `getByRole` y `getByLabelText` para accesibilidad
- tests independientes y deterministas

---

## ✅ Checklist

- [ ] node:test para lógica pura
- [ ] Vitest para React/hooks
- [ ] mocks de Supabase/fetch
- [ ] estados loading/error cubiertos
- [ ] nombres claros en español
- [ ] tests rápidos (<1s por archivo)

---

## 🧰 Comandos

```bash
npm run test:node
npm run test:unit
npm run test:watch
npm run test:coverage
```

---

## 📚 Documentación Relacionada

- [Accessibility & Performance Skill](../accesibility-perfomance/SKILL.md)
- [Business Logic](../../reference/business-logic.md)
- [Component Patterns](../../instructions/copilot-instructions.instructions.md)
