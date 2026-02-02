# Style Management Guide

## Objetivo

Centralizar todos los estilos en `lib/design/tokens.ts` para que cambios visuales NO requieran tocar componentes.

---

## 🎨 Estructura de Tokens

### Ubicación

```
lib/design/
├── tokens.ts           # Todos los design tokens (colores, tipografía, spacing)
└── (theme.ts)          # Referencia de tema (opcional)

app/globals.css         # CSS variables que alimentan tokens.ts
```

### Qué Son Design Tokens

Un design token es una variable reutilizable que representa un valor visual:

```typescript
// Ejemplo: COLORS.foreground
// Representa el color principal de texto
// Definido en CSS como --foreground
// Usado en HTML como: class="text-foreground"
```

---

## 🎯 Tipos de Tokens

### 1. COLORS

```typescript
// lib/design/tokens.ts
export const COLORS = {
  foreground: "text-foreground", // Main text color
  background: "bg-background", // Main background
  accent: "text-accent bg-accent", // Accent color
  muted: "text-muted-foreground", // Secondary text
  border: "border-border", // Border color
  error: "text-red-600 bg-red-50", // Error states
  success: "text-green-600 bg-green-50", // Success states
} as const;
```

**Definición CSS:**

```css
/* app/globals.css */
:root {
  --foreground: #000000;
  --background: #ffffff;
  --accent: #171717;
  --muted-foreground: #666666;
  --border: #e5e5e5;
}
```

**Uso en Componentes:**

```typescript
import { COLORS } from "@/lib/design/tokens";

<div className={COLORS.foreground}>Texto principal</div>
<button className={COLORS.accent}>Botón</button>
```

### 2. TYPOGRAPHY

```typescript
export const TYPOGRAPHY = {
  heading: {
    page: "text-5xl font-extrabold tracking-tighter sm:text-6xl",
    section: "text-3xl font-bold tracking-tight",
    subsection: "text-2xl font-semibold",
    card: "text-xl font-semibold",
  },
  body: {
    base: "text-base leading-relaxed",
    large: "text-lg leading-relaxed",
    small: "text-sm leading-relaxed",
  },
} as const;
```

**Uso:**

```typescript
import { TYPOGRAPHY } from "@/lib/design/tokens";

<h1 className={TYPOGRAPHY.heading.page}>Título de Página</h1>
<p className={TYPOGRAPHY.body.base}>Párrafo normal</p>
```

### 3. SPACING

```typescript
export const SPACING = {
  sectionPadding: {
    sm: "px-4 py-6 sm:px-6 sm:py-8",
    md: "px-4 py-12 sm:px-8 sm:py-20 lg:px-16 lg:py-28",
    lg: "px-4 py-20 sm:px-8 sm:py-32 lg:px-16 lg:py-40",
  },
  componentPadding: {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  },
  gap: {
    tight: "gap-2",
    normal: "gap-4",
    loose: "gap-6",
  },
} as const;
```

**Uso:**

```typescript
<section className={SPACING.sectionPadding.md}>
  {/* Content */}
</section>
```

### 4. COMPONENTS

```typescript
export const COMPONENTS = {
  button: {
    base: "px-6 py-3 rounded-lg font-semibold transition-colors duration-200",
    primary: "bg-foreground text-background hover:bg-accent",
    secondary: "bg-muted border border-border hover:bg-border",
    hover: "hover:shadow-lg hover:scale-105",
    focus: "focus:outline-none focus:ring-2 focus:ring-accent",
  },
  input: {
    base: "px-4 py-2 rounded-lg border border-border bg-background text-foreground",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
    error: "border-red-500 focus:ring-red-500",
    disabled: "bg-muted opacity-50 cursor-not-allowed",
  },
  card: {
    base: "rounded-lg border border-border bg-background shadow-sm",
    hover: "hover:shadow-md hover:border-accent transition-all duration-200",
    interactive: "cursor-pointer",
  },
} as const;
```

**Uso:**

```typescript
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

<button className={cn(
  COMPONENTS.button.base,
  COMPONENTS.button.primary,
  COMPONENTS.button.focus,
)}>
  Click me
</button>
```

### 5. LAYOUT

```typescript
export const LAYOUT = {
  container: {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "w-full",
  },
  grid: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-4",
    },
    gap: "gap-6",
  },
} as const;
```

---

## 🔄 Cambiar Estilos Globales

### Cambio: Actualizar color primario

**Antes:**

```css
:root {
  --foreground: #000000; /* Negro */
}
```

**Después:**

```css
:root {
  --foreground: #2563eb; /* Azul */
}
```

**Resultado:** Todos los elementos con `text-foreground` actualizan automáticamente.

### Cambio: Aumentar tamaño de heading

**Antes:**

```typescript
export const TYPOGRAPHY = {
  heading: {
    page: "text-5xl font-extrabold", // 3rem
  },
};
```

**Después:**

```typescript
export const TYPOGRAPHY = {
  heading: {
    page: "text-7xl font-extrabold", // 3.75rem
  },
};
```

**Resultado:** Todos los h1 en la app aumentan de tamaño.

---

## 🧩 UI Components con Tokens

### Button Component

```typescript
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: COMPONENTS.button.primary,
    secondary: COMPONENTS.button.secondary,
  };

  return (
    <button
      className={cn(
        COMPONENTS.button.base,
        COMPONENTS.button.focus,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
```

**Uso:**

```typescript
<Button variant="primary" size="md">
  Agregar al carrito
</Button>
```

### Card Component

```typescript
import { COMPONENTS, SPACING } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface CardProps {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Card({
  hover = false,
  padding = "md",
  children,
}: CardProps) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        COMPONENTS.card.base,
        hover && COMPONENTS.card.hover,
        paddingClasses[padding],
      )}
    >
      {children}
    </div>
  );
}
```

**Uso:**

```typescript
<Card hover padding="md">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

---

## 📝 Crear Nuevo Token

### Paso 1: Identificar el tipo

¿Qué es?

- Color → COLORS
- Tamaño de fuente → TYPOGRAPHY
- Distancia/relleno → SPACING
- Estilos de componente → COMPONENTS

### Paso 2: Agregar a tokens.ts

```typescript
export const COLORS = {
  // ... existing colors
  warning: "text-yellow-600 bg-yellow-50", // ← Nuevo
};
```

### Paso 3: (Opcional) Agregar CSS variable

Si necesitas más control:

```css
:root {
  --warning-fg: #d97706;
  --warning-bg: #fffbeb;
}
```

### Paso 4: Usar en componentes

```typescript
import { COLORS } from "@/lib/design/tokens";

<div className={COLORS.warning}>Advertencia</div>
```

---

## 🎨 Estender Design System

### Agregar Nuevo Tamaño de Componente

```typescript
export const COMPONENTS = {
  button: {
    base: "px-6 py-3 rounded-lg",
    sizes: {
      xs: "px-2 py-1 text-xs", // ← Nuevo
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    },
  },
};
```

### Agregar Variante de Color

```typescript
export const COMPONENTS = {
  button: {
    primary: "bg-foreground text-background",
    secondary: "bg-muted border border-border",
    danger: "bg-red-600 text-white hover:bg-red-700", // ← Nuevo
  },
};
```

---

## 🧪 Testing Tokens

### Validar que tokens existen

```typescript
// __tests__/lib/design/tokens.test.ts

import { COLORS, TYPOGRAPHY, SPACING, COMPONENTS } from "@/lib/design/tokens";

describe("Design Tokens", () => {
  it("debería exportar todos los tokens", () => {
    expect(COLORS).toBeDefined();
    expect(TYPOGRAPHY).toBeDefined();
    expect(SPACING).toBeDefined();
    expect(COMPONENTS).toBeDefined();
  });

  it("COLORS debería tener colores básicos", () => {
    expect(COLORS).toHaveProperty("foreground");
    expect(COLORS).toHaveProperty("background");
    expect(COLORS).toHaveProperty("accent");
  });

  it("TYPOGRAPHY debería tener headings y body", () => {
    expect(TYPOGRAPHY.heading).toBeDefined();
    expect(TYPOGRAPHY.body).toBeDefined();
  });
});
```

---

## 📋 Anti-Patterns (Evitar)

### ❌ DON'T: Inline styles

```typescript
// ❌ INCORRECTO
<div style={{ padding: "20px", color: "red" }}>
```

### ✅ DO: Usar tokens

```typescript
// ✅ CORRECTO
<div className={cn(SPACING.componentPadding.md, COLORS.error)}>
```

### ❌ DON'T: Duplicar clases de estilo

```typescript
// ❌ INCORRECTO
<button className="px-6 py-3 rounded-lg bg-foreground text-background">
<button className="px-6 py-3 rounded-lg bg-foreground text-background">
```

### ✅ DO: Crear componente reutilizable

```typescript
// ✅ CORRECTO
<Button variant="primary">Button 1</Button>
<Button variant="primary">Button 2</Button>
```

---

## 🔄 Mantenimiento

### Refactorización: Renombrar token

Si necesitas renombrar `COLORS.accent` → `COLORS.primary`:

1. Actualiza `lib/design/tokens.ts`
2. TypeScript te mostrará todos los usos que rompen
3. Actualiza todos los componentes afectados
4. Valida que todo se vea bien

---

## 📚 Referencias

- `lib/design/tokens.ts` - Todos los tokens
- `app/globals.css` - CSS variables
- `lib/utils.ts` - `cn()` helper para combinar clases
- `components/ui/` - UI components que usan tokens
- Tailwind CSS Documentation
