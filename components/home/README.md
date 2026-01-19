# New Home Page Components - PR #2

This directory contains the new boutique/minimalista home page components created for Muma Estudio.

## 🎨 Design Philosophy

The new design emphasizes:
- **Minimalism**: Clean layouts with ample whitespace
- **Typography**: Large, bold headings with serif fonts
- **Subtle animations**: Hover effects with scale transforms
- **Monochrome palette**: Black, white, grays with terracotta accent
- **Boutique feel**: High-end textile brand aesthetic

## 📦 Components

### HeroSectionNew.tsx
**Purpose**: Main landing section with attention-grabbing content

**Features**:
- Decorative badge with "Textiles Artesanales Únicos"
- Large hero heading with italic highlighted word
- Two CTAs (primary solid button, secondary outline button)
- Decorative "Muma" background text
- Mobile-first responsive design

**Props**: None (uses HOME_CONTENT)

**Usage**:
```tsx
import { HeroSectionNew } from "@/components/home/HeroSectionNew";

<HeroSectionNew />
```

---

### FeaturedProducts.tsx
**Purpose**: Showcase highlighted products with boutique presentation

**Features**:
- Server Component (fetches from Supabase)
- Section header with decorative line divider
- Alternating left offset (every 2nd item has `pl-8`)
- "Pieza Única" badge for featured products
- Hover scale effect on images
- Plus button for quick view
- Price range display
- Link to full collection at bottom

**Props**: None (fetches data internally)

**Data Source**: `getProductosDestacados(4)` from Supabase

**Usage**:
```tsx
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

<FeaturedProducts />
```

---

### CollectionsGrid.tsx
**Purpose**: Display main product categories with image overlays

**Features**:
- 2-column grid layout
- First item (Manteles) spans 2 columns
- Dark overlay on images
- White text labels
- Hover scale-105 effect with slow transition
- Links to filtered product pages

**Props**: None (uses HOME_CONTENT)

**Usage**:
```tsx
import { CollectionsGrid } from "@/components/home/CollectionsGrid";

<CollectionsGrid />
```

**Image Requirements**:
- `/images/colecciones/manteles.jpg` (featured, 2x width)
- `/images/colecciones/servilletas.jpg`
- `/images/colecciones/caminos.jpg`

---

### ContactSection.tsx
**Purpose**: Call-to-action for custom inquiries

**Features**:
- Centered layout with top/bottom borders
- Simple, focused messaging
- Terracotta CTA button
- Max-width container for readability

**Props**: None (uses HOME_CONTENT)

**Usage**:
```tsx
import { ContactSection } from "@/components/home/ContactSection";

<ContactSection />
```

---

### TextureDivider.tsx
**Purpose**: Visual separator between sections

**Features**:
- Full-width image display
- Grayscale filter for neutrality
- Dark mode: subtle invert filter
- 300px fixed height
- Decorative only (aria-hidden)

**Props**: None (uses HOME_CONTENT)

**Usage**:
```tsx
import { TextureDivider } from "@/components/home/TextureDivider";

<TextureDivider />
```

**Image Requirements**:
- `/images/textures/linen-texture.jpg` (1920x300px recommended)

---

### ProgressBar.tsx (Layout)
**Purpose**: Visual scroll progress indicator

**Features**:
- Client Component (uses hooks)
- Fixed at bottom of viewport
- Primary color (terracotta)
- Smooth width transition
- ARIA accessibility labels
- Passive scroll listener for performance

**Props**: None

**Usage**:
```tsx
import { ProgressBar } from "@/components/layout/ProgressBar";

<ProgressBar />
```

**Note**: Add once in root layout or page wrapper

---

## 🎨 Design Tokens Used

### Typography
- `TYPOGRAPHY.heading.hero` - Extra large display text
- `TYPOGRAPHY.heading.section` - Section titles
- `TYPOGRAPHY.heading.card` - Product names
- `TYPOGRAPHY.body.large` - Hero description

### Spacing
- `SPACING.section.sm/md/lg` - Vertical section padding
- Max-width: `max-w-lg` (512px) for content

### Components
- `COMPONENTS.card.product` - Product card wrapper
- `COMPONENTS.card.image` - Image container
- `COMPONENTS.card.imageHover` - Hover scale effect

### Colors
- Primary: Terracotta (`bg-primary`)
- Zinc scale for neutrals (100, 200, 300, 500, 900)
- Dark mode aware with `dark:` variants

---

## 📝 Content Structure

All text content is centralized in `lib/content/home.ts`:

```typescript
export const HOME_CONTENT = {
  hero: { badge, title, subtitle, subtitleHighlight, description, cta },
  featured: { sectionTitle, sectionSubtitle, cta },
  collections: { title, items[] },
  contact: { title, description, cta },
  textureImage: { src, alt },
};
```

**To update content**: Edit `lib/content/home.ts` - no need to touch component files.

---

## 🔌 Supabase Integration

### New Query Function

`getProductosDestacados(limite: number = 6): Promise<ProductoCompleto[]>`

**Purpose**: Fetch featured products marked as `destacado: true`

**Location**: `lib/supabase/queries.ts`

**Features**:
- Filters: `activo: true`, `destacado: true`
- Eager loads: `categoria`, `variaciones`, `imagenes`
- Sorting: Images (principal first), Variations (price ascending)
- Caching: Uses `CACHE_CONFIG.productos` (1 hour)

**Usage**:
```typescript
import { getProductosDestacados } from "@/lib/supabase/queries";

const productos = await getProductosDestacados(4);
```

---

## 🧪 Testing

Run tests for new components:

```bash
npm run test:unit -- NewHomeComponents.test.tsx
```

**Test Coverage**:
- ✅ All components export correctly
- ✅ Design tokens have required keys
- ✅ HOME_CONTENT has new structure
- ✅ DecorativeBadge supports variants
- ✅ Supabase queries are exported

---

## 🚀 Demo Page

View all new components in action:

**URL**: `/demo-new-home`

**File**: `app/demo-new-home/page.tsx`

This demo page includes:
- All 6 new components
- Full layout from hero to contact
- Progress bar functionality
- Server-side data fetching

---

## 📦 Dependencies

### Updated Components
- `DecorativeBadge` - Now supports `variant` prop ("outline" | "filled")

### Updated Design Tokens
- `TYPOGRAPHY.heading.hero` - Added
- `TYPOGRAPHY.body.large` - Added
- `COMPONENTS.card.product` - Added
- `COMPONENTS.card.image` - Added
- `COMPONENTS.card.imageHover` - Added
- `SPACING.section` - Changed from string to object

### Backward Compatibility
Old home components updated to work with new `HOME_CONTENT` structure:
- `HeroSection.tsx` (old version, still works)
- `FeaturedProductsSection.tsx` (compatibility layer added)
- `CategoriesSection.tsx` (compatibility layer added)
- `FinalCTASection.tsx` (compatibility layer added)

---

## 🎯 Next Steps (PR #3 & #4)

**PR #3**: Update Header & Footer
- Align navigation with new design system
- Update color scheme to match

**PR #4**: Assemble New Home
- Replace old components in `app/page.tsx`
- Add ProgressBar to root layout
- Final integration testing

---

## 🛠️ Development Notes

### Component Types
- **Server Components**: HeroSectionNew, FeaturedProducts, CollectionsGrid, ContactSection, TextureDivider
- **Client Components**: ProgressBar (only one with `"use client"`)

### Image Requirements
Ensure these images exist:
```
public/
  images/
    colecciones/
      manteles.jpg
      servilletas.jpg
      caminos.jpg
    textures/
      linen-texture.jpg
```

### Accessibility
- ARIA labels on interactive elements
- Alt text on all images
- Semantic HTML (header, section, article)
- Progress bar has proper role and aria attributes

### Performance
- Images use Next.js Image component with optimized sizes
- Scroll listener uses passive event for ProgressBar
- Server Components reduce client-side JavaScript
- Cached Supabase queries

---

## 📚 References

- Design tokens: `lib/design/tokens.ts`
- Content: `lib/content/home.ts`
- Queries: `lib/supabase/queries.ts`
- Tests: `components/home/NewHomeComponents.test.tsx`
- Demo: `app/demo-new-home/page.tsx`
