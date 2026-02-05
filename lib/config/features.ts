/**
 * Feature Flags - Control de funcionalidades por entorno
 *
 * Estas flags permiten habilitar/deshabilitar features según el entorno
 * sin necesidad de deployar código diferente.
 */

/**
 * Determina si el sitio está en modo mantenimiento
 * En mantenimiento: se deshabilita el checkout pero el sitio sigue visible
 */
export const IS_MAINTENANCE_MODE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

/**
 * Determina si el checkout está habilitado
 * Útil para deshabilitar compras sin poner todo el sitio en mantenimiento
 */
export const IS_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

/**
 * Mensaje de mantenimiento personalizable
 */
export const MAINTENANCE_MESSAGE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
  "Estamos realizando mejoras en nuestro sistema de pagos. Pronto volveremos a estar operativos.";

/**
 * Fecha estimada de fin de mantenimiento (opcional)
 */
export const MAINTENANCE_END_DATE =
  process.env.NEXT_PUBLIC_MAINTENANCE_END_DATE || null;

// Log en desarrollo para debugging
if (process.env.NODE_ENV === "development") {
  console.log("[Feature Flags]", {
    IS_MAINTENANCE_MODE,
    IS_CHECKOUT_ENABLED,
    MAINTENANCE_MESSAGE,
  });
}
