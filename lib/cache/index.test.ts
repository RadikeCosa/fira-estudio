import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CACHE_CONFIG } from "./index";

describe("CACHE_CONFIG", () => {
  it("has correct revalidate times", () => {
    assert.equal(CACHE_CONFIG.productos.revalidate, 3600); // 1 hour
    assert.equal(CACHE_CONFIG.productos_filtrados.revalidate, 7200); // 2 hours
    assert.equal(CACHE_CONFIG.categorias.revalidate, 86400); // 24 hours
    assert.equal(CACHE_CONFIG.producto_detail.revalidate, 3600); // 1 hour
    assert.equal(CACHE_CONFIG.productos_relacionados.revalidate, 3600); // 1 hour
  });

  it("has correct tags", () => {
    assert.deepEqual(CACHE_CONFIG.productos.tags, ["productos"]);
    assert.deepEqual(CACHE_CONFIG.productos_filtrados.tags, ["productos"]);
    assert.deepEqual(CACHE_CONFIG.categorias.tags, ["categorias"]);
    assert.deepEqual(CACHE_CONFIG.producto_detail.tags, ["productos"]);
    assert.deepEqual(CACHE_CONFIG.productos_relacionados.tags, ["productos"]);
  });
});

describe("createCachedQuery", () => {
  it("configuration can be used to create cached queries", () => {
    // Verify config structure is valid
    assert.ok(CACHE_CONFIG.productos.revalidate > 0);
    assert.ok(CACHE_CONFIG.productos.tags.length > 0);
    assert.ok(CACHE_CONFIG.productos_filtrados.revalidate > 0);
    assert.ok(CACHE_CONFIG.productos_filtrados.tags.length > 0);
    assert.ok(CACHE_CONFIG.categorias.revalidate > 0);
    assert.ok(CACHE_CONFIG.categorias.tags.length > 0);
    assert.ok(CACHE_CONFIG.producto_detail.revalidate > 0);
    assert.ok(CACHE_CONFIG.producto_detail.tags.length > 0);
    assert.ok(CACHE_CONFIG.productos_relacionados.revalidate > 0);
    assert.ok(CACHE_CONFIG.productos_relacionados.tags.length > 0);
  });

  it("cache config has appropriate hierarchy", () => {
    // Categories should have longest cache (most stable)
    assert.ok(CACHE_CONFIG.categorias.revalidate > CACHE_CONFIG.productos_filtrados.revalidate);
    assert.ok(CACHE_CONFIG.categorias.revalidate > CACHE_CONFIG.productos.revalidate);
    assert.ok(CACHE_CONFIG.categorias.revalidate > CACHE_CONFIG.producto_detail.revalidate);
    
    // Filtered products should cache longer than general products list
    assert.ok(CACHE_CONFIG.productos_filtrados.revalidate > CACHE_CONFIG.productos.revalidate);
    
    // Product detail now has same cache as products list
    assert.equal(CACHE_CONFIG.producto_detail.revalidate, CACHE_CONFIG.productos.revalidate);
    
    // Related products should have same cache as products list
    assert.equal(CACHE_CONFIG.productos_relacionados.revalidate, CACHE_CONFIG.productos.revalidate);
  });
});
