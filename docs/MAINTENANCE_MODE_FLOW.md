# 🔄 How Maintenance Mode Works - Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENVIRONMENT VARIABLES                        │
│  (Set in Vercel → Settings → Environment Variables)             │
├─────────────────────────────────────────────────────────────────┤
│  NEXT_PUBLIC_MAINTENANCE_MODE = "true"                          │
│  NEXT_PUBLIC_CHECKOUT_ENABLED = "false"                         │
│  NEXT_PUBLIC_MAINTENANCE_MESSAGE = "Custom message..."          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    lib/config/features.ts                        │
│                     (Feature Flags Layer)                        │
├─────────────────────────────────────────────────────────────────┤
│  export const IS_MAINTENANCE_MODE =                             │
│    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"          │
│                                                                  │
│  export const IS_CHECKOUT_ENABLED =                             │
│    process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true"          │
│                                                                  │
│  export const MAINTENANCE_MESSAGE =                             │
│    process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "Default..."  │
└─────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
                    ↓                           ↓
        ┌───────────────────┐       ┌─────────────────────────┐
        │  MaintenanceBanner │       │  AddToCartButton        │
        │  (Banner Display)  │       │  (Checkout Control)     │
        └───────────────────┘       └─────────────────────────┘
                    ↓                           ↓
                    ↓                           ↓
┌─────────────────────────────┐   ┌───────────────────────────────┐
│ if (!IS_MAINTENANCE_MODE)   │   │ const isCheckoutDisabled =   │
│   return null // Hide       │   │   IS_MAINTENANCE_MODE ||     │
│                              │   │   !IS_CHECKOUT_ENABLED       │
│ // Show yellow banner       │   │                               │
│ with MAINTENANCE_MESSAGE    │   │ if (isCheckoutDisabled)      │
│ and close button            │   │   setError("Disabled...")     │
└─────────────────────────────┘   └───────────────────────────────┘
```

## User Flow - Maintenance Mode Enabled

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER VISITS SITE                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  app/layout.tsx renders:                                         │
│  ├─ <MaintenanceBanner />  ← Shows yellow warning bar           │
│  ├─ <Header />                                                   │
│  ├─ <main>{children}</main>                                      │
│  └─ <Footer />                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  🟡 MAINTENANCE BANNER (top of page)                             │
│  ⚠️  Modo Mantenimiento: Estamos configurando nuestro sistema  │
│      de pagos. La tienda estará disponible próximamente.    [✕] │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    User browses products...
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  PRODUCT PAGE                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Mantel Floral                                             │ │
│  │  Precio: $15,000                                           │ │
│  │  Tamaño: [150x200cm] [180x250cm]                         │ │
│  │  Color: [Rojo] [Azul]                                     │ │
│  │                                                            │ │
│  │  🔴 El checkout está temporalmente deshabilitado          │ │
│  │                                                            │ │
│  │  [ 🛒 Agregar al carrito ] ← DISABLED (grayed out)       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks button...
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  handleAddToCart() executed:                                     │
│  ├─ if (isCheckoutDisabled) {                                   │
│  │    setError("El checkout está temporalmente deshabilitado")  │
│  │    return // Exit early                                      │
│  │  }                                                            │
│  └─ Normal checkout flow never reached                          │
└──────────────────────────────────────────────────────────────────┘
```

## User Flow - Maintenance Mode Disabled (Normal Operation)

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER VISITS SITE                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  app/layout.tsx renders:                                         │
│  ├─ <MaintenanceBanner />  ← Returns null (hidden)              │
│  ├─ <Header />                                                   │
│  ├─ <main>{children}</main>                                      │
│  └─ <Footer />                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    No banner visible
                              ↓
                    User browses products...
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  PRODUCT PAGE                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Mantel Floral                                             │ │
│  │  Precio: $15,000                                           │ │
│  │  Tamaño: [150x200cm] [180x250cm]                         │ │
│  │  Color: [Rojo] [Azul]                                     │ │
│  │                                                            │ │
│  │  [ 🛒 Agregar al carrito ] ← ENABLED (active)            │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks button...
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  handleAddToCart() executed:                                     │
│  ├─ isCheckoutDisabled = false (no maintenance)                 │
│  ├─ Validates variation selected                                │
│  ├─ Validates stock available                                   │
│  ├─ await addToCart(...)                                        │
│  └─ Shows success message + "Ver carrito" button                │
└──────────────────────────────────────────────────────────────────┘
```

## Code Execution Flow

### Step 1: Application Startup

```typescript
// Next.js reads environment variables
process.env.NEXT_PUBLIC_MAINTENANCE_MODE = "true"
process.env.NEXT_PUBLIC_CHECKOUT_ENABLED = "false"

// lib/config/features.ts evaluates
IS_MAINTENANCE_MODE = true  // "true" === "true"
IS_CHECKOUT_ENABLED = false // "false" !== "true"
```

### Step 2: Layout Render (Server Side)

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MaintenanceBanner />  // ← Will evaluate IS_MAINTENANCE_MODE
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Step 3: Banner Component (Client Side)

```typescript
// components/maintenance-banner.tsx
'use client'

export function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(true)
  
  // Check feature flag
  if (!IS_MAINTENANCE_MODE || !isVisible) {
    return null  // Don't render anything
  }
  
  // Render yellow banner
  return (
    <div className="bg-yellow-500 text-yellow-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WarningIcon />
          <p>Modo Mantenimiento: {MAINTENANCE_MESSAGE}</p>
        </div>
        <button onClick={() => setIsVisible(false)}>
          <X />
        </button>
      </div>
    </div>
  )
}
```

### Step 4: Add to Cart Button (Client Side)

```typescript
// components/carrito/AddToCartButton.tsx
'use client'

export function AddToCartButton({ producto }) {
  // Calculate if checkout should be disabled
  const isCheckoutDisabled = IS_MAINTENANCE_MODE || !IS_CHECKOUT_ENABLED
  
  const handleAddToCart = async () => {
    // Early exit if maintenance mode
    if (isCheckoutDisabled) {
      setError("El checkout está temporalmente deshabilitado")
      return  // Stop here, don't add to cart
    }
    
    // Normal checkout flow...
    await addToCart(variation.id, quantity, variation.precio)
  }
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={isCheckoutDisabled}  // Button is disabled
      className="opacity-50 cursor-not-allowed"  // Visual feedback
    >
      Agregar al carrito
    </button>
  )
}
```

## Toggle Maintenance Mode

### Activate (in Vercel)

```bash
# 1. Set environment variables
NEXT_PUBLIC_MAINTENANCE_MODE = "true"
NEXT_PUBLIC_CHECKOUT_ENABLED = "false"

# 2. Redeploy
# Vercel → Deployments → Latest → Redeploy

# 3. Result (after ~2 minutes)
IS_MAINTENANCE_MODE = true    ← Banner shows
IS_CHECKOUT_ENABLED = false   ← Checkout disabled
```

### Deactivate (in Vercel)

```bash
# 1. Update environment variables
NEXT_PUBLIC_MAINTENANCE_MODE = "false"
NEXT_PUBLIC_CHECKOUT_ENABLED = "true"

# 2. Redeploy
# Vercel → Deployments → Latest → Redeploy

# 3. Result (after ~2 minutes)
IS_MAINTENANCE_MODE = false   ← Banner hidden
IS_CHECKOUT_ENABLED = true    ← Checkout enabled
```

## Key Design Decisions

### Why Client Components?

```typescript
// MaintenanceBanner needs useState for dismissal
'use client'  // Required for useState
const [isVisible, setIsVisible] = useState(true)

// AddToCartButton already was a client component
// (needs onClick, useState, etc.)
```

### Why NEXT_PUBLIC_ prefix?

```typescript
// NEXT_PUBLIC_ variables are:
// ✅ Available to client components
// ✅ Built into the bundle at build time
// ✅ Safe to expose (no secrets)
// ✅ Can be changed without code changes (but need redeploy)

// Without NEXT_PUBLIC_, variables are:
// ❌ Only available server-side
// ❌ Cannot be read in client components
```

### Why Both Flags?

```typescript
// Two flags for flexibility:

// IS_MAINTENANCE_MODE
// - Shows banner
// - General "something is wrong" signal

// IS_CHECKOUT_ENABLED  
// - Controls specific checkout feature
// - Could be disabled independently

// Combined logic:
const isCheckoutDisabled = IS_MAINTENANCE_MODE || !IS_CHECKOUT_ENABLED

// This means:
// - If maintenance mode = checkout disabled
// - If checkout flag false = checkout disabled
// - Maximum flexibility
```

## Summary

The maintenance mode system is a **clean, minimal implementation** that:

1. ✅ Reads configuration from environment variables
2. ✅ Centralizes feature flags in one file
3. ✅ Shows banner when maintenance mode active
4. ✅ Disables checkout functionality
5. ✅ Requires zero code changes to toggle
6. ✅ Preserves SEO and site browsability
7. ✅ Provides clear user feedback

**Total complexity**: ~100 lines of code + documentation
**Files modified**: 3 (minimal changes)
**Files created**: 5 (all new functionality)
**Breaking changes**: 0
**Dependencies added**: 0
