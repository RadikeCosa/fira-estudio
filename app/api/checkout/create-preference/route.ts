import { NextRequest, NextResponse } from "next/server";
import { client, Preference } from "@/lib/mercadopago/client";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { CHECKOUT_URLS, WEBHOOK_URL } from "@/lib/config/urls";
import type { Cart, CartItem } from "@/lib/types";

/**
 * Obtiene session_id desde cookies del request
 *
 * El session_id fue generado en el cliente (app/api/cart/actions.ts)
 * y almacenado en una cookie. Lo extraemos aquí para obtener el carrito.
 */
function getSessionId(req: NextRequest): string {
  const sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    throw new Error(
      "No session_id found in cookies. El carrito debe ser creado primero desde el cliente.",
    );
  }
  return sessionId;
}

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, customerName, customerPhone, shippingAddress } =
      await req.json();

    // Usar configuración centralizada de URLs
    const successUrl = CHECKOUT_URLS.success;
    const failureUrl = CHECKOUT_URLS.failure;
    const pendingUrl = CHECKOUT_URLS.pending;
    const webhookUrl = WEBHOOK_URL;

    // Validar que las URLs sean válidas
    console.log("[Checkout] Using URLs:", {
      successUrl,
      failureUrl,
      pendingUrl,
      webhookUrl,
    });

    if (!successUrl || !successUrl.startsWith("http")) {
      throw new Error(
        `Invalid success URL: ${successUrl}. Please check your URL configuration.`,
      );
    }

    // Validar variables de entorno críticas
    const missingEnv: string[] = [];
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      missingEnv.push("MERCADOPAGO_ACCESS_TOKEN");
    }
    if (missingEnv.length > 0) {
      console.error("Create preference error: Missing env vars", missingEnv);
      return NextResponse.json(
        {
          error: "Faltan variables de entorno requeridas",
          details: missingEnv,
        },
        { status: 500 },
      );
    }

    // Validaciones de input
    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: "customerEmail y customerName son requeridos" },
        { status: 400 },
      );
    }

    // Obtener session_id y carrito
    const session_id = getSessionId(req);
    const cart: Cart & { items: CartItem[] } =
      await CartRepository.getCartWithItems(session_id);

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío o no existe" },
        { status: 400 },
      );
    }

    // PASO 1: Validar stock ANTES de crear orden
    const insufficientStock = await CartRepository.validateStock(cart.items);
    if (insufficientStock.length > 0) {
      return NextResponse.json(
        {
          error: "Stock insuficiente",
          details: insufficientStock,
        },
        { status: 400 },
      );
    }

    // PASO 2: Calcular total (no confiar en cliente)
    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price_at_addition,
      0,
    );

    // PASO 3: Crear orden en Supabase con items (transacción implícita)
    let orderId: string;
    try {
      orderId = await CartRepository.createOrderWithItems(
        cart.id,
        customerEmail,
        customerName,
        total,
        cart.items,
        customerPhone,
        shippingAddress,
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Error al crear la orden", details: (error as Error).message },
        { status: 500 },
      );
    }

    // PASO 4: Crear preferencia en Mercado Pago con datos completos
    const items = cart.items.map((item, index) => {
      const producto = item.variacion?.producto;
      const imagenPrincipal =
        producto?.imagenes?.find(
          (img: { es_principal: boolean; url: string }) => img.es_principal,
        )?.url || producto?.imagenes?.[0]?.url;

      return {
        id: item.variacion?.sku || `${item.variacion_id}-${index}`,
        title: producto?.nombre || `Producto ${item.variacion_id}`,
        description: `${producto?.descripcion || ""} - Tamaño: ${item.variacion?.tamanio}, Color: ${item.variacion?.color}`,
        picture_url: imagenPrincipal
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imagenPrincipal}`
          : undefined,
        quantity: item.quantity,
        unit_price: item.price_at_addition,
        currency_id: "ARS",
      };
    });

    const preference = {
      items: items.map((item) => ({
        ...item,
        // Remover undefined picture_url
        ...(item.picture_url ? { picture_url: item.picture_url } : {}),
      })),
      payer: {
        email: customerEmail,
        name: customerName,
        phone: { number: customerPhone },
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: "approved",
      external_reference: `${customerEmail}|${orderId}`,
      notification_url: webhookUrl,
      payment_methods: {
        excluded_payment_methods: [
          {
            id: "visa",
          },
        ],
        installments: 6,
      },
    };

    console.log(
      "[Checkout] Preference object:",
      JSON.stringify(preference, null, 2),
    );

    const preferenceClient = new Preference(client);
    let mpRes;

    try {
      mpRes = await preferenceClient.create({ body: preference });
    } catch (mpError) {
      console.error("Mercado Pago preference error:", mpError);
      // ROLLBACK: Si falla Mercado Pago, marcar orden como cancelada
      await CartRepository.updateOrderStatus(orderId, "cancelled");
      return NextResponse.json(
        {
          error: "Error al crear preferencia de pago",
          details: (mpError as Error).message,
        },
        { status: 500 },
      );
    }

    if (!mpRes || !mpRes.id || !mpRes.init_point) {
      await CartRepository.updateOrderStatus(orderId, "cancelled");
      return NextResponse.json(
        { error: "Respuesta inválida de Mercado Pago" },
        { status: 500 },
      );
    }

    // PASO 5: Guardar preference_id en la orden
    await CartRepository.savePreferenceId(orderId, mpRes.id);

    return NextResponse.json({
      preference_id: mpRes.id,
      init_point: mpRes.init_point,
      order_id: orderId,
      cart_id: cart.id,
    });
  } catch (error) {
    console.error("Create preference error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
