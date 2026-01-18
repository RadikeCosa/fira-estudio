import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Variacion } from "@/lib/types";
import {
  getUniqueSizes,
  getColorsForSize,
  findVariation,
  calculatePriceRange,
} from "./variations";

// Mock data for tests
const mockVariaciones: Variacion[] = [
  {
    id: "1",
    producto_id: "prod-1",
    tamanio: "150x200cm",
    color: "Rojo",
    precio: 15000,
    stock: 5,
    sku: "MAN-150x200-ROJO",
    activo: true,
  },
  {
    id: "2",
    producto_id: "prod-1",
    tamanio: "150x200cm",
    color: "Azul",
    precio: 15000,
    stock: 3,
    sku: "MAN-150x200-AZUL",
    activo: true,
  },
  {
    id: "3",
    producto_id: "prod-1",
    tamanio: "180x250cm",
    color: "Rojo",
    precio: 18500,
    stock: 0,
    sku: "MAN-180x250-ROJO",
    activo: true,
  },
  {
    id: "4",
    producto_id: "prod-1",
    tamanio: "180x250cm",
    color: "Verde",
    precio: 18500,
    stock: 0,
    sku: "MAN-180x250-VERDE",
    activo: false,
  },
];

describe("getUniqueSizes", () => {
  it("returns unique sizes sorted correctly", () => {
    const sizes = getUniqueSizes(mockVariaciones);
    assert.deepEqual(sizes, ["150x200cm", "180x250cm"]);
  });

  it("excludes inactive variations", () => {
    const variacionesWithInactive: Variacion[] = [
      {
        id: "5",
        producto_id: "prod-2",
        tamanio: "200x300cm",
        color: "Negro",
        precio: 20000,
        stock: 2,
        sku: "MAN-200x300-NEGRO",
        activo: false,
      },
      ...mockVariaciones,
    ];

    const sizes = getUniqueSizes(variacionesWithInactive);
    assert.deepEqual(sizes, ["150x200cm", "180x250cm"]);
    assert.equal(sizes.includes("200x300cm"), false);
  });

  it("sorts dimensions correctly (150x200 before 180x250)", () => {
    const unorderedVariaciones: Variacion[] = [
      {
        id: "6",
        producto_id: "prod-3",
        tamanio: "180x250cm",
        color: "Rojo",
        precio: 18500,
        stock: 1,
        sku: null,
        activo: true,
      },
      {
        id: "7",
        producto_id: "prod-3",
        tamanio: "150x200cm",
        color: "Azul",
        precio: 15000,
        stock: 2,
        sku: null,
        activo: true,
      },
      {
        id: "8",
        producto_id: "prod-3",
        tamanio: "200x280cm",
        color: "Verde",
        precio: 22000,
        stock: 1,
        sku: null,
        activo: true,
      },
    ];

    const sizes = getUniqueSizes(unorderedVariaciones);
    assert.deepEqual(sizes, ["150x200cm", "180x250cm", "200x280cm"]);
  });

  it("returns empty array for empty input", () => {
    const sizes = getUniqueSizes([]);
    assert.deepEqual(sizes, []);
  });

  it("returns empty array when all variations are inactive", () => {
    const inactiveVariaciones: Variacion[] = mockVariaciones.map((v) => ({
      ...v,
      activo: false,
    }));

    const sizes = getUniqueSizes(inactiveVariaciones);
    assert.deepEqual(sizes, []);
  });
});

describe("getColorsForSize", () => {
  it("returns colors for specific size", () => {
    const colors = getColorsForSize(mockVariaciones, "150x200cm");
    assert.deepEqual(colors, ["Rojo", "Azul"]);
  });

  it("excludes inactive variations", () => {
    const colors = getColorsForSize(mockVariaciones, "180x250cm");
    // Only "Rojo" should be returned, not "Verde" (inactive)
    assert.deepEqual(colors, ["Rojo"]);
  });

  it("returns empty array for non-existent size", () => {
    const colors = getColorsForSize(mockVariaciones, "300x400cm");
    assert.deepEqual(colors, []);
  });

  it("returns empty array for empty input", () => {
    const colors = getColorsForSize([], "150x200cm");
    assert.deepEqual(colors, []);
  });

  it("returns multiple colors for same size", () => {
    const variacionesWithMoreColors: Variacion[] = [
      ...mockVariaciones,
      {
        id: "9",
        producto_id: "prod-1",
        tamanio: "150x200cm",
        color: "Verde",
        precio: 15000,
        stock: 2,
        sku: "MAN-150x200-VERDE",
        activo: true,
      },
      {
        id: "10",
        producto_id: "prod-1",
        tamanio: "150x200cm",
        color: "Amarillo",
        precio: 15000,
        stock: 1,
        sku: "MAN-150x200-AMARILLO",
        activo: true,
      },
    ];

    const colors = getColorsForSize(variacionesWithMoreColors, "150x200cm");
    assert.deepEqual(colors, ["Rojo", "Azul", "Verde", "Amarillo"]);
  });
});

describe("findVariation", () => {
  it("finds variation by size and color", () => {
    const variation = findVariation(mockVariaciones, "150x200cm", "Rojo");
    assert.notEqual(variation, null);
    assert.equal(variation?.id, "1");
    assert.equal(variation?.tamanio, "150x200cm");
    assert.equal(variation?.color, "Rojo");
    assert.equal(variation?.precio, 15000);
  });

  it("returns null for non-existent combination", () => {
    const variation = findVariation(mockVariaciones, "150x200cm", "Negro");
    assert.equal(variation, null);
  });

  it("returns null for inactive variation", () => {
    const variation = findVariation(mockVariaciones, "180x250cm", "Verde");
    assert.equal(variation, null);
  });

  it("returns null for empty input", () => {
    const variation = findVariation([], "150x200cm", "Rojo");
    assert.equal(variation, null);
  });

  it("returns null for non-existent size", () => {
    const variation = findVariation(mockVariaciones, "300x400cm", "Rojo");
    assert.equal(variation, null);
  });

  it("returns correct variation when multiple matches exist", () => {
    const variation = findVariation(mockVariaciones, "150x200cm", "Azul");
    assert.notEqual(variation, null);
    assert.equal(variation?.id, "2");
    assert.equal(variation?.color, "Azul");
  });

  it("returns active variation even with stock 0", () => {
    const variation = findVariation(mockVariaciones, "180x250cm", "Rojo");
    assert.notEqual(variation, null);
    assert.equal(variation?.stock, 0);
    assert.equal(variation?.activo, true);
  });
});

describe("calculatePriceRange", () => {
  it("calculates min and max correctly", () => {
    const result = calculatePriceRange(mockVariaciones);
    assert.equal(result.min, 15000);
    assert.equal(result.max, 18500);
    assert.equal(result.hasRange, true);
  });

  it("detects hasRange = false when all prices are equal", () => {
    const equalPriceVariaciones: Variacion[] = [
      {
        id: "11",
        producto_id: "prod-4",
        tamanio: "150x200cm",
        color: "Rojo",
        precio: 12000,
        stock: 5,
        sku: null,
        activo: true,
      },
      {
        id: "12",
        producto_id: "prod-4",
        tamanio: "150x200cm",
        color: "Azul",
        precio: 12000,
        stock: 3,
        sku: null,
        activo: true,
      },
      {
        id: "13",
        producto_id: "prod-4",
        tamanio: "180x250cm",
        color: "Verde",
        precio: 12000,
        stock: 2,
        sku: null,
        activo: true,
      },
    ];

    const result = calculatePriceRange(equalPriceVariaciones);
    assert.equal(result.min, 12000);
    assert.equal(result.max, 12000);
    assert.equal(result.hasRange, false);
  });

  it("excludes inactive variations", () => {
    const variacionesWithExpensive: Variacion[] = [
      ...mockVariaciones,
      {
        id: "14",
        producto_id: "prod-1",
        tamanio: "250x350cm",
        color: "Oro",
        precio: 50000,
        stock: 1,
        sku: "MAN-250x350-ORO",
        activo: false,
      },
    ];

    const result = calculatePriceRange(variacionesWithExpensive);
    // Should not include the 50000 price from inactive variation
    assert.equal(result.min, 15000);
    assert.equal(result.max, 18500);
    assert.equal(result.hasRange, true);
  });

  it("returns zeros when no active variations", () => {
    const inactiveVariaciones: Variacion[] = mockVariaciones.map((v) => ({
      ...v,
      activo: false,
    }));

    const result = calculatePriceRange(inactiveVariaciones);
    assert.equal(result.min, 0);
    assert.equal(result.max, 0);
    assert.equal(result.hasRange, false);
  });

  it("returns zeros for empty input", () => {
    const result = calculatePriceRange([]);
    assert.equal(result.min, 0);
    assert.equal(result.max, 0);
    assert.equal(result.hasRange, false);
  });

  it("handles single active variation", () => {
    const singleVariacion: Variacion[] = [
      {
        id: "15",
        producto_id: "prod-5",
        tamanio: "150x200cm",
        color: "Rojo",
        precio: 17000,
        stock: 5,
        sku: null,
        activo: true,
      },
    ];

    const result = calculatePriceRange(singleVariacion);
    assert.equal(result.min, 17000);
    assert.equal(result.max, 17000);
    assert.equal(result.hasRange, false);
  });

  it("handles wide price range", () => {
    const wideRangeVariaciones: Variacion[] = [
      {
        id: "16",
        producto_id: "prod-6",
        tamanio: "100x150cm",
        color: "Básico",
        precio: 5000,
        stock: 10,
        sku: null,
        activo: true,
      },
      {
        id: "17",
        producto_id: "prod-6",
        tamanio: "250x350cm",
        color: "Premium",
        precio: 45000,
        stock: 1,
        sku: null,
        activo: true,
      },
    ];

    const result = calculatePriceRange(wideRangeVariaciones);
    assert.equal(result.min, 5000);
    assert.equal(result.max, 45000);
    assert.equal(result.hasRange, true);
  });
});
