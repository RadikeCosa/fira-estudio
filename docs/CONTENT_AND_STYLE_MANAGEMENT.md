# Content and Style Management Guide

## Overview
After the refactor (Phases 1-8), Muma Estudio follows a centralized architecture for content and styling. This guide explains how to make changes without touching component code.

---

## 📝 Managing Content (Text Changes)

### Content Files Location
All text content is centralized in `lib/content/`:

```
lib/content/
├── home.ts              # Home page text
├── contacto.ts          # Contact page text
├── sobre-nosotros.ts    # About page text
└── productos.ts         # Products page text
```

**Note:** Content is structured by page/feature. Each file exports a constant (e.g., `HOME_CONTENT`, `CONTACTO_CONTENT`) with all text for that section.

### How to Change Text

#### Example 1: Update Home Hero Title

**File:** `lib/content/home.ts`

```typescript
export const HOME_CONTENT = {
  hero: {
    badge: "Textiles Artesanales Únicos",
    title: "Muma Estudio", // ← Change this
    subtitle: "Textiles artesanales para tu hogar", // ← Or this
    description: "Your new description here...",
    // ...
  }
}
```

**Result:** Title updates on home page automatically, no component changes needed.

#### Example 2: Update Contact Form Labels

**File:** `lib/content/contacto.ts`

```typescript
export const CONTACTO_CONTENT = {
  form: {
    fields: {
      nombre: {
        label: "Nombre Completo", // ← Change label
        placeholder: "Juan Pérez" // ← Change placeholder
      }
    }
  }
}
```

#### Example 3: Add New About Section

**File:** `lib/content/sobre-nosotros.ts`

```typescript
export const ABOUT_CONTENT = {
  sections: {
    newSection: { // ← Add new section
      title: "Nuestro Compromiso",
      icon: Award, // Import from lucide-react
      paragraphs: [
        "First paragraph...",
        "Second paragraph..."
      ]
    }
  }
}
```

Then use in component:
```typescript
// app/sobre-nosotros/page.tsx
const { newSection } = ABOUT_CONTENT.sections;
```

### TypeScript Benefits
- **Autocomplete:** IDE suggests all available content keys
- **Type Safety:** Prevents typos and missing fields
- **Refactoring:** Rename content keys across the project safely

---

## 🎨 Managing Styles (Visual Changes)

### Style Files Location
All design tokens are centralized in `lib/design/`:

```
lib/design/
├── tokens.ts    # Colors, typography, spacing, components
└── (theme.ts in lib/config/theme.ts for reference)
```

### Global Style Tokens

#### Colors

**File:** `lib/design/tokens.ts`

```typescript
export const COLORS = {
  foreground: "text-foreground",   // Main text color
  background: "bg-background",     // Main background
  muted: "text-muted bg-muted",   // Secondary text/bg
  border: "border-border",         // Border color
  accent: "text-accent bg-accent", // Accent color
} as const;
```

**CSS Variables:** Defined in `app/globals.css`

```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
  --muted: #f5f5f5;
  --border: #e5e5e5;
  --accent: #171717;
}
```

**How to Change:**
1. Update CSS variable in `globals.css`
2. Styles update across entire site automatically

#### Typography

**File:** `lib/design/tokens.ts`

```typescript
export const TYPOGRAPHY = {
  heading: {
    page: "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
    section: "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl",
    card: "text-xl font-bold sm:text-2xl",
  },
  body: {
    base: "text-base leading-relaxed",
    small: "text-sm leading-relaxed",
    muted: "text-base text-muted-foreground",
  },
} as const;
```

**Usage in Components:**

```typescript
import { TYPOGRAPHY } from "@/lib/design/tokens";

<h1 className={TYPOGRAPHY.heading.page}>Title</h1>
```

**To Change Font Sizes:**
1. Update token definition in `tokens.ts`
2. All components using that token update automatically

#### Spacing

**File:** `lib/design/tokens.ts`

```typescript
export const SPACING = {
  sectionPadding: {
    sm: "px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28",
    md: "px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36",
    lg: "px-4 py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40",
  },
  page: "px-4 py-12 sm:px-8 sm:py-20 lg:px-16 lg:py-28",
} as const;
```

#### Component Styles

**File:** `lib/design/tokens.ts`

```typescript
export const COMPONENTS = {
  input: {
    base: "w-full rounded-xl border-2 border-border bg-white px-4 py-3.5...",
    placeholder: "placeholder:text-muted-foreground",
    focus: "focus:border-foreground focus:outline-none focus:ring-2...",
    hover: "hover:border-foreground/30",
  },
  card: {
    base: "rounded-2xl border-2 border-border/50 bg-white shadow-lg",
    paddingSm: "p-6",
    paddingMd: "p-8 sm:p-10",
    paddingLg: "p-10 sm:p-12",
  },
  button: {
    base: "inline-flex items-center justify-center gap-2 rounded-xl...",
    hover: "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
  }
} as const;
```

**Usage:**

```typescript
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

<input className={cn(
  COMPONENTS.input.base,
  COMPONENTS.input.focus,
  COMPONENTS.input.hover
)} />
```

---

## 🧩 Component Usage Guide

### Available UI Components

All reusable components are in `components/ui/`:

#### Button

```typescript
import { Button } from "@/components/ui/Button";

// Primary button
<Button variant="primary" size="md">Click me</Button>

// Secondary button
<Button variant="secondary" size="sm">Cancel</Button>

// As link
<Button href="/productos" variant="primary">Shop Now</Button>

// Variants: primary | secondary | ghost
// Sizes: sm | md | lg
```

#### Input

```typescript
import { Input } from "@/components/ui/Input";

<Input 
  id="email" 
  label="Email" 
  placeholder="tu@email.com" 
  required 
  error="Invalid email"
  helperText="We'll never share your email"
/>
```

#### Textarea

```typescript
import { Textarea } from "@/components/ui/Textarea";

<Textarea 
  id="message" 
  label="Mensaje" 
  rows={5} 
  required 
/>
```

#### Card

```typescript
import { Card } from "@/components/ui/Card";

<Card hover padding="md">
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>

// Padding: none | sm | md | lg
// hover: true (adds hover effect)
```

#### PageHeader

```typescript
import { PageHeader } from "@/components/ui/PageHeader";

<PageHeader 
  title="Productos" 
  description="Textiles artesanales únicos"
  showBadge={true}
/>
```

#### Icon

```typescript
import { Icon } from "@/components/ui/Icon";
import { Heart } from "lucide-react";

<Icon icon={Heart} size="md" variant="default" animated />

// Sizes: sm | md | lg
// Variants: default | ghost
```

#### ContactInfoItem

```typescript
import { ContactInfoItem } from "@/components/ui/ContactInfoItem";
import { Mail } from "lucide-react";

<ContactInfoItem 
  icon={Mail} 
  title="Email" 
  content="contacto@mumaestudio.com" 
  href="mailto:contacto@mumaestudio.com"
  external
/>
```

---

## 🎯 Common Scenarios

### Scenario 1: Change Site-Wide Primary Color

**Steps:**
1. Open `app/globals.css`
2. Update `--foreground` and `--accent` variables
3. Save file
4. All buttons, headings, and accents update automatically

```css
:root {
  --foreground: #2563eb; /* Blue instead of black */
  --accent: #2563eb;
}
```

### Scenario 2: Update All Button Sizes

**Steps:**
1. Open `components/ui/Button.tsx`
2. Update `buttonVariants` size definitions
3. All buttons across site update

```typescript
size: {
  sm: "px-8 py-3 text-base",  // ← Increase from px-6 py-2.5
  md: "px-12 py-5 text-lg",   // ← Increase from px-8 py-4
}
```

### Scenario 3: Change Page Heading Style Globally

**Steps:**
1. Open `lib/design/tokens.ts`
2. Update `TYPOGRAPHY.heading.page`
3. All page headers update (home, productos, contacto, sobre-nosotros)

```typescript
heading: {
  page: "text-5xl font-extrabold tracking-tighter sm:text-6xl lg:text-7xl",
}
```

### Scenario 4: Add New Content Section

**Steps:**
1. Add content to appropriate file in `lib/content/`
2. Create/use component in page
3. Component automatically uses centralized styles

```typescript
// lib/content/home.ts
export const HOME_CONTENT = {
  // ... existing content
  testimonials: {
    title: "Lo que dicen nuestros clientes",
    items: [
      { name: "María", text: "Excelente calidad..." },
      { name: "Juan", text: "Muy recomendable..." },
    ]
  }
}

// app/page.tsx
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";

const { testimonials } = HOME_CONTENT;

<section>
  <SectionHeader title={testimonials.title} />
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {testimonials.items.map(item => (
      <Card key={item.name}>
        <p>{item.text}</p>
        <p className="font-bold">- {item.name}</p>
      </Card>
    ))}
  </div>
</section>
```

---

## ✅ Benefits of This Architecture

### 1. Separation of Concerns
- **Content editors:** Change text without touching code
- **Designers:** Update styles centrally
- **Developers:** Focus on functionality

### 2. Consistency
- All buttons look the same (unless explicitly styled differently)
- All headings follow same typography scale
- All spacing follows same system

### 3. Maintainability
- Change a color once, updates everywhere
- Rename a content key, TypeScript finds all usages
- No style duplication

### 4. Type Safety
- Content keys autocomplete in IDE
- Compile-time errors for missing content
- Prevents runtime errors

### 5. Scalability
- Add new pages quickly using existing patterns
- New components inherit design system automatically
- Easy to add new content sections

---

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ DON'T: Hardcode text in components

```typescript
// ❌ BAD
export function Hero() {
  return <h1>Textiles Artesanales</h1>;
}
```

```typescript
// ✅ GOOD
import { HOME_CONTENT } from "@/lib/content/home";

export function Hero() {
  return <h1>{HOME_CONTENT.hero.subtitle}</h1>;
}
```

### ❌ DON'T: Use inline styles

```typescript
// ❌ BAD
<div style={{ padding: "20px", color: "red" }}>

// ✅ GOOD
<div className="p-5 text-red-600">
```

### ❌ DON'T: Duplicate style strings

```typescript
// ❌ BAD
<button className="px-8 py-4 rounded-xl bg-foreground text-background...">
<button className="px-8 py-4 rounded-xl bg-foreground text-background...">

// ✅ GOOD
<Button variant="primary">Button 1</Button>
<Button variant="primary">Button 2</Button>
```

### ❌ DON'T: Create style variants manually

```typescript
// ❌ BAD
<button className={isLarge ? "px-12 py-6 text-xl" : "px-6 py-3 text-sm"}>

// ✅ GOOD
<Button size={isLarge ? "lg" : "sm"}>
```

---

## 📚 Quick Reference

### File Structure

```
lib/
├── content/              # All text content
│   ├── home.ts
│   ├── contacto.ts
│   ├── sobre-nosotros.ts
│   └── productos.ts
├── design/               # All design tokens
│   └── tokens.ts         # Colors, typography, spacing, components
├── config/               # App configuration
│   └── theme.ts          # Theme config reference
└── constants/            # App constants
    ├── index.ts          # SITE_CONFIG, WHATSAPP
    └── navigation.ts     # NAV_LINKS, SOCIAL_LINKS

components/ui/            # Reusable UI components
├── Button.tsx
├── Input.tsx
├── Textarea.tsx
├── Card.tsx
├── PageHeader.tsx
├── Icon.tsx
├── ContactInfoItem.tsx
├── SectionHeader.tsx
├── DecorativeBadge.tsx
└── Breadcrumbs.tsx

app/globals.css           # CSS variables (colors, shadows)
```

### Import Patterns

```typescript
// Content
import { HOME_CONTENT } from "@/lib/content/home";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";

// Design tokens
import { TYPOGRAPHY, SPACING, COMPONENTS } from "@/lib/design/tokens";

// Constants
import { SITE_CONFIG, WHATSAPP } from "@/lib/constants";

// UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
```

---

## 🔄 Migration from Old Pattern

If you find old code not following this pattern:

### Before (Old Pattern):
```typescript
// Hardcoded in component
export function ContactPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold">Contacto</h1>
      <p className="text-muted-foreground">Envianos tu consulta</p>
      <input
        type="text"
        placeholder="Nombre"
        className="w-full px-4 py-3 rounded-xl border-2..."
      />
    </div>
  );
}
```

### After (Refactored Pattern):
```typescript
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";

export function ContactPage() {
  const { page, form } = CONTACTO_CONTENT;
  
  return (
    <div>
      <PageHeader title={page.title} description={page.description} />
      <Input
        label={form.fields.nombre.label}
        placeholder={form.fields.nombre.placeholder}
      />
    </div>
  );
}
```

**Benefits:**
- Content can be changed without touching component
- Input styles managed centrally
- TypeScript prevents typos
- Consistent with rest of the site

---

## 🎓 Learning Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **CVA (Class Variance Authority):** https://cva.style/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/intro.html

---

## 💬 Questions?

For questions about this architecture, reference:
- `.github/instructions/copilot-instructions.instructions.md` - Core coding guidelines
- `.github/skills/` - Specific implementation patterns
- This document - Content and style management

**Remember:** If it's text → change in `lib/content/`. If it's a color/size → change in `lib/design/` or `app/globals.css`. If it's a component → it probably already exists in `components/ui/`!

---

## 🔄 Recent Refactoring (January 2026)

### New Components

#### Badge
- **Location:** `components/ui/Badge.tsx`
- **Variants:** success, warning, info, error
- **Props:** variant, children, showDot, className
- **Usage:**
  ```tsx
  import { Badge } from "@/components/ui/Badge";
  
  <Badge variant="success" showDot>Stock disponible</Badge>
  <Badge variant="error">Agotado</Badge>
  <Badge variant="warning">¡Solo quedan 3!</Badge>
  <Badge variant="info">A pedido</Badge>
  ```

#### ErrorDisplay
- **Location:** `components/errors/ErrorDisplay.tsx`
- **Types:** network, database, generic
- **Replaces:** NetworkError, DatabaseError, GenericError (now deleted)
- **Usage:**
  ```tsx
  import { ErrorDisplay } from "@/components/errors/ErrorDisplay";
  
  <ErrorDisplay type="network" onRetry={handleRetry} />
  <ErrorDisplay type="database" onRetry={handleRetry} />
  <ErrorDisplay type="generic" onRetry={handleRetry} error={error} />
  ```

### Expanded Design Tokens

All tokens are in `lib/design/tokens.ts`:

#### COMPONENTS.header.*
- `base` - Fixed header with backdrop blur
- `container` - Header content container
- `logo` - Logo text styles
- `menuButton` - Mobile menu button

#### COMPONENTS.footer.*
- `base` - Footer base styles
- `container` - Footer content container
- `logo` - Footer logo text
- `subtitle` - Footer subtitle
- `nav` - Navigation links container
- `navLink` - Individual nav link
- `socialLinks` - Social icons container
- `socialIcon` - Individual social icon
- `copyright` - Copyright text

#### COMPONENTS.mobileNav.*
- `hamburger` - Hamburger button container
- `hamburgerLine` - Individual hamburger line
- `overlay` - Menu backdrop overlay
- `menu` - Slide-in menu panel
- `menuLink` - Menu item link
- `mobileMenuAlt` - Alternative mobile menu style
- `closeButton` - Close button

#### COMPONENTS.errorContainer.*
- `wrapper` - Outer container
- `content` - Inner content area
- `icon` - Error icon container
- `title` - Error title
- `message` - Error message
- `button` - Retry button

#### COMPONENTS.badge.*
- `base` - Badge base styles
- `success/warning/info/error` - Variant styles
- `dot` - Status dot
- `dotSuccess/dotWarning/dotInfo/dotError` - Dot variants

#### COMPONENTS.pagination.*
- `nav` - Pagination nav container
- `button` - Pagination button base
- `buttonActive` - Active button state
- `buttonDisabled` - Disabled button state
- `pageInfo` - Page counter text

#### COMPONENTS.filter.*
- `sidebar` - Filter sidebar container
- `sectionTitle` - Section heading
- `checkbox` - Checkbox input
- `checkboxLabel` - Checkbox label container
- `checkboxText` - Checkbox label text

#### COMPONENTS.colorSwatch.*
- `container` - Swatches container
- `button` - Individual swatch button
- `buttonSelected` - Selected state
- `buttonDisabled` - Disabled state
- `buttonHover` - Hover effects

#### COMPONENTS.heroBadge.*
- `base` - Hero section badge

### Migration Examples

#### Before (Hardcoded):
```tsx
// ❌ Hardcoded classes
<div className="w-full sm:w-64 p-6 bg-white rounded-2xl border-2 border-border/50 shadow-lg">
  <h3 className="font-bold text-lg mb-4 text-foreground">Categorías</h3>
  <input className="w-4 h-4 rounded border-2 border-border" />
</div>
```

#### After (Using Tokens):
```tsx
// ✅ Using centralized tokens
import { COMPONENTS } from "@/lib/design/tokens";

<aside className={COMPONENTS.filter.sidebar}>
  <h3 className={COMPONENTS.filter.sectionTitle}>Categorías</h3>
  <input className={COMPONENTS.filter.checkbox} />
</aside>
```

### Refactored Components

The following components now use centralized design tokens:

**Layout:**
- `components/layout/Header.tsx` - Uses `COMPONENTS.header.*`
- `components/layout/Footer.tsx` - Uses `COMPONENTS.footer.*`
- `components/layout/MobileNav.tsx` - Uses `COMPONENTS.mobileNav.*`

**Products:**
- `components/productos/StockBadge.tsx` - Uses `Badge` component
- `components/productos/WhatsAppButton.tsx` - Uses `cn()` utility
- `components/productos/Pagination.tsx` - Uses `COMPONENTS.pagination.*`
- `components/productos/FilterBar.tsx` - Uses `COMPONENTS.filter.*`
- `components/productos/ColorSwatches.tsx` - Uses `COMPONENTS.colorSwatch.*`

**Home:**
- `components/home/HeroSection.tsx` - Uses `COMPONENTS.heroBadge.*`

**Errors:**
- All error pages now use unified `ErrorDisplay` component

### Benefits

1. **Consistency:** All components follow the same style patterns
2. **Maintainability:** Update styles in one place, changes reflect everywhere
3. **Reusability:** Badge component eliminates duplicate code
4. **Type Safety:** Design tokens are strongly typed
5. **Developer Experience:** Autocomplete for all design tokens
