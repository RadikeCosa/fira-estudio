// Design tokens centralizados para estilos comunes (usables en className)
// Inspirados en los valores de Tailwind usados en la Home

// COLORES centralizados usando variables CSS de Tailwind
export const COLORS = {
  foreground: "text-foreground",
  background: "bg-background",
  muted: "text-muted bg-muted",
  border: "border-border",
  accent: "text-accent bg-accent",
} as const;

// SISTEMA DE TIPOGRAFÍA
export const TYPOGRAPHY = {
  heading: {
    page: "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
    section: "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl",
    card: "text-xl font-bold sm:text-2xl",
    subsection: "text-2xl font-semibold sm:text-3xl",
  },
  body: {
    base: "text-base leading-relaxed",
    small: "text-sm leading-relaxed",
    muted: "text-base text-muted-foreground",
  },
} as const;

// SPACING expandido
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
  page: "px-4 py-12 sm:px-8 sm:py-20 lg:px-16 lg:py-28",
  pageNarrow: "px-4 py-12 max-w-5xl mx-auto sm:px-8 sm:py-20 lg:px-16 lg:py-28",
  section: "mb-20 sm:mb-28",
  sectionLarge: "mb-32 sm:mb-40",
} as const;

// COMPONENTES comunes
export const COMPONENTS = {
  input: {
    base: "w-full rounded-xl border-2 border-border bg-white px-4 py-3.5 text-foreground transition-all duration-300",
    placeholder: "placeholder:text-muted-foreground",
    focus: "focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10",
    hover: "hover:border-foreground/30",
  },
  card: {
    base: "rounded-2xl border-2 border-border/50 bg-white shadow-lg",
    paddingSm: "p-6",
    paddingMd: "p-8 sm:p-10",
    paddingLg: "p-10 sm:p-12",
    hover: "transition-all duration-300 hover:shadow-2xl hover:border-foreground/10 hover:-translate-y-2",
  },
  iconContainer: {
    base: "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted text-foreground shadow-md",
    hover: "transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
  },
} as const;

// LAYOUT expandido
export const LAYOUT = {
  container: {
    maxW7xl: "mx-auto max-w-7xl",
    maxW5xl: "mx-auto max-w-5xl",
    maxW4xl: "mx-auto max-w-4xl",
    maxW2xl: "mx-auto max-w-2xl",
  },
  grid: {
    products: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8",
    categories: "grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8",
    twoCol: "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12",
    features: "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:gap-16",
  },
} as const;

// ANIMACIONES
export const ANIMATIONS = {
  fadeIn: "animate-in fade-in duration-700",
  fadeInDelayed: "animate-in fade-in duration-700 delay-150",
  shimmer: "shine-effect",
  hoverCard: "hover:shadow-card-hover hover:border-foreground/10 hover:-translate-y-2",
  hoverIcon: "transition-all group-hover:translate-x-1 group-hover:scale-110",
} as const;

// GRADIENTES
export const GRADIENTS = {
  hero: "bg-gradient-to-b from-muted/50 via-background to-background",
  section: "bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30",
  card: "bg-gradient-to-br from-muted/50 to-muted",
} as const;

// Helper para combinar tokens
export const combine = (...tokens: (string | undefined)[]) =>
  tokens.filter(Boolean).join(" ");
