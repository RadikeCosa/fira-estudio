"use client";

import { useState, useEffect, useMemo } from "react";
import { Variacion } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { StockBadge } from "./StockBadge";
import {
  getUniqueSizes,
  getColorsForSize,
  findVariation,
} from "@/lib/utils/variations";

interface VariationSelectorProps {
  variaciones: Variacion[];
  onVariacionChange: (variacion: Variacion | null) => void;
}

/**
 * VariationSelector - Selector de variaciones de producto
 *
 * Permite seleccionar tamaño y color, actualiza precio y muestra stock
 *
 * @param variaciones - Array de variaciones disponibles del producto
 * @param onVariacionChange - Callback que se ejecuta cuando cambia la selección
 */
export function VariationSelector({
  variaciones,
  onVariacionChange,
}: VariationSelectorProps) {
  // Inicializar con primera variación disponible
  const primeraVariacion = useMemo(
    () => variaciones.find((v) => v.activo),
    [variaciones],
  );

  const [tamanioSeleccionado, setTamanioSeleccionado] = useState<string>(
    primeraVariacion?.tamanio || "",
  );
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    primeraVariacion?.color || "",
  );

  // Tamaños únicos
  const tamaniosDisponibles = useMemo(
    () => getUniqueSizes(variaciones),
    [variaciones],
  );

  // Colores para el tamaño seleccionado
  const coloresDisponibles = useMemo(
    () => getColorsForSize(variaciones, tamanioSeleccionado),
    [tamanioSeleccionado, variaciones],
  );

  // Variación actual derivada
  const variacionActual = useMemo(
    () =>
      tamanioSeleccionado && colorSeleccionado
        ? findVariation(variaciones, tamanioSeleccionado, colorSeleccionado)
        : null,
    [tamanioSeleccionado, colorSeleccionado, variaciones],
  );

  // Notificar cambio de variación
  useEffect(() => {
    onVariacionChange(variacionActual);
  }, [variacionActual, onVariacionChange]);

  // Resetear color si no está disponible para el nuevo tamaño
  const handleTamanioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTamanio = e.target.value;
    setTamanioSeleccionado(nuevoTamanio);

    const coloresParaTamanio = variaciones
      .filter((v) => v.activo && v.tamanio === nuevoTamanio)
      .map((v) => v.color);

    if (!coloresParaTamanio.includes(colorSeleccionado)) {
      setColorSeleccionado(coloresParaTamanio[0] || "");
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorSeleccionado(e.target.value);
  };

  const hayVariaciones = variaciones.length > 0;

  return (
    <div className="space-y-6">
      {/* Selector de tamaño */}
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
          disabled={!hayVariaciones}
          className="
            w-full px-4 py-3.5 rounded-xl
            border-2 border-border
            bg-surface text-foreground
            font-medium
            shadow-sm
            transition-all
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-focus-ring
            focus:border-focus-ring
            disabled:opacity-50
            disabled:cursor-not-allowed
            hover:border-foreground/30
          "
        >
          {!hayVariaciones && (
            <option value="">Sin variaciones disponibles</option>
          )}
          {tamaniosDisponibles.map((tamanio) => (
            <option key={tamanio} value={tamanio}>
              {tamanio}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de color */}
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
          disabled={!hayVariaciones || coloresDisponibles.length === 0}
          className="
            w-full px-4 py-3.5 rounded-xl
            border-2 border-border
            bg-surface text-foreground
            font-medium
            shadow-sm
            transition-all
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-focus-ring
            focus:border-focus-ring
            disabled:opacity-50
            disabled:cursor-not-allowed
            hover:border-foreground/30
          "
        >
          {coloresDisponibles.length === 0 && tamanioSeleccionado && (
            <option value="">Seleccione un tamaño primero</option>
          )}
          {coloresDisponibles.map((color) => {
            const variacionColor = variaciones.find(
              (v) =>
                v.activo &&
                v.tamanio === tamanioSeleccionado &&
                v.color === color,
            );
            const stockText = variacionColor?.stock === 0 ? " (A pedido)" : "";

            return (
              <option key={color} value={color}>
                {color}
                {stockText}
              </option>
            );
          })}
        </select>
        {/* Tooltip explicativo para productos a pedido */}
        {variacionActual && variacionActual.stock === 0 && (
          <p className="text-xs text-muted-foreground italic">
            <span aria-label="Información" role="img">
              💡
            </span>{" "}
            Este producto se fabrica bajo pedido
          </p>
        )}
      </div>

      {/* Precio y stock */}
      {variacionActual && (
        <div
          className="
          pt-6 mt-6
          border-t-2 border-border/50
        "
        >
          <div className="space-y-3">
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatPrice(variacionActual.precio)}
            </p>
            <StockBadge variacion={variacionActual} />
          </div>
        </div>
      )}
    </div>
  );
}
