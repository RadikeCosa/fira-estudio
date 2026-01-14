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
];

/** Configuración del sitio */
export const SITE_CONFIG = {
  name: "Muma Estudio",
  tagline: "Creaciones Textiles y Digitales",
  description:
    "Textiles artesanales para tu hogar. Manteles, servilletas y caminos de mesa únicos, hechos a mano en Argentina.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mumaestudio.com",
  locale: "es_AR",
  keywords: SITE_KEYWORDS, // ← Sin as const aquí
} as const;

/** Configuración de WhatsApp */
export const WHATSAPP = {
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492999XXXXXX",
  /**
   * Genera URL de WhatsApp con mensaje pre-formateado
   * @param message - Mensaje a enviar
   * @returns URL completa de WhatsApp
   */
  getUrl: (message: string): string =>
    `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`,
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
