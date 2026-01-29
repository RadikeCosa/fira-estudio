---
title: "Testing Patterns - Fira Estudio"
description: "Best practices for unit, integration, and e2e testing in Next.js + Supabase projects"
version: "1.0"
lastUpdated: "2026-01-29"
activationTriggers:
  - "test"
  - "testing"
  - "vitest"
  - "unitario"
  - "integration"
  - "mock"
---

# Testing Skill

## 🎯 Quick Reference

- Usa Vitest para unitarios/integración y React Testing Library para componentes.
- Los tests deben ser predecibles, rápidos y no depender de servicios externos reales.
- Ubica los archivos de test junto al código (`*.test.ts(x)`).

---

## 🧪 Tipos de Tests

- **Unitarios:** Testean funciones puras, hooks, utils y lógica de negocio.
- **Integración:** Testean componentes con dependencias (ej: hooks, contextos, queries mockeadas).
- **E2E (futuro):** Testean flujos completos (no implementado aún).

---

## 🗂️ Estructura de Archivos

- Coloca los tests junto al archivo a testear:
  - `components/ContactForm.tsx` → `components/ContactForm.test.tsx`
  - `hooks/useRateLimit.ts` → `hooks/useRateLimit.test.ts`
- Usa nombres descriptivos para los describe/it.

---

## 🧩 Patrones y Ejemplos

### Test de Hook

```typescript
import { renderHook, act } from "@testing-library/react";
import { useRateLimit } from "./useRateLimit";

test("bloquea después de 5 acciones", () => {
  const { result } = renderHook(() =>
    useRateLimit({ maxActions: 5, windowMs: 60000, key: "test" }),
  );
  for (let i = 0; i < 5; i++) {
    act(() => result.current.recordAction());
  }
  expect(result.current.isRateLimited).toBe(true);
});
```

### Test de Componente

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "./ContactForm";

test("muestra mensaje de éxito al enviar", async () => {
  render(<ContactForm />);
  fireEvent.change(screen.getByLabelText(/nombre/i), {
    target: { value: "Juan" },
  });
  fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
  expect(
    await screen.findByText(/¡Gracias por tu consulta!/i),
  ).toBeInTheDocument();
});
```

### Mock de Supabase

```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ data: [{ id: 1 }], error: null }),
    }),
  }),
}));
```

---

## 🛡️ Buenas Prácticas

- Mockea todas las llamadas a Supabase y APIs externas.
- Usa datos de ejemplo alineados al schema real.
- Testea estados de loading, error y éxito.
- Verifica accesibilidad básica (`getByRole`, `getByLabelText`).
- No dependas de orden de ejecución ni de datos globales.
- Mantén los tests rápidos (<1s por archivo).

---

## ✅ Checklist de Testing

- [ ] Todos los hooks y utils tienen tests unitarios
- [ ] Componentes críticos tienen tests de integración
- [ ] Se mockean servicios externos (Supabase, fetch)
- [ ] Se testean estados de loading/error
- [ ] Se verifica accesibilidad mínima
- [ ] Los tests corren en CI y pasan sin errores

---

## 🧰 Herramientas

- [Vitest](https://vitest.dev/) (unitarios/integración)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- [msw](https://mswjs.io/) (para mocks de red, opcional)

---

## 📚 Documentación Relacionada

- [Accessibility & Performance Skill](../accesibility-perfomance/SKILL.md)
- [Business Logic](../../reference/business-logic.md)
- [Component Patterns](../../instructions/copilot-instructions.instructions.md)
