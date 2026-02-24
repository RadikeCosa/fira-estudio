# Maintenance Mode - Visual Preview

## How it looks when enabled

### 1. Maintenance Banner (Top of page)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Modo Mantenimiento: Estamos configurando nuestro sistema   │
│     de pagos. La tienda estará disponible próximamente.     ✕  │
└─────────────────────────────────────────────────────────────────┘
│                    Yellow background (bg-yellow-500)            │
│                    Dark text (text-yellow-950)                  │
│                    Dismissible with X button                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Product Page - Add to Cart Button (Disabled)

```
┌─────────────────────────────────────────┐
│  Producto: Mantel Floral                │
│                                         │
│  Precio: $15,000                        │
│                                         │
│  Tamaño: [150x200cm] [180x250cm]      │
│  Color:  [Rojo] [Azul]                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⚠️ El checkout está temporalmente │ │
│  │    deshabilitado                  │ │
│  └───────────────────────────────────┘ │
│        (Error message - red)            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   🛒 Agregar al carrito           │ │
│  │        (DISABLED)                  │ │
│  └───────────────────────────────────┘ │
│       Button is grayed out (opacity-50) │
└─────────────────────────────────────────┘
```

## Environment Variables

### Production (Maintenance Mode ON)
```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Estamos configurando nuestro sistema de pagos. La tienda estará disponible próximamente.
```

### Development/Preview (Normal Mode)
```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

## Component Structure

```
app/layout.tsx
├── <MaintenanceBanner /> ← Shows when IS_NEXT_PUBLIC_MAINTENANCE_MODE=true
├── <Header />
├── <main>
│   └── {children}
│       └── Product Pages
│           └── <AddToCartButton />
│               └── Disabled when IS_CHECKOUT_ENABLED=false
└── <Footer />
```

## Feature Flags Logic

```typescript
// lib/config/features.ts
IS_NEXT_PUBLIC_MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"
IS_CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true"

// components/maintenance-banner.tsx
if (!IS_NEXT_PUBLIC_MAINTENANCE_MODE) return null; // Hide banner

// components/carrito/AddToCartButton.tsx
const isCheckoutDisabled = IS_NEXT_PUBLIC_MAINTENANCE_MODE || !IS_CHECKOUT_ENABLED;
if (isCheckoutDisabled) {
  setError("El checkout está temporalmente deshabilitado");
}
```

## User Experience

### Maintenance Mode Enabled:
1. ✅ User sees yellow banner at top of page
2. ✅ User can browse all products normally
3. ✅ User can see prices, sizes, colors
4. ❌ User cannot add products to cart (button disabled)
5. ⚠️ User sees error message: "El checkout está temporalmente deshabilitado"

### Maintenance Mode Disabled:
1. ✅ No banner visible
2. ✅ Full shopping experience
3. ✅ Add to cart works normally
4. ✅ Checkout process functional

## Colors & Styling

### Banner:
- Background: `bg-yellow-500` (#EAB308)
- Text: `text-yellow-950` (#422006)
- Icon: Warning triangle (⚠️)
- Close button: Hover effect `hover:bg-yellow-600/20`

### Error Message:
- Background: `bg-red-50` (#FEF2F2)
- Border: `border-red-200` (#FECACA)
- Text: `text-red-800` (#991B1B)

### Disabled Button:
- Opacity: `opacity-50` (50% transparent)
- Cursor: `cursor-not-allowed`
- State: `disabled={true}`

## Testing Checklist

- [ ] Banner appears when `NEXT_PUBLIC_MAINTENANCE_MODE=true`
- [ ] Banner can be dismissed with X button
- [ ] Banner stays dismissed during session
- [ ] Add to cart button is disabled
- [ ] Error message shows on click attempt
- [ ] Products are still browsable
- [ ] SEO is not affected (pages still load)
- [ ] Feature flags log in development console
