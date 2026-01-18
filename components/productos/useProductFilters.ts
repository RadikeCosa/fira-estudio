import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductoCompleto } from "@/lib/types";

export interface ProductFilters {
  categorias: string[];
  precioMin?: number;
  precioMax?: number;
}

export function useProductFilters(productos: ProductoCompleto[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado local de filtros
  const [filters, setFilters] = useState<ProductFilters>(() => {
    const categorias = searchParams.getAll("categoria");
    const precioMin = searchParams.get("precioMin");
    const precioMax = searchParams.get("precioMax");
    return {
      categorias,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
    };
  });

  // Sincronizar con URL
  useEffect(() => {
    const params = new URLSearchParams();
    filters.categorias.forEach((cat) => params.append("categoria", cat));
    if (filters.precioMin !== undefined)
      params.set("precioMin", String(filters.precioMin));
    if (filters.precioMax !== undefined)
      params.set("precioMax", String(filters.precioMax));
    router.replace(`?${params.toString()}`);
  }, [filters, router]);

  // Aplicar filtros al array de productos
  const filteredProducts = productos.filter((prod) => {
    const matchCategoria =
      filters.categorias.length === 0 ||
      (prod.categoria && filters.categorias.includes(prod.categoria.id));
    const precio = prod.precio_desde || 0;
    const matchPrecioMin =
      filters.precioMin === undefined || precio >= filters.precioMin;
    const matchPrecioMax =
      filters.precioMax === undefined || precio <= filters.precioMax;
    return matchCategoria && matchPrecioMin && matchPrecioMax;
  });

  // Helper function to clear all filters
  const clearFilters = () => {
    setFilters({
      categorias: [],
      precioMin: undefined,
      precioMax: undefined,
    });
  };

  // Helper function to update specific filter fields
  const updateFilters = (updates: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  return {
    filters,
    setFilters,
    filteredProducts,
    clearFilters,
    updateFilters,
  };
}
