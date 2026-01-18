/**
 * Configuración centralizada del tema visual
 * Cambiar estos valores afecta todo el sitio
 */

export const THEME_CONFIG = {
  // Dimensiones de contenedores
  containers: {
    main: "max-w-7xl",
    narrow: "max-w-5xl",
    text: "max-w-2xl",
  },

  // Espaciado de páginas (separado en x e y para flexibilidad)
  pagePadding: {
    x: "px-4 sm:px-6 lg:px-8",
    y: "py-12 sm:py-16 lg:py-20",
  },

  // Bordes redondeados consistentes
  borderRadius: {
    card: "rounded-2xl",
    button: "rounded-xl",
    input: "rounded-xl",
    badge: "rounded-full",
  },

  // Features toggleables (para futuras optimizaciones)
  features: {
    shineEffect: true,
    gradientBlobs: true,
    smoothScrolling: true,
  },
} as const;
