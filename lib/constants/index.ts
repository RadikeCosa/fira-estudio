/**
 * Constantes globales del proyecto
 * Centraliza valores que se usan en múltiples lugares
 */

/** Keywords del sitio (fuera de as const para permitir mutabilidad) */
const SITE_KEYWORDS = [
  "textiles",
  "manteles",
  "servilletas",
  "caminos de mesa",
  "artesanal",
  "Argentina",
  "Neuquén",
];

/** Configuración del sitio */
export const SITE_CONFIG = {
  name: "Fira Estudio",
  tagline: "Creaciones Textiles y Digitales",
  description:
    "Piezas artesanales que encienden tu hogar. Creamos manteles, servilletas, caminos de mesa y accesorios de cocina con dedicación y cuidado artesanal. Lindos. Útiles. Para usar cada día.",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  locale: "es_AR",
  keywords: SITE_KEYWORDS, // ← Sin as const aquí
  /** Subtítulo para el footer, configurable */
  footerSubtitle: "Creaciones Textiles y Digitales",
} as const;

/** Configuración de WhatsApp */
export const WHATSAPP = {
  /**
   * Getter para el numero publico.
   * Si no esta configurado, no se genera enlace funcional.
   */
  get number(): string | undefined {
    const trimmed = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
    return trimmed || undefined;
  },

  /**
   * Genera URL de WhatsApp con mensaje pre-formateado
   *
   * @param message - Mensaje a enviar
   * @returns URL completa de WhatsApp o null si no hay numero configurado
   */
  getUrl: (message: string): string | null => {
    if (!WHATSAPP.number) return null;
    return `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`;
  },
} as const;

/** Rutas de almacenamiento de imágenes */
export const STORAGE = {
  /** Ruta base para imágenes de productos en public/ */
  productsPath: "/images/productos",
  /** Ruta para placeholders */
  placeholdersPath: "/images/placeholders",
  /** URL de producto placeholder */
  productPlaceholder: "/images/placeholders/producto-sin-imagen.jpg",
} as const;

/** Configuración de Supabase Storage (para cuando migres) */
export const SUPABASE_STORAGE = {
  bucketName: "productos",
  /**
   * Construye URL pública de Supabase Storage
   * @param path - Ruta relativa en el bucket
   * @returns URL completa del archivo
   */
  getPublicUrl: (path: string): string => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return "";
    return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_STORAGE.bucketName}/${path}`;
  },
} as const;

/** Límites y configuración de paginación */
export const PAGINATION = {
  productsPerPage: 12,
  maxProductsPerCategory: 50,
} as const;

/** Umbrales de stock para indicadores de disponibilidad */
export const STOCK_THRESHOLDS = {
  /** Stock bajo: muestra advertencia de pocas unidades */
  lowStock: 3,
} as const;

/** Mensajes de error comunes */
export const ERROR_MESSAGES = {
  productNotFound: "Producto no encontrado",
  noProducts: "No hay productos disponibles",
  loadingError: "Error al cargar productos",
  connectionError: "Error de conexión. Por favor, intentá de nuevo.",
} as const;

/** Mensajes de éxito */
export const SUCCESS_MESSAGES = {
  consultaSent: "¡Consulta enviada! Te responderemos pronto.",
  productAdded: "Producto agregado correctamente",
} as const;
