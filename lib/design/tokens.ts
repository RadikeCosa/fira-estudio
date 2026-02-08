// BOTONES de acción principales y secundarios
export const BUTTONS = {
  primary:
    "bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition text-center font-medium",
  secondary:
    "border border-border px-4 py-3 rounded-lg hover:bg-muted transition",
  danger: "text-sm text-red-600 hover:text-red-700 disabled:opacity-50",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  inline: "inline-block px-6 py-2 rounded-lg",
  underline: "text-sm underline hover:no-underline",
};

// SUBTOTALES y totales
export const CART = {
  subtotal: "font-semibold text-lg",
  totalLabel: "text-lg font-medium",
  totalValue: "text-2xl font-bold",
  empty: "text-muted-foreground mb-4",
  itemTitle: "font-medium text-lg truncate",
  itemDetail: "text-sm text-muted-foreground",
  itemPrice: "text-sm text-muted-foreground mt-1",
  itemControls: "flex items-center gap-3 mt-3",
  itemQtyBox: "flex items-center border border-border rounded-lg",
  itemQtyBtn:
    "px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
  itemQtyValue: "px-4 py-1 border-x border-border min-w-12 text-center",
};

// HELPERS para layout de carrito
export const CART_LAYOUT = {
  container: "space-y-6",
  items: "space-y-4",
  item: "flex gap-4 p-4 bg-white border border-border rounded-lg",
  imageBox: "relative w-24 h-24 shrink-0",
  image: "object-cover rounded-lg",
  itemInfo: "flex-1 min-w-0",
  itemSubtotal: "text-right",
  summary: "border-t border-border pt-4",
  summaryRow: "flex justify-between items-center mb-4",
  summaryActions: "flex gap-3",
};
// Tipografías personalizadas para títulos
export const FONTS = {
  sugoDisplay: "'Sugo Display', serif",
  openSans: "'Open Sans', sans-serif",
};

export const FONT_CLASSES = {
  sugoDisplay: "font-sugo-display",
  openSans: "font-open-sans",
};
// BLOBS decorativos para HeroSection y reutilización
export const BLOBS = {
  heroTop:
    "absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-muted to-transparent opacity-40 blur-3xl",
  heroBottom:
    "absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-muted to-transparent opacity-40 blur-3xl",
} as const;
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
    focus:
      "focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10",
    hover: "hover:border-foreground/30",
  },
  error: {
    text: "text-red-600",
    border: "border-red-600",
    ring: "focus:ring-red-600/10",
    focus: "focus:border-red-600",
    label: "text-red-600",
    message: "text-red-600",
  },
  card: {
    base: "rounded-2xl border-2 border-border/50 bg-white shadow-lg",
    paddingSm: "p-6",
    paddingMd: "p-8 sm:p-10",
    paddingLg: "p-10 sm:p-12",
    hover:
      "transition-all duration-300 hover:shadow-2xl hover:border-foreground/10 hover:-translate-y-2",
  },
  iconContainer: {
    base: "flex items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted text-foreground shadow-md",
    hover:
      "transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
  },

  // Header/Navigation
  header: {
    base: "fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b transition-colors",
    container:
      "px-6 py-4 flex justify-between items-center max-w-lg mx-auto md:max-w-7xl",
    logo: "font-display text-xl tracking-widest uppercase font-bold",
    menuButton: "p-2 hover:bg-muted rounded transition-colors md:hidden",
    nav: "hidden md:flex md:items-center md:gap-8",
    navLink:
      "text-sm font-medium text-foreground hover:text-foreground/70 transition-colors duration-200",
  },

  // Footer
  footer: {
    base: "border-t",
    container: "py-12 px-6 max-w-lg mx-auto lg:max-w-7xl lg:px-8",
    innerWrapper:
      "flex flex-col items-center lg:flex-row lg:justify-between lg:items-start",
    brandSection: "text-center lg:text-left mb-10 lg:mb-0",
    logo: "font-display text-2xl tracking-widest uppercase mb-2",
    subtitle: "text-muted-foreground text-xs tracking-[0.2em] uppercase",
    navSection: "mb-10 lg:mb-0 flex flex-col items-center lg:items-start",
    nav: "flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8",
    navLink:
      "text-sm font-medium text-foreground hover:text-foreground transition-colors",
    socialSection:
      "flex flex-col items-center lg:items-end text-center lg:text-right",
    socialLinks: "flex gap-6 mb-4",
    socialIcon: "text-muted-foreground hover:text-foreground transition-colors",
    copyright: "text-[10px] text-muted-foreground uppercase tracking-widest",
  },

  // Mobile Navigation
  mobileNav: {
    hamburger:
      "flex flex-col gap-1.5 p-1 hover:bg-muted rounded-lg transition-colors duration-200",
    hamburgerLine:
      "block h-0.5 w-6 bg-foreground transition-transform duration-300",
    overlay:
      "fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in fade-in duration-200",
    menu: "fixed top-0 right-0 h-full w-64 bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-in-out",
    menuLink:
      "block px-4 py-3 text-foreground hover:bg-muted border-b border-border last:border-b-0 transition-colors duration-200",
    mobileMenuAlt:
      "absolute top-full left-0 right-0 bg-background border-b border-border z-50 animate-in fade-in slide-in-from-top-2 duration-200",
    closeButton: "p-2 hover:bg-muted rounded transition-colors",
  },

  // Error States
  errorContainer: {
    wrapper: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",
    content:
      "flex min-h-[500px] flex-col items-center justify-center gap-6 rounded-lg border border-border bg-muted/30 p-8 text-center",
    icon: "flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive",
    title: "text-2xl font-semibold text-foreground",
    message: "text-sm text-muted-foreground",
    button:
      "rounded-lg bg-accent px-6 py-3 font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  },

  // Badge Styles
  badge: {
    base: "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
    success: "bg-green-100 text-green-700 border-green-700/20",
    warning: "bg-orange-100 text-orange-700 border-orange-700/20",
    info: "bg-yellow-100 text-yellow-700 border-yellow-700/20",
    error: "bg-red-100 text-red-700 border-red-700/20",
    dot: "h-2 w-2 rounded-full",
    dotSuccess: "bg-green-500",
    dotWarning: "bg-orange-500",
    dotInfo: "bg-yellow-500",
    dotError: "bg-red-500",
  },

  // Pagination
  pagination: {
    nav: "flex items-center gap-4",
    button:
      "inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-150",
    buttonActive: "bg-background text-foreground hover:bg-muted",
    buttonDisabled:
      "pointer-events-none border-dashed text-muted-foreground/70",
    pageInfo: "text-sm text-muted-foreground",
  },

  // Filter Components
  filter: {
    sidebar:
      "w-full sm:w-64 p-6 bg-white rounded-2xl border-2 border-border/50 shadow-lg space-y-6",
    sectionTitle: "font-bold text-lg mb-4 text-foreground",
    checkbox:
      "w-4 h-4 rounded border-2 border-border text-foreground focus:ring-2 focus:ring-foreground/20 transition-colors",
    checkboxLabel: "flex items-center gap-3 cursor-pointer group",
    checkboxText:
      "text-sm text-foreground group-hover:text-foreground/80 transition-colors",
  },

  // Color Swatches
  colorSwatch: {
    container: "flex flex-wrap gap-3 justify-start items-center",
    button:
      "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-foreground/60 shadow",
    buttonSelected: "ring-2 ring-foreground border-4",
    buttonDisabled: "opacity-40 cursor-not-allowed",
    buttonHover: "hover:scale-110 hover:border-foreground/80 cursor-pointer",
  },

  // Hero Badge
  heroBadge: {
    base: "mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-accent shadow-sm transition-all duration-300 hover:shadow-md hover:border-border",
  },

  // Category Filter
  categoryFilter: {
    container: "mb-8 overflow-x-auto",
    buttonList: "flex gap-3 pb-2 min-w-max",
    button:
      "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap",
    buttonActive: "bg-foreground text-background",
    buttonInactive: "bg-muted text-muted-foreground hover:bg-muted/80",
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
  hoverCard:
    "hover:shadow-card-hover hover:border-foreground/10 hover:-translate-y-2",
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
