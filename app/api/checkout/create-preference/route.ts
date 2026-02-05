import { NextRequest, NextResponse } from "next/server";
import { client, Preference } from "@/lib/mercadopago/client";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { CHECKOUT_URLS, WEBHOOK_URL } from "@/lib/config/urls";
import type { Cart, CartItem } from "@/lib/types";
import { logSecurityEvent } from "@/lib/utils/security-logger";
import {
  AppError,
  ConfigurationError,
  OrderError,
  PaymentError,
  ValidationError,
} from "@/lib/errors/AppError";

/** Rate limit configuration for checkout endpoint */
const CHECKOUT_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 900000, // 15 minutes
} as const;

/** In-memory store for checkout rate limit records */
const checkoutRateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

interface CheckoutRequestBody {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
}

interface AppErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

function buildAppErrorResponse(error: AppError): NextResponse {
  const body: AppErrorResponse = {
    error: error.userMessage,
    code: error.code,
  };

  if (error.details !== undefined) {
    body.details = error.details;
  }

  return NextResponse.json(body, { status: error.statusCode });
}

/**
 * Extracts client IP address from request headers
 * Priority: x-forwarded-for > x-real-ip > fallback to "unknown"
 */
function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Checks rate limit for checkout endpoint
 * Limits: 5 requests per 15 minutes per IP
 *
 * @returns { allowed: boolean, resetIn?: number }
 */
function checkCheckoutRateLimit(ip: string): {
  allowed: boolean;
  resetIn?: number;
} {
  const now = Date.now();
  const key = `checkout:${ip}`;
  const record = checkoutRateLimitStore.get(key);

  // Check if record exists and has not expired
  if (record && now < record.resetAt) {
    // Check if limit exceeded
    if (record.count >= CHECKOUT_RATE_LIMIT.maxRequests) {
      const resetIn = record.resetAt - now;

      logSecurityEvent("rate_limit_exceeded", {
        endpoint: "checkout",
        ip,
        count: record.count,
        maxRequests: CHECKOUT_RATE_LIMIT.maxRequests,
        resetIn,
      });

      return { allowed: false, resetIn };
    }

    // Increment count
    record.count += 1;
    checkoutRateLimitStore.set(key, record);

    logSecurityEvent("rate_limit_check", {
      endpoint: "checkout",
      ip,
      count: record.count,
      maxRequests: CHECKOUT_RATE_LIMIT.maxRequests,
      allowed: true,
    });

    return { allowed: true };
  }

  // Create new record (no existing record or expired)
  const newRecord = {
    count: 1,
    resetAt: now + CHECKOUT_RATE_LIMIT.windowMs,
  };
  checkoutRateLimitStore.set(key, newRecord);

  logSecurityEvent("rate_limit_check", {
    endpoint: "checkout",
    ip,
    count: 1,
    maxRequests: CHECKOUT_RATE_LIMIT.maxRequests,
    allowed: true,
  });

  return { allowed: true };
}

/**
 * Obtiene session_id desde cookies del request
 *
 * El session_id fue generado en el cliente (app/api/cart/actions.ts)
 * y almacenado en una cookie. Lo extraemos aquí para obtener el carrito.
 */
function getSessionId(req: NextRequest): string {
  const sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    throw new ValidationError(
      "No session_id found in cookies. El carrito debe ser creado primero desde el cliente.",
      "El carrito no está disponible. Por favor, intenta de nuevo.",
    );
  }
  return sessionId;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // RATE LIMIT CHECK - First thing to do
    const clientIP = getClientIP(req);
    const rateLimitCheck = checkCheckoutRateLimit(clientIP);

    if (!rateLimitCheck.allowed) {
      const resetInSeconds = Math.ceil((rateLimitCheck.resetIn || 0) / 1000);
      console.warn(
        `[Checkout] Rate limit exceeded for IP: ${clientIP}. Reset in ${resetInSeconds}s`,
      );

      return NextResponse.json(
        {
          error: "Demasiadas solicitudes de pago",
          message: `Por favor, intenta de nuevo en ${resetInSeconds} segundos.`,
          resetIn: rateLimitCheck.resetIn,
        },
        { status: 429 },
      );
    }

    const { customerEmail, customerName, customerPhone, shippingAddress } =
      (await req.json()) as CheckoutRequestBody;

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
      throw new ConfigurationError(
        "Missing required environment variables",
        "Faltan variables de entorno requeridas",
        { missingEnv },
      );
    }

    // Validaciones de input
    if (!customerEmail || !customerName) {
      throw new ValidationError(
        "customerEmail y customerName son requeridos",
        "El email y el nombre son requeridos para continuar.",
      );
    }

    // Obtener session_id y carrito
    const session_id = getSessionId(req);
    const repo = new CartRepository();
    const cart: Cart & { items: CartItem[] } =
      await repo.getCartWithItems(session_id);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ValidationError(
        "El carrito está vacío o no existe",
        "Tu carrito está vacío. Agrega productos para continuar.",
      );
    }

    // PASO 1: Validar stock ANTES de crear orden
    const insufficientStock = await repo.validateStock(cart.items);
    if (insufficientStock.length > 0) {
      throw new ValidationError(
        "Stock insuficiente",
        "Algunos productos no tienen stock suficiente.",
        { insufficientStock },
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
      orderId = await repo.createOrderWithItems(
        cart.id,
        customerEmail,
        customerName,
        total,
        cart.items,
        customerPhone,
        shippingAddress,
      );
    } catch (error) {
      const details = error instanceof Error ? error.message : "Unknown error";
      throw new OrderError(
        "Error al crear la orden",
        "No pudimos crear la orden. Intenta nuevamente.",
        { details },
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
      statement_descriptor: "FIRA ESTUDIO",
      external_reference: `${customerEmail}|${orderId}`,
      notification_url: webhookUrl,
      payment_methods: {
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
      await repo.updateOrderStatus(orderId, "cancelled");
      const details =
        mpError instanceof Error ? mpError.message : "Unknown error";
      throw new PaymentError(
        "Error al crear preferencia de pago",
        "No pudimos iniciar el pago. Intenta nuevamente.",
        { details },
      );
    }

    if (!mpRes || !mpRes.id || !mpRes.init_point) {
      await repo.updateOrderStatus(orderId, "cancelled");
      throw new PaymentError(
        "Respuesta inválida de Mercado Pago",
        "No pudimos iniciar el pago. Intenta nuevamente.",
      );
    }

    // PASO 5: Guardar preference_id en la orden
    await repo.savePreferenceId(orderId, mpRes.id);

    return NextResponse.json({
      preference_id: mpRes.id,
      init_point: mpRes.init_point,
      order_id: orderId,
      cart_id: cart.id,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return buildAppErrorResponse(error);
    }

    console.error("Create preference error:", error);
    return NextResponse.json(
      {
        error: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      },
      { status: 500 },
    );
  }
}
