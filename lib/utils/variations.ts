/**
 * Utility functions for handling product variations
 */
import type { Variacion } from "@/lib/types";

/**
 * Extract unique sizes from variations array
 * Only includes active variations, sorted naturally
 */
export function getUniqueSizes(variaciones: Variacion[]): string[] {
  const activeSizes = variaciones
    .filter((v) => v.activo)
    .map((v) => v.tamanio);

  const uniqueSizes = Array.from(new Set(activeSizes));

  // Natural sort for dimensions (e.g., "150x200cm" before "180x250cm")
  return uniqueSizes.sort((a: string, b: string) => {
    // Extract numeric values for comparison
    const matchA = a.match(/^(\d+)x(\d+)/);
    const matchB = b.match(/^(\d+)x(\d+)/);

    if (matchA && matchB) {
      const [, widthA, heightA] = matchA.map(Number);
      const [, widthB, heightB] = matchB.map(Number);

      // Compare by width first, then height
      if (widthA !== widthB) return widthA - widthB;
      return heightA - heightB;
    }

    // Fallback to string comparison
    return a.localeCompare(b);
  });
}

/**
 * Get available colors for a specific size
 * Only includes active variations
 */
export function getColorsForSize(
  variaciones: Variacion[],
  tamanio: string,
): string[] {
  return variaciones
    .filter((v) => v.activo && v.tamanio === tamanio)
    .map((v) => v.color);
}

/**
 * Find a specific variation by size and color
 * Returns null if not found or inactive
 */
export function findVariation(
  variaciones: Variacion[],
  tamanio: string,
  color: string,
): Variacion | null {
  const found = variaciones.find(
    (v) => v.activo && v.tamanio === tamanio && v.color === color,
  );

  return found ?? null;
}

/**
 * Calculate price range from variations
 * Only considers active variations
 */
export function calculatePriceRange(variaciones: Variacion[]): {
  min: number;
  max: number;
  hasRange: boolean;
} {
  const activePrices = variaciones
    .filter((v) => v.activo)
    .map((v) => v.precio);

  if (activePrices.length === 0) {
    return { min: 0, max: 0, hasRange: false };
  }

  const min = Math.min(...activePrices);
  const max = Math.max(...activePrices);

  return {
    min,
    max,
    hasRange: min !== max,
  };
}
