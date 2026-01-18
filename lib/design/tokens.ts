// Design tokens centralizados para estilos comunes (usables en className)
// Inspirados en los valores de Tailwind usados en la Home

export const SPACING = {
  sectionPadding: {
    sm: "px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28",
    md: "px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36",
    lg: "px-4 py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40",
  },
  containerPadding: {
    sm: "px-4 sm:px-6 lg:px-8",
    md: "px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28",
    lg: "px-4 sm:px-6 lg:px-8 py-28 lg:py-36",
  },
};

export const ANIMATIONS = {
  fadeIn: "animate-in fade-in duration-700",
  fadeInDelayed: "animate-in fade-in duration-700 delay-150",
  shimmer: "shine-effect",
  hoverCard:
    "hover:shadow-card-hover hover:border-foreground/10 hover:-translate-y-2",
  hoverIcon: "transition-all group-hover:translate-x-1 group-hover:scale-110",
};

export const LAYOUT = {
  container: {
    maxW7xl: "mx-auto max-w-7xl",
    maxW4xl: "mx-auto max-w-4xl",
  },
  grid: {
    products: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8",
    categories: "grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8",
  },
};

export const GRADIENTS = {
  hero: "bg-gradient-to-b from-muted/50 via-background to-background",
  section: "bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30",
  card: "bg-gradient-to-br from-muted/50 to-muted",
};
