/**
 * Feature Flags - Control de funcionalidades por entorno
 *
 * Estas flags permiten habilitar/deshabilitar features según el entorno
 * sin necesidad de deployar código diferente.
 */

/**
 * Determina si el sitio está en modo mantenimiento
 */
export const IS_MAINTENANCE_MODE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

/**
 * Mensaje de mantenimiento personalizable
 */
export const MAINTENANCE_MESSAGE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
  "Estamos actualizando el catalogo. El sitio puede mostrar informacion temporalmente incompleta.";

// Log en desarrollo para debugging
if (process.env.NODE_ENV === "development") {
  console.log("[Feature Flags]", {
    IS_MAINTENANCE_MODE,
    MAINTENANCE_MESSAGE,
  });
}
