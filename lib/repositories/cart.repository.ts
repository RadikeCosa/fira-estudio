import { createClient } from "@supabase/supabase-js";
import type { Cart, CartItem } from "../types";

// Cliente ADMIN con SERVICE_ROLE_KEY (bypasea RLS)
// IMPORTANTE: Usar solo en Server Actions/API Routes, NUNCA en cliente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key para bypasear RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export class CartRepository {
  /**
   * Obtiene el carrito por session_id o lo crea si no existe
   */
  static async getOrCreateCart(session_id: string): Promise<Cart> {
    const { data: carts, error: selectError } = await supabase
      .from("carts")
      .select("*")
      .eq("session_id", session_id);

    if (selectError) throw selectError;

    // Si existe, retornar el primero
    if (carts && carts.length > 0) return carts[0];

    // Si no existe, crear nuevo
    const { data: newCart, error: insertError } = await supabase
      .from("carts")
      .insert({ session_id })
      .select("*")
      .single();

    if (insertError) throw insertError;
    if (!newCart) throw new Error("Failed to create cart");
    return newCart;
  }

  /**
   * Obtiene el carrito y sus items con datos completos de producto
   */
  static async getCartWithItems(
    session_id: string,
  ): Promise<Cart & { items: CartItem[] }> {
    const { data: carts, error } = await supabase
      .from("carts")
      .select(
        `
        *,
        cart_items(
          *,
          variacion:variaciones(
            *,
            producto:productos(
              *,
              imagenes:imagenes_producto(*)
            )
          )
        )
      `,
      )
      .eq("session_id", session_id);

    if (error) throw error;
    if (!carts || carts.length === 0) {
      // Si no existe carrito, crear uno vacío
      const newCart = await this.getOrCreateCart(session_id);
      return { ...newCart, items: [] };
    }

    const cart = carts[0];
    return { ...cart, items: cart.cart_items || [] };
  }

  /**
   * Agrega un item al carrito (o suma cantidad si ya existe)
   */
  static async addItem(
    cart_id: string,
    variacion_id: string,
    quantity: number,
    price: number,
  ): Promise<CartItem> {
    // Buscar si ya existe ese item
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart_id)
      .eq("variacion_id", variacion_id)
      .single();
    if (existing) {
      // Sumar cantidad
      const { data: updated, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      return updated;
    } else {
      // Insertar nuevo item
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({ cart_id, variacion_id, quantity, price_at_addition: price })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return newItem;
    }
  }

  /**
   * Actualiza la cantidad de un item
   */
  static async updateItemQuantity(
    item_id: string,
    quantity: number,
  ): Promise<CartItem> {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", item_id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Elimina un item del carrito
   */
  static async removeItem(item_id: string): Promise<void> {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item_id);
    if (error) throw error;
  }

  /**
   * Vacía el carrito
   */
  static async clearCart(cart_id: string): Promise<void> {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart_id);
    if (error) throw error;
  }

  /**
   * Recalcula el total del carrito
   */
  static async updateCartTotal(cart_id: string): Promise<void> {
    const { data: items, error } = await supabase
      .from("cart_items")
      .select("quantity, price_at_addition")
      .eq("cart_id", cart_id);
    if (error) throw error;
    const total = (items || []).reduce(
      (sum, item) => sum + item.quantity * item.price_at_addition,
      0,
    );
    const { error: updateError } = await supabase
      .from("carts")
      .update({ total_amount: total, updated_at: new Date().toISOString() })
      .eq("id", cart_id);
    if (updateError) throw updateError;
  }

  /**
   * Crea una nueva orden a partir del carrito
   */
  static async createOrder(
    cart_id: string,
    customer_email: string,
    customer_name: string,
    customer_phone?: string,
    shipping_address?: string,
  ): Promise<string> {
    const now = new Date().toISOString();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        cart_id,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        total_amount: 0, // Se actualiza después
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();
    if (error) throw error;
    return order.id;
  }

  /**
   * Guarda un log de pago
   */
  static async savePaymentLog(
    order_id: string,
    mercadopago_payment_id: string,
    status: string,
    status_detail: string,
    merchant_order_id: string | null,
    event_type: string,
    response_body: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await supabase.from("payment_logs").insert({
      order_id,
      mercadopago_payment_id,
      status,
      status_detail,
      merchant_order_id,
      event_type,
      response_body,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  /**
   * Verifica si ya existe un log de pago para este payment_id
   * (usado para idempotencia en webhook)
   */
  static async getPaymentLogByPaymentId(
    mercadopago_payment_id: string,
  ): Promise<{ order_id: string; status: string } | null> {
    const { data, error } = await supabase
      .from("payment_logs")
      .select("order_id, status")
      .eq("mercadopago_payment_id", mercadopago_payment_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Actualiza el estado de una orden
   */
  static async updateOrderStatus(
    order_id: string,
    new_status: string,
    mercadopago_payment_id?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({
        status: new_status,
        mercadopago_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);
    if (error) throw error;
  }

  /**
   * Obtiene una orden por ID
   */
  static async getOrderById(order_id: string) {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (error) throw error;
    return order;
  }

  /**
   * Guarda el preference_id de Mercado Pago en la orden
   */
  static async savePreferenceId(
    order_id: string,
    preference_id: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({
        mercadopago_preference_id: preference_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);
    if (error) throw error;
  }

  /**
   * Valida que haya stock suficiente para todos los items del carrito
   * Retorna array de variaciones con stock insuficiente
   */
  static async validateStock(
    items: CartItem[],
  ): Promise<{ variacion_id: string; requested: number; available: number }[]> {
    const insufficient: {
      variacion_id: string;
      requested: number;
      available: number;
    }[] = [];

    for (const item of items) {
      const { data: variacion, error } = await supabase
        .from("variaciones")
        .select("stock")
        .eq("id", item.variacion_id)
        .single();

      if (error || !variacion) {
        insufficient.push({
          variacion_id: item.variacion_id,
          requested: item.quantity,
          available: 0,
        });
      } else if (variacion.stock < item.quantity) {
        insufficient.push({
          variacion_id: item.variacion_id,
          requested: item.quantity,
          available: variacion.stock,
        });
      }
    }

    return insufficient;
  }

  /**
   * Crea una orden completa con sus items (snapshot de datos)
   */
  static async createOrderWithItems(
    cart_id: string,
    customer_email: string,
    customer_name: string,
    total_amount: number,
    cart_items: CartItem[],
    customer_phone?: string,
    shipping_address?: string,
  ): Promise<string> {
    const now = new Date().toISOString();

    // 1. Crear orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        cart_id,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        total_amount,
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    // 2. Crear order_items con snapshots
    const orderItems = cart_items.map((item) => ({
      order_id: order.id,
      variacion_id: item.variacion_id,
      product_name: item.variacion?.sku || "Producto",
      quantity: item.quantity,
      unit_price: item.price_at_addition,
      subtotal: item.quantity * item.price_at_addition,
      variacion_size: item.variacion?.tamanio || "",
      variacion_color: item.variacion?.color || "",
      sku: item.variacion?.sku || null,
      created_at: now,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Rollback: eliminar orden si falla inserción de items
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return order.id;
  }
}
