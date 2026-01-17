"use client";
import { useState } from "react";
import { Variacion } from "@/lib/types";

export interface SizeButtonsProps {
  tamanios: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  variaciones: Variacion[];
}

export function SizeButtons({
  tamanios,
  selectedSize,
  onSizeChange,
  variaciones,
}: SizeButtonsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Verifica disponibilidad por tamaño
  const isAvailable = (size: string) =>
    variaciones.some((v) => v.tamanio === size && v.stock > 0 && v.activo);

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full"
      aria-label="Selector de tamaño"
    >
      {tamanios.map((size) => {
        const available = isAvailable(size);
        const isSelected = selectedSize === size;
        return (
          <button
            key={size}
            type="button"
            aria-label={`Tamaño ${size}${!available ? " (sin stock)" : ""}`}
            aria-pressed={isSelected}
            disabled={!available}
            tabIndex={!available ? -1 : 0}
            onClick={() => available && onSizeChange(size)}
            onMouseEnter={() => setHovered(size)}
            onMouseLeave={() => setHovered(null)}
            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow text-sm relative ${isSelected ? "bg-primary border-black scale-105" : "bg-white border-border"} ${available ? "hover:bg-primary/10 hover:border-primary cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
          >
            <span className="block w-full text-center text-black">{size}</span>
            {/* Tooltip */}
            {hovered === size && !available && (
              <span className="absolute left-1/2 -translate-x-1/2 mt-10 px-2 py-1 bg-black text-white text-xs rounded shadow z-10 whitespace-nowrap">
                Sin stock
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
