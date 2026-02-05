import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Cart, CartItem } from "../types";

/**
 * Crea una instancia del cliente Supabase con SERVICE_ROLE_KEY
 * IMPORTANTE: Usar solo en Server Actions/API Routes, NUNCA en cliente
 */
function getDefaultSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export class CartRepository {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || getDefaultSupabaseClient();
  }

  async getOrCreateCart(session_id: string): Promise<Cart> {
    const { data: carts, error: selectError } = await this.supabase
      .from("carts")
      .select("*")
      .eq("session_id", session_id);

    if (selectError) throw selectError;
    if (carts && carts.length > 0) return carts[0];

    const { data: newCart, error: insertError } = await this.supabase
      .from("carts")
      .insert({ session_id })
      .select("*")
      .single();

    if (insertError) throw insertError;
    if (!newCart) throw new Error("Failed to create cart");
    return newCart;
  }

  async getCartWithItems(
    session_id: string,
  ): Promise<Cart & { items: CartItem[] }> {
    const { data: carts, error } = await this.supabase
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
      const newCart = await this.getOrCreateCart(session_id);
      return { ...newCart, items: [] };
    }

    const cart = carts[0];
    return { ...cart, items: cart.cart_items || [] };
  }

  async addItem(
    cart_id: string,
    variacion_id: string,
    quantity: number,
    price: number,
  ): Promise<CartItem> {
    const { data: existing } = await this.supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart_id)
      .eq("variacion_id", variacion_id)
      .single();

    if (existing) {
      const { data: updated, error: updateError } = await this.supabase
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
      const { data: newItem, error: insertError } = await this.supabase
        .from("cart_items")
        .insert({ cart_id, variacion_id, quantity, price_at_addition: price })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return newItem;
    }
  }

  async updateItemQuantity(
    item_id: string,
    quantity: number,
  ): Promise<CartItem> {
    const { data, error } = await this.supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", item_id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  async removeItem(item_id: string): Promise<void> {
    const { error } = await this.supabase
      .from("cart_items")
      .delete()
      .eq("id", item_id);
    if (error) throw error;
  }

  async clearCart(cart_id: string): Promise<void> {
    const { error } = await this.supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart_id);
    if (error) throw error;
  }

  async updateCartTotal(cart_id: string): Promise<void> {
    const { data: items, error } = await this.supabase
      .from("cart_items")
      .select("quantity, price_at_addition")
      .eq("cart_id", cart_id);
    if (error) throw error;
    const total = (items || []).reduce(
      (sum, item) => sum + item.quantity * item.price_at_addition,
      0,
    );
    const { error: updateError } = await this.supabase
      .from("carts")
      .update({ total_amount: total, updated_at: new Date().toISOString() })
      .eq("id", cart_id);
    if (updateError) throw updateError;
  }

  async createOrder(
    cart_id: string,
    customer_email: string,
    customer_name: string,
    customer_phone?: string,
    shipping_address?: string,
  ): Promise<string> {
    const now = new Date().toISOString();
    const { data: order, error } = await this.supabase
      .from("orders")
      .insert({
        cart_id,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        total_amount: 0,
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();
    if (error) throw error;
    return order.id;
  }

  async savePaymentLog(
    order_id: string,
    mercadopago_payment_id: string,
    status: string,
    status_detail: string,
    merchant_order_id: string | null,
    event_type: string,
    response_body: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await this.supabase.from("payment_logs").insert({
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

  async getPaymentLogByPaymentId(
    mercadopago_payment_id: string,
  ): Promise<{ order_id: string; status: string } | null> {
    const { data, error } = await this.supabase
      .from("payment_logs")
      .select("order_id, status")
      .eq("mercadopago_payment_id", mercadopago_payment_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateOrderStatus(
    order_id: string,
    new_status: string,
    mercadopago_payment_id?: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("orders")
      .update({
        status: new_status,
        mercadopago_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);
    if (error) throw error;
  }

  async getOrderById(order_id: string) {
    const { data: order, error } = await this.supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (error) throw error;
    return order;
  }

  async getOrderWithItems(order_id: string) {
    const { data: order, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        order_items(*)
      `)
      .eq("id", order_id)
      .single();
    if (error) {
      throw new Error(`Failed to fetch order ${order_id}: ${error.message}`);
    }
    return order;
  }

  async savePreferenceId(
    order_id: string,
    preference_id: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("orders")
      .update({
        mercadopago_preference_id: preference_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);
    if (error) throw error;
  }

  async validateStock(
    items: CartItem[],
  ): Promise<{ variacion_id: string; requested: number; available: number }[]> {
    const insufficient: {
      variacion_id: string;
      requested: number;
      available: number;
    }[] = [];

    for (const item of items) {
      const { data: variacion, error } = await this.supabase
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

  async createOrderWithItems(
    cart_id: string,
    customer_email: string,
    customer_name: string,
    total_amount: number,
    cart_items: CartItem[],
    customer_phone?: string,
    shipping_address?: string,
  ): Promise<string> {
    const now = new Date().toISOString();

    const { data: order, error: orderError } = await this.supabase
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

    const { error: itemsError } = await this.supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await this.supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return order.id;
  }

  /**
   * Decrementa el stock de las variaciones de una orden
   * Se llama cuando el pago es aprobado
   */
  async decrementStockForOrder(order_id: string): Promise<void> {
    // Obtener items de la orden
    const { data: orderItems, error: fetchError } = await this.supabase
      .from("order_items")
      .select("variacion_id, quantity")
      .eq("order_id", order_id);

    if (fetchError) {
      console.error(`[CartRepository] Error fetching order items:`, fetchError);
      throw fetchError;
    }

    if (!orderItems || orderItems.length === 0) {
      console.log(`[CartRepository] No order items found for order ${order_id}`);
      return;
    }

    // Decrementar stock de cada variación
    for (const item of orderItems) {
      const { data: variacion, error: getError } = await this.supabase
        .from("variaciones")
        .select("stock")
        .eq("id", item.variacion_id)
        .single();

      if (getError || !variacion) {
        console.error(
          `[CartRepository] Error getting variacion ${item.variacion_id}:`,
          getError,
        );
        continue;
      }

      const newStock = Math.max(variacion.stock - item.quantity, 0);

      const { error: updateError } = await this.supabase
        .from("variaciones")
        .update({ stock: newStock })
        .eq("id", item.variacion_id);

      if (updateError) {
        console.error(
          `[CartRepository] Error decrementing stock for variacion ${item.variacion_id}:`,
          updateError,
        );
        // No lanzar error, el pago ya fue aprobado - solo log
      } else {
        console.log(
          `[CartRepository] Stock decremented: variacion=${item.variacion_id}, old=${variacion.stock}, new=${newStock}`,
        );
      }
    }
  }

  /**
   * Obtiene el cart_id asociado a una orden
   */
  async getCartIdByOrderId(order_id: string): Promise<string | null> {
    const { data: order, error } = await this.supabase
      .from("orders")
      .select("cart_id")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      console.error(
        `[CartRepository] Error getting cart_id for order ${order_id}:`,
        error,
      );
      return null;
    }

    return order.cart_id;
  }
}
