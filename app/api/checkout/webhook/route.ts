import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/mercadopago/client";
import { Payment } from "mercadopago";
import {
  validateMercadoPagoIP,
  validateWebhookSignature,
  extractClientIP,
} from "@/lib/mercadopago/webhook-security";
import { ValidationError, PaymentError, AppError } from "@/lib/errors/AppError";
import { getWebhookQueueProcessor } from "@/lib/webhooks/queue-processor";

/**
 * Webhook Endpoint for Mercado Pago Notifications (Queue-based)
 *
 * NEW ARCHITECTURE (v2):
 * 1. Validate webhook origin and signature (fast, synchronous)
 * 2. Fetch payment data from Mercado Pago (fast, synchronous)
 * 3. Enqueue event for async processing (fast, atomic)
 * 4. Return 200 to Mercado Pago immediately (fail-safe)
 *
 * Actual processing happens asynchronously via:
 * - WebhookQueueProcessor.processPendingEvents() (background job)
 * - Hourly reconciliation job (failsafe for stuck events)
 *
 * Benefits:
 * - Mercado Pago gets immediate 200 response (no timeouts)
 * - Events are processed asynchronously (no blocking)
 * - Exponential backoff retries for transient failures
 * - Dead letter queue for permanent failures
 * - Hourly reconciliation ensures all events are processed
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let paymentId: string | number | undefined;

  try {
    // STEP 1: SECURITY - Validate IP origin
    const clientIP = extractClientIP(Object.fromEntries(req.headers.entries()));
    if (!validateMercadoPagoIP(clientIP)) {
      console.error(`[Webhook] Rejected request from IP: ${clientIP}`);
      throw new ValidationError(
        `Rejected request from unauthorized IP: ${clientIP}`,
        "Origen no autorizado",
      );
    }

    // STEP 2: Parse webhook body
    const { id, type } = await req.json();
    paymentId = id;

    console.log(`[Webhook] Received event: type=${type}, payment_id=${id}`);

    // STEP 3: SECURITY - Validate webhook signature (HMAC-SHA256)
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
        `[Webhook] Invalid signature for payment ${id} - rejecting request`,
      );
      throw new ValidationError(
        `Invalid signature for payment ${id}`,
        "Firma inválida",
      );
    }

    console.log(`[Webhook] Signature validated for payment ${id}`);

    // STEP 4: Only process payment events
    if (type !== "payment") {
      console.log(`[Webhook] Ignoring non-payment event: ${type}`);
      return NextResponse.json(
        { received: true, status: "ignored", event_type: type },
        { status: 200 },
      );
    }

    // STEP 5: Fetch payment data from Mercado Pago (for validation and event context)
    const paymentClient = new Payment(client);
    let paymentData;

    try {
      paymentData = await paymentClient.get({ id });
    } catch (mpError) {
      console.error(`[Webhook] Error fetching payment ${id} from MP:`, mpError);
      throw new PaymentError(
        `Error fetching payment ${id} from Mercado Pago: ${mpError instanceof Error ? mpError.message : String(mpError)}`,
        "Error al obtener pago de Mercado Pago",
      );
    }

    if (!paymentData || !paymentData.id) {
      console.error(`[Webhook] Invalid payment data for id=${id}`);
      throw new PaymentError(
        `Invalid payment data received for id=${id}`,
        "No se pudo obtener el pago",
      );
    }

    // Validate external_reference (order_id)
    if (!paymentData.external_reference) {
      console.error(`[Webhook] No external_reference in payment ${id}`);
      throw new ValidationError(
        `No external_reference found in payment ${id}`,
        "Orden no encontrada",
      );
    }

    // STEP 6: Enqueue event for async processing
    const processor = getWebhookQueueProcessor();
    const queueId = await processor.enqueueEvent(
      String(paymentData.id),
      type,
      paymentData as unknown as Record<string, unknown>,
    );

    const duration = Date.now() - startTime;
    console.log(
      `[Webhook] Event enqueued for async processing in ${duration}ms: payment_id=${paymentData.id}, queue_id=${queueId}`,
    );

    // STEP 7: Return 200 to Mercado Pago immediately (ack the webhook)
    return NextResponse.json(
      {
        received: true,
        queue_id: queueId,
        payment_id: paymentData.id,
        external_reference: paymentData.external_reference,
        status: "queued",
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

    // Even on error, return 200 to Mercado Pago if we can
    // This prevents infinite webhook retries from Mercado Pago
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.userMessage,
          code: error.code,
          payment_id: paymentId,
          status: "error",
          details: error.details,
        },
        { status: 200 }, // Note: 200 status to prevent MP retries
      );
    }

    // Fallback for unexpected errors
    return NextResponse.json(
      {
        error: "Error procesando webhook",
        payment_id: paymentId,
        status: "error",
      },
      { status: 200 }, // Note: 200 status to prevent MP retries
    );
  }
}
