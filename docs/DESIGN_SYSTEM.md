# Design System - Muma Estudio
## Boutique/Minimalist Design System

Este documento describe el nuevo sistema de diseño boutique/minimalista para Muma Estudio, implementado en el PR #1.

---

## 🎨 Paleta de Colores

### Modo Light
```css
--background: 40 20% 97%;      /* #F9F8F6 - Beige claro */
--foreground: 0 0% 10%;        /* #1a1a1a - Negro suave */
--muted: 240 5% 45%;           /* #71717a - Zinc-500 */
--muted-foreground: 240 4% 65%; /* #a1a1aa - Zinc-400 */
--border: 240 6% 90%;          /* #e4e4e7 - Zinc-200 */
--accent: 15 44% 45%;          /* #A45C40 - Terracota */
--primary: 15 44% 45%;         /* Alias de accent */
```

### Modo Dark
```css
--background: 0 0% 7%;         /* #121212 */
--foreground: 0 0% 98%;        /* #fafafa */
--muted: 240 4% 15%;           /* #27272a */
--muted-foreground: 240 5% 45%; /* #71717a */
--border: 240 4% 15%;          /* #27272a */
--accent: 15 44% 45%;          /* Mantener terracota */
--primary: 15 44% 45%;         /* Mantener terracota */
```

**Formato:** Todos los colores usan HSL para facilitar manipulación en dark mode.

---

## ✍️ Tipografía

### Fuentes

#### Playfair Display (Headings)
- **Variable CSS:** `--font-display`
- **Uso:** Títulos y headings
- **Pesos:** 400 (Regular), 700 (Bold)
- **Características:** Serif elegante, tracking tight

#### Inter (Body)
- **Variable CSS:** `--font-sans`
- **Uso:** Texto de cuerpo
- **Pesos:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold)
- **Características:** Sans-serif moderna, alta legibilidad

### Escala de Tipografía

```typescript
// Headings (font-display)
TYPOGRAPHY.heading.hero    // text-5xl md:text-6xl leading-[1.1] tracking-tight
TYPOGRAPHY.heading.page    // text-4xl tracking-tight
TYPOGRAPHY.heading.section // text-3xl tracking-tight
TYPOGRAPHY.heading.card    // text-xl

// Body text (font-sans)
TYPOGRAPHY.body.base       // text-base leading-relaxed
TYPOGRAPHY.body.large      // text-lg leading-relaxed
TYPOGRAPHY.body.small      // text-sm leading-relaxed
TYPOGRAPHY.body.muted      // text-zinc-500 dark:text-zinc-400

// Decorative text
TYPOGRAPHY.decorative.badge // text-[10px] tracking-widest uppercase font-medium
TYPOGRAPHY.decorative.label // text-xs tracking-[0.2em] uppercase
```

---

## 🔘 Componentes

### Button

Estilos minimalistas con uppercase y tracking amplio.

#### Variantes

**Primary** (Default)
```tsx
<Button variant="primary">Comprar</Button>
// bg-zinc-900 dark:bg-zinc-100
// text-white dark:text-zinc-900
```

**Secondary**
```tsx
<Button variant="secondary">Ver Más</Button>
// border border-zinc-300 dark:border-zinc-700
// hover:border-zinc-900 dark:hover:border-zinc-100
```

**Accent**
```tsx
<Button variant="accent">Destacado</Button>
// bg-primary text-white
// hover:bg-opacity-90
```

**Ghost**
```tsx
<Button variant="ghost">Cancelar</Button>
// hover:bg-zinc-100 dark:hover:bg-zinc-800
```

#### Tamaños

```tsx
<Button size="sm">Small</Button>   // px-6 py-2.5 text-xs
<Button size="md">Medium</Button>  // px-8 py-4 text-sm (default)
<Button size="lg">Large</Button>   // px-12 py-5 text-base
```

#### Uso como Link

```tsx
// Link interno
<Button href="/productos">Ver Productos</Button>

// Link externo
<Button href="https://example.com" external>
  Sitio Externo
</Button>
```

---

### DecorativeBadge

Badges estilo boutique con dos modos de uso:

#### Modo 1: Línea Decorativa (Backward Compatible)
```tsx
<DecorativeBadge />
// Renderiza línea horizontal decorativa con gradiente
```

#### Modo 2: Badge con Texto

**Outline** (Default)
```tsx
<DecorativeBadge variant="outline">Pieza Única</DecorativeBadge>
// border border-primary text-primary
// text-[10px] tracking-widest uppercase
```

**Filled**
```tsx
<DecorativeBadge variant="filled">Nuevo</DecorativeBadge>
// bg-primary text-white
// text-[10px] tracking-tighter uppercase
```

---

## 📐 Border Radius (Minimalista)

```typescript
--radius: 0px;       // Default - bordes rectos
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-xl: 12px;
```

**Filosofía:** Bordes rectos por defecto para estética minimalista. Usar bordes redondeados solo cuando sea necesario para suavizar elementos específicos.

---

## 🎯 Design Tokens

Todos los tokens están centralizados en `lib/design/tokens.ts` para garantizar consistencia.

### Colores
```typescript
COLORS.foreground  // text-foreground
COLORS.background  // bg-background
COLORS.muted       // text-muted
COLORS.mutedbg     // bg-muted
COLORS.border      // border-border
COLORS.accent      // text-accent bg-accent
COLORS.primary     // text-primary bg-primary
```

### Spacing
```typescript
SPACING.section.sm    // py-12 px-6
SPACING.section.md    // py-20 px-6
SPACING.section.lg    // py-24 px-6
SPACING.container     // max-w-lg mx-auto
SPACING.containerWide // max-w-7xl mx-auto
```

### Componentes
```typescript
COMPONENTS.badge.outline      // Badge con borde
COMPONENTS.badge.filled       // Badge relleno
COMPONENTS.button.primary     // Botón principal
COMPONENTS.button.secondary   // Botón secundario
COMPONENTS.button.accent      // Botón de acento
COMPONENTS.button.link        // Botón estilo link
COMPONENTS.card.base          // Base de tarjeta
COMPONENTS.divider            // Línea divisoria
```

---

## 🚀 Uso en Código

### Importar Tokens
```typescript
import { TYPOGRAPHY, SPACING, COMPONENTS } from "@/lib/design/tokens";
```

### Ejemplo de Componente
```tsx
export function HeroSection() {
  return (
    <section className={SPACING.section.lg}>
      <div className={SPACING.containerWide}>
        <DecorativeBadge />
        <h1 className={TYPOGRAPHY.heading.hero}>
          Textiles Artesanales
        </h1>
        <p className={TYPOGRAPHY.body.large}>
          Piezas únicas hechas a mano
        </p>
        <Button variant="accent" size="lg" href="/productos">
          Ver Colección
        </Button>
      </div>
    </section>
  );
}
```

---

## ✅ Tests

Todos los componentes del design system tienen tests completos:

- **Button:** 13 tests (variantes, tamaños, links, estados)
- **DecorativeBadge:** 6 tests (backward compatibility, variantes)
- **Total:** 189 tests pasando

```bash
npm run test:unit
```

---

## 📦 Archivos Modificados

1. **app/globals.css** - Paleta de colores y variables CSS
2. **app/layout.tsx** - Fuentes Playfair Display + Inter
3. **lib/design/tokens.ts** - Design tokens centralizados
4. **components/ui/Button.tsx** - Estilos minimalistas
5. **components/ui/DecorativeBadge.tsx** - Nuevas variantes
6. **tailwind.config.ts** - Configuración de fuentes y border radius

---

## 🎨 Principios de Diseño

1. **Minimalista:** Bordes rectos, espaciado generoso, elementos limpios
2. **Boutique:** Tipografía serif para headings, detalles elegantes
3. **Accesible:** Alto contraste, estados claramente definidos
4. **Responsive:** Mobile-first approach
5. **Type-safe:** Todos los tokens tipados en TypeScript
6. **Consistente:** Tokens centralizados, no valores hardcoded

---

## 🔄 Compatibilidad

- ✅ **Backward compatible:** Componentes existentes siguen funcionando
- ✅ **Dark mode:** Todos los colores soportan modo oscuro
- ✅ **TypeScript:** Autocompletado completo en todos los tokens
- ✅ **Tests:** Cobertura completa de nuevos componentes

---

## 📚 Referencias

- **Tailwind CSS v4:** CSS-first configuration via `@theme`
- **Next.js Fonts:** Google Fonts optimizadas automáticamente
- **class-variance-authority:** Gestión de variantes en Button
- **Design System Pattern:** Tokens centralizados, componentes reutilizables

---

## 🚧 Próximos Pasos (PR #2)

El PR #2 implementará componentes de página usando este design system:
- Hero Section con nuevo estilo
- Featured Products con tipografía boutique
- CTA Sections con nuevos botones
- Optimización de imágenes

---

**Versión:** 1.0.0  
**Fecha:** 2026-01-19  
**Autor:** GitHub Copilot para Muma Estudio
