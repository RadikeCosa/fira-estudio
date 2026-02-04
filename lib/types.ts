/**
 * Tipos TypeScript para la tienda de textiles
 * Mapean las tablas de Supabase (PostgreSQL)
 */

/** Categoría de productos (manteles, servilletas, caminos de mesa) */
export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  orden: number;
  imagen?: string | null;
  featured?: boolean | null;
}

/** Producto base del catálogo */
export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoria_id: string | null;
  /** Precio mínimo para mostrar "desde $X" */
  precio_desde: number | null;
  destacado: boolean;
  activo: boolean;
  tiempo_fabricacion: string;
  material: string | null;
  cuidados: string | null;
  created_at: string;
}

/** Variación de producto (tamaño, color, precio específico) */
export interface Variacion {
  id: string;
  producto_id: string;
  tamanio: string;
  color: string;
  precio: number;
  stock: number;
  sku: string | null;
  activo: boolean;
  producto?: Producto & { imagenes?: ImagenProducto[] }; // opcional, para populación
}

/** Imagen asociada a un producto */
export interface ImagenProducto {
  id: string;
  producto_id: string;
  url: string;
  alt_text: string | null;
  orden: number;
  es_principal: boolean;
}

/** Producto con todas sus relaciones cargadas */
export type ProductoCompleto = Producto & {
  categoria: Categoria | null;
  variaciones: Variacion[];
  imagenes: ImagenProducto[];
};

// --- Carrito y Checkout ---

export interface CartItem {
  id: string;
  cart_id: string;
  variacion_id: string;
  quantity: number;
  price_at_addition: number;
  created_at: string;
  updated_at: string;
  variacion?: Variacion; // opcional, para populación
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  items?: CartItem[]; // opcional, para populación
}

export interface Order {
  id: string;
  order_number: string;
  cart_id: string;
  customer_email: string;
  customer_phone?: string;
  customer_name: string;
  total_amount: number;
  status:
    | "pending"
    | "approved"
    | "paid"
    | "shipped"
    | "cancelled"
    | "rejected";
  mercadopago_preference_id: string;
  mercadopago_payment_id?: string;
  payment_method?: string;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variacion_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  variacion_size: string;
  variacion_color: string;
  sku?: string;
  created_at: string;
}

export interface PaymentLog {
  id: string;
  order_id: string;
  mercadopago_payment_id: string;
  status: string;
  status_detail: string;
  merchant_order_id?: string;
  event_type: string;
  response_body: Record<string, unknown>;
  created_at: string;
}
