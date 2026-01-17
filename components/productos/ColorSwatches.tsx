"use client";
import { useState } from "react";

export interface ColorSwatchesProps {
  colores: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

const tailwindColors: Record<string, string> = {
  blanco: "bg-white border-gray-300",
  negro: "bg-black border-gray-700",
  rojo: "bg-red-500 border-red-700",
  azul: "bg-blue-500 border-blue-700",
  verde: "bg-green-500 border-green-700",
  amarillo: "bg-yellow-400 border-yellow-600",
  gris: "bg-gray-400 border-gray-600",
  // Agrega más según la paleta de Tailwind
};

export function ColorSwatches({
  colores,
  selectedColor,
  onColorChange,
  disabled,
}: ColorSwatchesProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="flex flex-wrap gap-3 justify-start items-center"
      aria-label="Selector de color"
    >
      {colores.map((color) => {
        const isSelected = selectedColor === color;
        const colorClass =
          tailwindColors[color.toLowerCase()] || "bg-gray-200 border-gray-400";
        const isDisabled = disabled;
        return (
          <button
            key={color}
            type="button"
            aria-label={`Color ${color}${isDisabled ? " (sin stock)" : ""}`}
            aria-pressed={isSelected}
            disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
            onClick={() => !isDisabled && onColorChange(color)}
            onMouseEnter={() => setHovered(color)}
            onMouseLeave={() => setHovered(null)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow ${colorClass} ${isSelected ? "ring-2 ring-primary border-4" : ""} ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:scale-110 hover:border-primary/80 cursor-pointer"}`}
          >
            {isSelected ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-primary"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.293a1 1 0 010 1.414l-7.004 7.004a1 1 0 01-1.414 0l-3.004-3.004a1 1 0 111.414-1.414l2.297 2.297 6.297-6.297a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-xs text-black font-medium select-none pointer-events-none">
                {color}
              </span>
            )}
            {/* Tooltip */}
            {hovered === color && (
              <span className="absolute mt-12 px-2 py-1 bg-black text-white text-xs rounded shadow z-10 whitespace-nowrap">
                {color}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
