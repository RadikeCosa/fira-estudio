"use client";

import { useState, useEffect, useMemo } from "react";
import { Variacion } from "@/lib/types";

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
    [variaciones]
  );

  const [tamanioSeleccionado, setTamanioSeleccionado] = useState<string>(
    primeraVariacion?.tamanio || ""
  );
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    primeraVariacion?.color || ""
  );

  // Tamaños únicos
  const tamaniosDisponibles = useMemo(
    () =>
      Array.from(
        new Set(variaciones.filter((v) => v.activo).map((v) => v.tamanio))
      ).sort(),
    [variaciones]
  );

  // Colores para el tamaño seleccionado
  const coloresDisponibles = useMemo(
    () =>
      tamanioSeleccionado
        ? Array.from(
            new Set(
              variaciones
                .filter((v) => v.activo && v.tamanio === tamanioSeleccionado)
                .map((v) => v.color)
            )
          ).sort()
        : [],
    [tamanioSeleccionado, variaciones]
  );

  // Variación actual derivada
  const variacionActual = useMemo(
    () =>
      tamanioSeleccionado && colorSeleccionado
        ? variaciones.find(
            (v) =>
              v.activo &&
              v.tamanio === tamanioSeleccionado &&
              v.color === colorSeleccionado
          ) || null
        : null,
    [tamanioSeleccionado, colorSeleccionado, variaciones]
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

  const formatearPrecio = (precio: number): string => {
    return `$${precio.toLocaleString("es-AR")}`;
  };

  const hayVariaciones = variaciones.length > 0;

  return (
    <div className="space-y-4">
      {/* Selector de tamaño */}
      <div className="space-y-2">
        <label
          htmlFor="tamanio-select"
          className="block text-sm font-medium text-foreground"
        >
          Tamaño
        </label>
        <select
          id="tamanio-select"
          value={tamanioSeleccionado}
          onChange={handleTamanioChange}
          disabled={!hayVariaciones}
          className="
            w-full px-4 py-2 rounded-lg
            border border-border
            bg-background text-foreground
            focus:outline-none focus:ring-2 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
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
      <div className="space-y-2">
        <label
          htmlFor="color-select"
          className="block text-sm font-medium text-foreground"
        >
          Color
        </label>
        <select
          id="color-select"
          value={colorSeleccionado}
          onChange={handleColorChange}
          disabled={!hayVariaciones || coloresDisponibles.length === 0}
          className="
            w-full px-4 py-2 rounded-lg
            border border-border
            bg-background text-foreground
            focus:outline-none focus:ring-2 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
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

      {/* Precio y stock */}
      {variacionActual && (
        <div
          className="
          pt-4 mt-4
          border-t border-border
        "
        >
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">
              {formatearPrecio(variacionActual.precio)}
            </p>
            <p className="text-sm text-accent">
              {variacionActual.stock > 0
                ? `${variacionActual.stock} ${
                    variacionActual.stock === 1 ? "disponible" : "disponibles"
                  }`
                : "A pedido"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
