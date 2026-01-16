---
name: product-variations-muma
description: Use when asked "cómo manejar variaciones", "selector de tamaño y color", "calcular precio de variación", "stock de producto", "gestionar variaciones", or working with product variation logic in Muma Estudio
---

# Product Variations Skill - Muma Estudio

Complete patterns for managing product variations (size, color, price, stock) and implementing variation selectors.

---

## Business Model

### Core Concept

In Muma Estudio, products follow a **base + variations** model:

```
PRODUCTO BASE (Mantel Floral)
    ↓
VARIACIONES (Combinations of size + color)
    ├─ 150x200cm + Rojo    → $15,000 (stock: 5)
    ├─ 150x200cm + Azul    → $15,000 (stock: 3)
    ├─ 180x250cm + Rojo    → $18,500 (stock: 2)
    └─ 180x250cm + Azul    → $18,500 (stock: 0) ← Available on request
```

**Key Rules:**
- Prices are stored in **variations**, not base products
- Each variation has its own stock level
- `stock = 0` means "available on request" (not out of stock)
- Each `tamanio + color` combination must be unique per product
- Variations can be independently activated/deactivated

---

## Core Functions

### Get Available Variations

Filter and sort active variations:

```typescript
// lib/utils/variations.ts
import type { Variacion } from "@/lib/types";

/**
 * Get all active variations sorted by price
 * @param variaciones - All product variations
 * @returns Active variations sorted by price (ascending)
 */
export function getAvailableVariations(variaciones: Variacion[]): Variacion[] {
  return variaciones
    .filter(v => v.activo)
    .sort((a, b) => a.precio - b.precio);
}
```

---

### Calculate Price Range

For product cards and listings:

```typescript
// lib/utils/variations.ts

export interface PriceRange {
  min: number;
  max: number;
  hasRange: boolean;
  allVariations: number[];
}

/**
 * Calculate price range from active variations
 * @param variaciones - Product variations
 * @returns Price range information
 */
export function calculatePriceRange(variaciones: Variacion[]): PriceRange {
  const activas = variaciones.filter(v => v.activo);
  
  if (activas.length === 0) {
    return {
      min: 0,
      max: 0,
      hasRange: false,
      allVariations: [],
    };
  }
  
  const precios = activas.map(v => v.precio);
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  
  return {
    min,
    max,
    hasRange: min !== max,
    allVariations: precios,
  };
}

/**
 * Format price range for display
 * @param range - Price range from calculatePriceRange
 * @returns Formatted string
 */
export function formatPriceRange(range: PriceRange): string {
  if (range.min === 0) {
    return "Consultar precio";
  }
  
  const formatPrice = (precio: number) => `$${precio.toLocaleString("es-AR")}`;
  
  if (range.hasRange) {
    return `Desde ${formatPrice(range.min)}`;
  }
  
  return formatPrice(range.min);
}
```

**Usage:**
```typescript
// In ProductCard component
const priceRange = calculatePriceRange(producto.variaciones);
const displayPrice = formatPriceRange(priceRange);

return <span className="font-semibold">{displayPrice}</span>;
```

---

### Get Unique Sizes

Extract unique sizes for selector dropdown:

```typescript
// lib/utils/variations.ts

/**
 * Get unique sizes from active variations
 * @param variaciones - Product variations
 * @returns Sorted array of unique sizes
 */
export function getUniqueSizes(variaciones: Variacion[]): string[] {
  const sizes = new Set(
    variaciones
      .filter(v => v.activo)
      .map(v => v.tamanio)
  );
  
  return Array.from(sizes).sort(compareSizes);
}

/**
 * Custom sort for sizes (handles dimensions like "150x200cm")
 * @param a - First size string
 * @param b - Second size string
 * @returns Sort comparison result
 */
function compareSizes(a: string, b: string): number {
  // Extract first number from dimension (e.g., "150" from "150x200cm")
  const getFirstDimension = (size: string): number => {
    const match = size.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };
  
  return getFirstDimension(a) - getFirstDimension(b);
}
```

**Example:**
```typescript
const sizes = getUniqueSizes(variaciones);
// Result: ["140x180cm", "150x200cm", "180x250cm", "200x300cm"]
```

---

### Get Available Colors for Size

Filter colors based on selected size:

```typescript
// lib/utils/variations.ts

/**
 * Get available colors for a specific size
 * @param variaciones - Product variations
 * @param tamanio - Selected size
 * @returns Sorted array of unique colors for that size
 */
export function getColorsForSize(
  variaciones: Variacion[],
  tamanio: string
): string[] {
  const colors = new Set(
    variaciones
      .filter(v => v.activo && v.tamanio === tamanio)
      .map(v => v.color)
  );
  
  return Array.from(colors).sort();
}
```

---

### Find Specific Variation

Locate variation by size and color:

```typescript
// lib/utils/variations.ts

/**
 * Find variation matching size and color
 * @param variaciones - Product variations
 * @param tamanio - Size to match
 * @param color - Color to match
 * @returns Matching variation or null
 */
export function findVariation(
  variaciones: Variacion[],
  tamanio: string,
  color: string
): Variacion | null {
  return variaciones.find(
    v => v.activo && v.tamanio === tamanio && v.color === color
  ) || null;
}
```

---

### Get Default Variation

Select first available variation automatically:

```typescript
// lib/utils/variations.ts

/**
 * Get default variation (first active, lowest price)
 * @param variaciones - Product variations
 * @returns First available variation or null
 */
export function getDefaultVariation(variaciones: Variacion[]): Variacion | null {
  const available = getAvailableVariations(variaciones);
  return available[0] || null;
}
```

---

## React Components

### Variation Selector Component

Complete interactive selector with size and color dropdowns:

```typescript
// components/productos/VariationSelector.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Variacion } from "@/lib/types";
import {
  getUniqueSizes,
  getColorsForSize,
  findVariation,
  getDefaultVariation,
} from "@/lib/utils/variations";

interface VariationSelectorProps {
  variaciones: Variacion[];
  onVariacionChange: (variacion: Variacion | null) => void;
}

/**
 * VariationSelector - Interactive size and color selector
 * 
 * Features:
 * - Cascading selection (size → color)
 * - Auto-selects first available variation
 * - Updates price and stock dynamically
 * - Resets color when size changes if not available
 * 
 * @param variaciones - Array of product variations
 * @param onVariacionChange - Callback when variation changes
 */
export function VariationSelector({
  variaciones,
  onVariacionChange,
}: VariationSelectorProps) {
  // Initialize with first available variation
  const defaultVariation = useMemo(
    () => getDefaultVariation(variaciones),
    [variaciones]
  );
  
  const [tamanioSeleccionado, setTamanioSeleccionado] = useState<string>(
    defaultVariation?.tamanio || ""
  );
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    defaultVariation?.color || ""
  );
  
  // Get available sizes
  const tamaniosDisponibles = useMemo(
    () => getUniqueSizes(variaciones),
    [variaciones]
  );
  
  // Get colors for selected size
  const coloresDisponibles = useMemo(
    () => tamanioSeleccionado
      ? getColorsForSize(variaciones, tamanioSeleccionado)
      : [],
    [tamanioSeleccionado, variaciones]
  );
  
  // Find current variation
  const variacionActual = useMemo(
    () => tamanioSeleccionado && colorSeleccionado
      ? findVariation(variaciones, tamanioSeleccionado, colorSeleccionado)
      : null,
    [tamanioSeleccionado, colorSeleccionado, variaciones]
  );
  
  // Notify parent of variation change
  useEffect(() => {
    onVariacionChange(variacionActual);
  }, [variacionActual, onVariacionChange]);
  
  // Handle size change
  const handleTamanioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTamanio = e.target.value;
    setTamanioSeleccionado(nuevoTamanio);
    
    // Reset color if not available for new size
    const coloresParaTamanio = getColorsForSize(variaciones, nuevoTamanio);
    
    if (!coloresParaTamanio.includes(colorSeleccionado)) {
      setColorSeleccionado(coloresParaTamanio[0] || "");
    }
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorSeleccionado(e.target.value);
  };
  
  const formatPrice = (precio: number): string => {
    return `$${precio.toLocaleString("es-AR")}`;
  };
  
  const getStockMessage = (stock: number): string => {
    if (stock === 0) return "A pedido";
    if (stock === 1) return "1 disponible";
    return `${stock} disponibles`;
  };
  
  const hasVariaciones = variaciones.length > 0 && tamaniosDisponibles.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div className="space-y-3">
        <label
          htmlFor="tamanio-select"
          className="block text-sm font-semibold text-foreground"
        >
          Tamaño
        </label>
        <select
          id="tamanio-select"
          value={tamanioSeleccionado}
          onChange={handleTamanioChange}
          disabled={!hasVariaciones}
          className="
            w-full px-4 py-3.5 rounded-xl
            border-2 border-border
            bg-white text-foreground
            font-medium
            shadow-sm
            transition-all duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-foreground
            focus:border-foreground
            disabled:opacity-50
            disabled:cursor-not-allowed
            hover:border-foreground/30
          "
        >
          {!hasVariaciones && (
            <option value="">Sin variaciones disponibles</option>
          )}
          {tamaniosDisponibles.map((tamanio) => (
            <option key={tamanio} value={tamanio}>
              {tamanio}
            </option>
          ))}
        </select>
      </div>
      
      {/* Color Selector */}
      <div className="space-y-3">
        <label
          htmlFor="color-select"
          className="block text-sm font-semibold text-foreground"
        >
          Color
        </label>
        <select
          id="color-select"
          value={colorSeleccionado}
          onChange={handleColorChange}
          disabled={!hasVariaciones || coloresDisponibles.length === 0}
          className="
            w-full px-4 py-3.5 rounded-xl
            border-2 border-border
            bg-white text-foreground
            font-medium
            shadow-sm
            transition-all duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-foreground
            focus:border-foreground
            disabled:opacity-50
            disabled:cursor-not-allowed
            hover:border-foreground/30
          "
        >
          {coloresDisponibles.length === 0 && tamanioSeleccionado && (
            <option value="">Seleccione un tamaño primero</option>
          )}
          {coloresDisponibles.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
      
      {/* Price and Stock Display */}
      {variacionActual && (
        <div className="pt-6 mt-6 border-t-2 border-border/50">
          <div className="space-y-3">
            {/* Price */}
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatPrice(variacionActual.precio)}
            </p>
            
            {/* Stock Badge */}
            <div
              className="
                inline-flex items-center gap-2
                px-4 py-2
                rounded-full
                bg-muted/50
                border border-border/50
              "
            >
              <div
                className={`
                  h-2 w-2 rounded-full
                  ${variacionActual.stock > 0 ? "bg-green-500" : "bg-yellow-500"}
                `}
              />
              <p className="text-sm font-medium text-muted-foreground">
                {getStockMessage(variacionActual.stock)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* No Variations Message */}
      {!hasVariaciones && (
        <div className="p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Este producto no tiene variaciones disponibles actualmente.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### Stock Badge Component

Reusable stock indicator:

```typescript
// components/productos/StockBadge.tsx
import type { Variacion } from "@/lib/types";

interface StockBadgeProps {
  variacion: Variacion;
  className?: string;
}

/**
 * StockBadge - Visual indicator for stock availability
 * 
 * Colors:
 * - Green: In stock (stock > 0)
 * - Yellow: Available on request (stock = 0)
 * - Red: Inactive (activo = false)
 */
export function StockBadge({ variacion, className = "" }: StockBadgeProps) {
  const getStockInfo = () => {
    if (!variacion.activo) {
      return {
        color: "bg-red-500",
        text: "No disponible",
      };
    }
    
    if (variacion.stock === 0) {
      return {
        color: "bg-yellow-500",
        text: "A pedido",
      };
    }
    
    if (variacion.stock <= 3) {
      return {
        color: "bg-orange-500",
        text: `¡Solo ${variacion.stock}!`,
      };
    }
    
    return {
      color: "bg-green-500",
      text: variacion.stock === 1 ? "1 disponible" : `${variacion.stock} disponibles`,
    };
  };
  
  const { color, text } = getStockInfo();
  
  return (
    <div
      className={`
        inline-flex items-center gap-2
        px-3 py-1.5
        rounded-full
        bg-muted/50
        border border-border/50
        ${className}
      `}
    >
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-sm font-medium text-muted-foreground">
        {text}
      </span>
    </div>
  );
}
```

---

### Price Display Component

Formatted price with tooltip:

```typescript
// components/productos/PriceDisplay.tsx
import type { Variacion } from "@/lib/types";
import { calculatePriceRange } from "@/lib/utils/variations";

interface PriceDisplayProps {
  variaciones: Variacion[];
  selected?: Variacion;
  showRange?: boolean;
}

/**
 * PriceDisplay - Show price or price range
 * 
 * Modes:
 * - Single price: When variation selected
 * - Price range: When multiple variations available
 */
export function PriceDisplay({
  variaciones,
  selected,
  showRange = true,
}: PriceDisplayProps) {
  const formatPrice = (precio: number): string => {
    return `$${precio.toLocaleString("es-AR")}`;
  };
  
  // Show selected variation price
  if (selected) {
    return (
      <div className="space-y-1">
        <p className="text-3xl font-bold text-foreground">
          {formatPrice(selected.precio)}
        </p>
        <p className="text-sm text-muted-foreground">
          {selected.tamanio} • {selected.color}
        </p>
      </div>
    );
  }
  
  // Show price range
  if (showRange) {
    const range = calculatePriceRange(variaciones);
    
    if (range.min === 0) {
      return (
        <p className="text-lg text-muted-foreground">
          Consultar precio
        </p>
      );
    }
    
    if (range.hasRange) {
      return (
        <div className="space-y-1">
          <p className="text-xl font-semibold text-foreground">
            Desde {formatPrice(range.min)}
          </p>
          <p className="text-sm text-muted-foreground">
            Hasta {formatPrice(range.max)}
          </p>
        </div>
      );
    }
    
    return (
      <p className="text-xl font-semibold text-foreground">
        {formatPrice(range.min)}
      </p>
    );
  }
  
  return null;
}
```

---

## Validation Rules

### Validation Functions

```typescript
// lib/utils/variations-validation.ts
import type { Variacion } from "@/lib/types";

/**
 * Validate variation data before saving to database
 */
export interface ValidationError {
  field: string;
  message: string;
}

export function validateVariation(
  variacion: Partial<Variacion>,
  existingVariaciones: Variacion[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!variacion.producto_id) {
    errors.push({ field: "producto_id", message: "Producto requerido" });
  }
  
  if (!variacion.tamanio || variacion.tamanio.trim() === "") {
    errors.push({ field: "tamanio", message: "Tamaño requerido" });
  }
  
  if (!variacion.color || variacion.color.trim() === "") {
    errors.push({ field: "color", message: "Color requerido" });
  }
  
  // Price validation
  if (variacion.precio === undefined || variacion.precio === null) {
    errors.push({ field: "precio", message: "Precio requerido" });
  } else if (variacion.precio <= 0) {
    errors.push({ field: "precio", message: "Precio debe ser mayor a 0" });
  }
  
  // Stock validation
  if (variacion.stock === undefined || variacion.stock === null) {
    errors.push({ field: "stock", message: "Stock requerido" });
  } else if (variacion.stock < 0) {
    errors.push({ field: "stock", message: "Stock no puede ser negativo" });
  }
  
  // Uniqueness check (tamanio + color per producto)
  if (variacion.producto_id && variacion.tamanio && variacion.color) {
    const duplicate = existingVariaciones.find(
      v =>
        v.id !== variacion.id &&
        v.producto_id === variacion.producto_id &&
        v.tamanio === variacion.tamanio &&
        v.color === variacion.color
    );
    
    if (duplicate) {
      errors.push({
        field: "unique",
        message: `Ya existe una variación ${variacion.tamanio} - ${variacion.color}`,
      });
    }
  }
  
  return errors;
}

/**
 * Check if variation is valid for display
 */
export function isVariacionValida(variacion: Variacion): boolean {
  return (
    variacion.activo &&
    variacion.precio > 0 &&
    variacion.tamanio.trim() !== "" &&
    variacion.color.trim() !== ""
  );
}
```

---

## Database Operations

### Create Variation

```typescript
// lib/supabase/mutations/variations.ts
import { createClient } from "@/lib/supabase/server";
import type { Variacion } from "@/lib/types";
import { validateVariation } from "@/lib/utils/variations-validation";

export async function createVariacion(
  data: Omit<Variacion, "id">
): Promise<{ data: Variacion | null; error: string | null }> {
  // Validate
  const errors = validateVariation(data);
  if (errors.length > 0) {
    return {
      data: null,
      error: errors.map(e => e.message).join(", "),
    };
  }
  
  const supabase = await createClient();
  
  const { data: variacion, error } = await supabase
    .from("variaciones")
    .insert(data)
    .select()
    .single();
  
  if (error) {
    return { data: null, error: error.message };
  }
  
  // Revalidate product page
  // revalidatePath(`/productos/${producto.slug}`);
  
  return { data: variacion as Variacion, error: null };
}
```

### Update Variation

```typescript
// lib/supabase/mutations/variations.ts

export async function updateVariacion(
  id: string,
  updates: Partial<Variacion>
): Promise<{ data: Variacion | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: variacion, error } = await supabase
    .from("variaciones")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    return { data: null, error: error.message };
  }
  
  return { data: variacion as Variacion, error: null };
}
```

### Delete Variation (Soft Delete)

```typescript
// lib/supabase/mutations/variations.ts

export async function deactivateVariacion(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("variaciones")
    .update({ activo: false })
    .eq("id", id);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null };
}
```

---

## Testing Variations

### Unit Tests

```typescript
// lib/utils/__tests__/variations.test.ts
import { describe, test, expect } from "vitest";
import {
  getUniqueSizes,
  getColorsForSize,
  findVariation,
  calculatePriceRange,
} from "../variations";
import type { Variacion } from "@/lib/types";

describe("Variations Utilities", () => {
  const mockVariaciones: Variacion[] = [
    {
      id: "1",
      producto_id: "prod-1",
      tamanio: "150x200cm",
      color: "Rojo",
      precio: 15000,
      stock: 5,
      sku: null,
      activo: true,
    },
    {
      id: "2",
      producto_id: "prod-1",
      tamanio: "150x200cm",
      color: "Azul",
      precio: 15000,
      stock: 3,
      activo: true,
    },
    {
      id: "3",
      producto_id: "prod-1",
      tamanio: "180x250cm",
      color: "Rojo",
      precio: 18500,
      stock: 2,
      activo: true,
    },
  ];
  
  test("getUniqueSizes returns sorted unique sizes", () => {
    const sizes = getUniqueSizes(mockVariaciones);
    expect(sizes).toEqual(["150x200cm", "180x250cm"]);
  });
  
  test("getColorsForSize returns colors for specific size", () => {
    const colors = getColorsForSize(mockVariaciones, "150x200cm");
    expect(colors).toEqual(["Azul", "Rojo"]);
  });
  
  test("findVariation finds correct variation", () => {
    const variation = findVariation(mockVariaciones, "150x200cm", "Azul");
    expect(variation?.id).toBe("2");
  });
  
  test("calculatePriceRange computes min and max", () => {
    const range = calculatePriceRange(mockVariaciones);
    expect(range.min).toBe(15000);
    expect(range.max).toBe(18500);
    expect(range.hasRange).toBe(true);
  });
});
```

---

## Business Rules Summary

| Rule | Description | Enforcement |
|------|-------------|-------------|
| Unique Combination | Each `tamanio + color` combo must be unique per product | Database constraint |
| Price Required | Every variation must have a price > 0 | Validation + DB constraint |
| Stock Non-Negative | Stock cannot be negative (0 = available on request) | Validation + DB constraint |
| Active Flag | Only active variations shown in selectors | Application logic |
| Cascade Delete | Deleting product deletes all variations | Database FK cascade |
| Principal Image | At least one image per product | Business rule (not enforced) |

---

## Future Enhancements (V2)

### 1. Multi-Image Variations

Associate specific images with variations:

```typescript
interface ImagenVariacion {
  id: string;
  variacion_id: string;
  imagen_id: string;
}

// Show different images when variation changes
const imagenParaVariacion = imagenes.find(
  img => img.variacion_id === variacion.id
) || imagenPrincipal;
```

### 2. Bulk Price Updates

Admin panel feature to update prices across variations:

```typescript
export async function updatePreciosCategoria(
  categoria_id: string,
  porcentaje: number
): Promise<void> {
  // Update all variations in a category by percentage
  const supabase = await createClient();
  
  await supabase.rpc("update_precios_categoria", {
    p_categoria_id: categoria_id,
    p_porcentaje: porcentaje,
  });
}
```

### 3. Stock Reservations

Reserve stock temporarily during checkout:

```typescript
interface ReservaStock {
  variacion_id: string;
  cantidad: number;
  expires_at: Date;
}

// Reserve stock for 15 minutes
export async function reservarStock(
  variacion_id: string,
  cantidad: number
): Promise<boolean> {
  // Check available stock
  // Create reservation
  // Set expiration timer
  // Return success/failure
}
```

### 4. Size Charts

Add size guide modal:

```typescript
// components/productos/SizeChart.tsx
export function SizeChart({ categoria }: { categoria: string }) {
  const sizeGuides = {
    manteles: [
      { size: "150x200cm", people: "4-6 personas", tableSize: "80-100cm" },
      { size: "180x250cm", people: "6-8 personas", tableSize: "100-120cm" },
      { size: "200x300cm", people: "8-10 personas", tableSize: "120-150cm" },
    ],
  };
  
  // Render table with size recommendations
}
```

---

## Related Resources

- Database Schema: `.github/reference/database-schema.md`
- TypeScript Types: `lib/types.ts`
- Component Implementation: `components/productos/VariationSelector.tsx`
- Business Logic: `.github/reference/business-logic.md`
- Supabase Queries: `.github/skills/supabase-queries/SKILL.md`
