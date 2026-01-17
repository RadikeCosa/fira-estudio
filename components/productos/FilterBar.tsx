"use client";
import { useState } from "react";
import { Categoria } from "@/lib/types";

export interface ProductFilters {
  categorias: string[];
  precioMin?: number;
  precioMax?: number;
}

export interface FilterBarProps {
  categorias: Categoria[];
  onFilterChange: (filters: ProductFilters) => void;
  productCount: number;
}

export function FilterBar({
  categorias,
  onFilterChange,
  productCount,
}: FilterBarProps) {
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [precioMin, setPrecioMin] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");

  const handleCategoriaChange = (id: string) => {
    setSelectedCategorias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handlePrecioMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrecioMin(e.target.value);
  };
  const handlePrecioMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrecioMax(e.target.value);
  };

  const handleClear = () => {
    setSelectedCategorias([]);
    setPrecioMin("");
    setPrecioMax("");
    onFilterChange({
      categorias: [],
      precioMin: undefined,
      precioMax: undefined,
    });
  };

  // Notificar cambios
  const handleApply = () => {
    onFilterChange({
      categorias: selectedCategorias,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
    });
  };

  // Actualizar filtros al cambiar
  // ...existing code...
  // (En mobile, se puede usar modal/drawer, aquí solo layout base)

  return (
    <aside className="w-full sm:w-64 p-4 bg-white rounded-2xl border border-border/50 shadow space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-2">Categorías</h3>
        <div className="flex flex-col gap-2">
          {categorias.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategorias.includes(cat.id)}
                onChange={() => handleCategoriaChange(cat.id)}
                className="accent-primary w-4 h-4 rounded"
              />
              <span className="text-sm">{cat.nombre}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2">Precio</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            value={precioMin}
            onChange={handlePrecioMinChange}
            placeholder="Min"
            className="w-20 px-2 py-1 rounded border border-border text-sm"
          />
          <span>-</span>
          <input
            type="number"
            min={0}
            value={precioMax}
            onChange={handlePrecioMaxChange}
            placeholder="Max"
            className="w-20 px-2 py-1 rounded border border-border text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 items-center justify-between mt-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 rounded bg-muted text-foreground border border-border hover:bg-primary/10 transition duration-300"
        >
          Limpiar filtros
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          {productCount} productos
        </span>
        <button
          type="button"
          onClick={handleApply}
          className="px-3 py-1 rounded bg-primary text-white font-semibold shadow hover:bg-primary/80 transition duration-300"
        >
          Aplicar
        </button>
      </div>
    </aside>
  );
}
