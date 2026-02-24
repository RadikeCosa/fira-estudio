---
applyTo: "**/*.test.ts,**/*.test.tsx"
---

# Testing — Patrones del proyecto

## Cuándo usar cada herramienta

| Herramienta | Usar para |
|---|---|
| `node:test` | Funciones puras, utils, cálculos, schemas SEO |
| `Vitest` | Componentes React, hooks, browser APIs (jsdom) |

## Ejemplos

**node:test (lógica pura):**
```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPrice } from "./utils";

describe("formatPrice", () => {
  it("formatea con separador de miles", () => {
    assert.equal(formatPrice(15000), "$15.000");
  });
});
```

**Vitest (React/hooks):**
```ts
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("ProductCard", () => {
  it("renderiza nombre y precio", () => {
    render(<ProductCard producto={mockProducto} />);
    expect(screen.getByText("Mantel Floral")).toBeInTheDocument();
  });
});
```

**Mock de Supabase:**
```ts
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ data: [mockProducto], error: null }) }),
  }),
}));
```

## Convenciones

- Tests junto al código: `ComponentName.test.tsx`
- Usar queries de accesibilidad: `getByRole`, `getByLabelText`
- Tests independientes y deterministas (sin orden entre sí)
- Objetivo: cubrir paths críticos, no 100% a cualquier costo

## Comandos

```bash
npm run test:node      # node:test
npm run test:unit      # Vitest
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```