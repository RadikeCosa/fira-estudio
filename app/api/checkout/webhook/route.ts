import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/mercadopago/client";
import { Payment } from "mercadopago";
import { CartRepository } from "@/lib/repositories/cart.repository";
import {
  validateMercadoPagoIP,
  validateWebhookSignature,
  extractClientIP,
} from "@/lib/mercadopago/webhook-security";

/**
 * Webhook Endpoint for Mercado Pago Notifications
 *
 * Handles real-time payment events:
 * - payment.created
 * - payment.updated
 *
 * Features:
 * - IP origin validation (Mercado Pago only)
 * - HMAC-SHA256 signature verification (x-signature header)
 * - Idempotency via payment_logs table
 * - Detailed logging for debugging
 * - Graceful error handling
 * - State mapping (payment status → order status)
 *
 * Security:
 * - Validates x-signature header with HMAC-SHA256
 * - Validates IP origin against Mercado Pago ranges
 * - Prevents timestamp replay attacks (5 min window)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let paymentId: string | number | undefined;

  try {
    // SEGURIDAD: Validar origen IP
    const clientIP = extractClientIP(Object.fromEntries(req.headers.entries()));
    if (!validateMercadoPagoIP(clientIP)) {
      console.error(`[Webhook Security] Rejected request from IP: ${clientIP}`);
      return NextResponse.json({ error: "Unauthorized IP" }, { status: 403 });
    }

    const { id, type } = await req.json();
    paymentId = id;

    console.log(`[Webhook] Received event: type=${type}, id=${id}`);

    // SEGURIDAD: Validar firma del webhook (x-signature header)
    const xTimestamp = req.headers.get("x-request-id") || String(Date.now());
    const headers = Object.fromEntries(req.headers.entries());

    if (
      !validateWebhookSignature(
        headers,
        JSON.stringify({ id, type }),
        id,
        xTimestamp,
      )
    ) {
      console.error(
        `[Webhook Security] Invalid signature for payment ${id} - rejecting request`,
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(`[Webhook] Signature validated for payment ${id}`);

    // Solo procesar eventos de tipo payment
    if (type !== "payment") {
      console.log(`[Webhook] Ignoring non-payment event: ${type}`);
      return NextResponse.json({ status: "ignored" });
    }

    // PASO 1: Verificar idempotencia - si ya procesamos este pago
    const existingLog = await CartRepository.getPaymentLogByPaymentId(
      String(id),
    );

    // Obtener detalles del pago desde Mercado Pago
    const paymentClient = new Payment(client);
    let paymentData;

    try {
      paymentData = await paymentClient.get({ id });
    } catch (mpError) {
      console.error(`[Webhook] Error fetching payment ${id} from MP:`, mpError);
      return NextResponse.json(
        { error: "Error al obtener pago de Mercado Pago" },
        { status: 500 },
      );
    }

    if (!paymentData || !paymentData.id) {
      console.error(`[Webhook] Invalid payment data for id=${id}`);
      return NextResponse.json(
        { error: "No se pudo obtener el pago" },
        { status: 400 },
      );
    }

    const payment = paymentData;

    // Extraer información relevante
    const {
      id: paymentIdFromMP,
      status,
      status_detail,
      external_reference, // order_id
    } = payment;

    // Validar que exista el external_reference (order_id)
    if (!external_reference) {
      console.error(`[Webhook] No external_reference in payment ${id}`);
      return NextResponse.json(
        { error: "No external_reference found in payment" },
        { status: 400 },
      );
    }

    // PASO 2: Idempotencia - si ya procesamos este pago con el mismo status, retornar 200
    if (existingLog) {
      if (existingLog.status === status) {
        console.log(
          `[Webhook] Already processed payment ${id} with status ${status} - idempotent response`,
        );
        return NextResponse.json(
          {
            received: true,
            payment_id: paymentIdFromMP,
            status,
            external_reference,
            idempotent: true,
          },
          { status: 200 },
        );
      } else {
        console.log(
          `[Webhook] Status changed for payment ${id}: ${existingLog.status} -> ${status}`,
        );
      }
    }

    // PASO 3: Guardar el log de pago en Supabase
    try {
      await CartRepository.savePaymentLog(
        external_reference,
        String(paymentIdFromMP),
        status || "unknown",
        status_detail || "",
        null,
        type,
        payment as unknown as Record<string, unknown>,
      );
      console.log(
        `[Webhook] Payment log saved for payment ${id}, order ${external_reference}`,
      );
    } catch (logError) {
      console.error(`[Webhook] Error saving payment log:`, logError);
      // No fallar el webhook si solo falla el log
    }

    // PASO 4: Actualizar el estado de la orden según el estado del pago
    const orderStatus = mapPaymentStatusToOrderStatus(status || "unknown");

    try {
      await CartRepository.updateOrderStatus(
        external_reference,
        orderStatus,
        String(paymentIdFromMP),
      );
      console.log(
        `[Webhook] Order ${external_reference} updated to status: ${orderStatus}`,
      );
    } catch (updateError) {
      console.error(`[Webhook] Error updating order status:`, updateError);
      throw updateError; // Este sí debe fallar el webhook
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Webhook] Processed successfully in ${duration}ms: payment ${id}, order ${external_reference}`,
    );

    // Responder a Mercado Pago que el webhook fue recibido
    return NextResponse.json(
      {
        received: true,
        payment_id: paymentIdFromMP,
        status,
        external_reference,
        order_status: orderStatus,
        duration_ms: duration,
      },
      { status: 200 },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Webhook] Error processing payment ${paymentId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      duration_ms: duration,
    });

    return NextResponse.json(
      {
        error: (error as Error).message,
        payment_id: paymentId,
      },
      { status: 500 },
    );
  }
}

// Mapeo de estados de pago a estados de orden
function mapPaymentStatusToOrderStatus(
  paymentStatus: string,
): "pending" | "approved" | "rejected" | "cancelled" {
  switch (paymentStatus) {
    case "approved":
      return "approved";
    case "pending":
      return "pending";
    case "rejected":
    case "cancelled":
      return "rejected";
    default:
      return "pending";
  }
}
