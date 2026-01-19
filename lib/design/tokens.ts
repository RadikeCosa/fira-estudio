/**
 * Design Tokens - Muma Estudio
 * Boutique/Minimalist Design System
 */

export const COLORS = {
  foreground: "text-foreground",
  background: "bg-background",
  muted: "text-muted",
  mutedbg: "bg-muted",
  border: "border-border",
  accent: "text-accent bg-accent",
  primary: "text-primary bg-primary",
} as const;

export const TYPOGRAPHY = {
  heading: {
    hero: "font-display text-5xl md:text-6xl leading-[1.1] tracking-tight",
    page: "font-display text-4xl tracking-tight",
    section: "font-display text-3xl tracking-tight",
    card: "font-display text-xl",
  },
  body: {
    base: "font-sans text-base leading-relaxed",
    large: "font-sans text-lg leading-relaxed",
    small: "font-sans text-sm leading-relaxed",
    muted: "text-zinc-500 dark:text-zinc-400",
  },
  decorative: {
    badge: "text-[10px] tracking-widest uppercase font-medium",
    label: "text-xs tracking-[0.2em] uppercase",
  },
} as const;

export const SPACING = {
  section: {
    sm: "py-12 px-6",
    md: "py-20 px-6",
    lg: "py-24 px-6",
  },
  container: "max-w-lg mx-auto",
  containerWide: "max-w-7xl mx-auto",
  // Legacy support for existing components
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
} as const;

export const COMPONENTS = {
  badge: {
    outline: "inline-block py-1 px-3 border border-primary text-primary text-[10px] tracking-widest uppercase font-medium",
    filled: "bg-primary text-white text-[10px] tracking-tighter py-1 px-3 uppercase",
  },
  card: {
    product: "group cursor-pointer",
    image: "relative overflow-hidden aspect-[4/5] mb-6",
    imageHover: "transition-transform duration-700 group-hover:scale-105",
    imageWrapper: "relative overflow-hidden",
    // Legacy support
    base: "rounded-md border border-border/50 bg-white shadow-sm",
    paddingSm: "p-6",
    paddingMd: "p-8 sm:p-10",
    paddingLg: "p-10 sm:p-12",
    hover: "transition-all duration-300 hover:shadow-lg hover:border-foreground/10 hover:-translate-y-1",
  },
  button: {
    primary: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 px-8 text-center text-sm font-semibold tracking-widest uppercase transition-all",
    secondary: "border border-zinc-300 dark:border-zinc-700 py-4 px-8 text-center text-sm font-semibold tracking-widest uppercase transition-colors hover:border-zinc-900 dark:hover:border-zinc-100",
    accent: "bg-primary text-white py-4 px-12 text-sm font-semibold tracking-widest uppercase inline-block hover:bg-opacity-90 transition-all",
    link: "inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors",
  },
  divider: "h-[1px] bg-zinc-200 dark:bg-zinc-800",
  iconContainer: {
    base: "flex items-center justify-center rounded-md bg-muted text-foreground shadow-sm",
    hover: "transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
  },
  input: {
    base: "w-full rounded-md border border-border bg-white px-4 py-3.5 text-foreground transition-all duration-300",
    placeholder: "placeholder:text-muted-foreground",
    focus: "focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10",
    hover: "hover:border-foreground/30",
  },
} as const;

// LAYOUT for existing components
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

// ANIMATIONS for existing components
export const ANIMATIONS = {
  fadeIn: "animate-in fade-in duration-700",
  fadeInDelayed: "animate-in fade-in duration-700 delay-150",
  shimmer: "shine-effect",
  hoverCard: "hover:shadow-card-hover hover:border-foreground/10 hover:-translate-y-2",
  hoverIcon: "transition-all group-hover:translate-x-1 group-hover:scale-110",
} as const;

// GRADIENTS for existing components
export const GRADIENTS = {
  hero: "bg-gradient-to-b from-muted/50 via-background to-background",
  section: "bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30",
  card: "bg-gradient-to-br from-muted/50 to-muted",
} as const;
