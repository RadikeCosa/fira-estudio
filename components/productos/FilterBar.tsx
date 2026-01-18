"use client";

import { useState } from "react";
import { Categoria, ProductoCompleto } from "@/lib/types";
import { useProductFilters } from "./useProductFilters";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface FilterBarProps {
  categorias: Categoria[];
  productos: ProductoCompleto[];
}

/**
 * FilterBar - Sidebar with category and price filters
 * 
 * Uses useProductFilters hook for state management and URL sync
 * Provides category checkboxes and price range inputs
 * 
 * @param categorias - List of available categories
 * @param productos - All products to filter
 */
export function FilterBar({ categorias, productos }: FilterBarProps) {
  // Use the existing hook for filter state management
  const { filters, updateFilters, clearFilters, filteredProducts } =
    useProductFilters(productos);

  // Local state for price inputs (to allow typing without immediate filter)
  const [precioMinInput, setPrecioMinInput] = useState<string>(
    filters.precioMin?.toString() || ""
  );
  const [precioMaxInput, setPrecioMaxInput] = useState<string>(
    filters.precioMax?.toString() || ""
  );

  const handleCategoriaToggle = (categoriaId: string) => {
    const newCategorias = filters.categorias.includes(categoriaId)
      ? filters.categorias.filter((id) => id !== categoriaId)
      : [...filters.categorias, categoriaId];

    updateFilters({ categorias: newCategorias });
  };

  const handleApplyPriceFilter = () => {
    updateFilters({
      precioMin: precioMinInput ? Number(precioMinInput) : undefined,
      precioMax: precioMaxInput ? Number(precioMaxInput) : undefined,
    });
  };

  const handleClearAll = () => {
    setPrecioMinInput("");
    setPrecioMaxInput("");
    clearFilters();
  };

  return (
    <aside className="w-full sm:w-64 p-6 bg-white rounded-2xl border-2 border-border/50 shadow-lg space-y-6">
      {/* Categories Section */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-foreground">Categorías</h3>
        <div className="flex flex-col gap-3">
          {categorias.map((categoria) => (
            <label
              key={categoria.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.categorias.includes(categoria.id)}
                onChange={() => handleCategoriaToggle(categoria.id)}
                className="
                  w-4 h-4 rounded
                  border-2 border-border
                  text-foreground
                  focus:ring-2 focus:ring-foreground/20
                  transition-colors
                "
              />
              <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                {categoria.nombre}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-foreground">
          Rango de Precio
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={0}
              value={precioMinInput}
              onChange={(e) => setPrecioMinInput(e.target.value)}
              placeholder="Mínimo"
              className="w-full text-sm"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={0}
              value={precioMaxInput}
              onChange={(e) => setPrecioMaxInput(e.target.value)}
              placeholder="Máximo"
              className="w-full text-sm"
            />
          </div>
          <Button
            onClick={handleApplyPriceFilter}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Aplicar Precio
          </Button>
        </div>
      </div>

      {/* Footer with count and clear button */}
      <div className="pt-4 border-t-2 border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {filteredProducts.length} productos
          </span>
        </div>
        <Button
          onClick={handleClearAll}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          Limpiar Filtros
        </Button>
      </div>
    </aside>
  );
}
