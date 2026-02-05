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

  // ============================================
  // DEBUG LOGGING - Ver exactamente qué llega
  // ============================================
  const headers = Object.fromEntries(req.headers.entries());
  console.log(`[Webhook DEBUG] ========== NUEVO WEBHOOK ==========`);
  console.log(`[Webhook DEBUG] Timestamp: ${new Date().toISOString()}`);
  console.log(`[Webhook DEBUG] Headers:`, JSON.stringify(headers, null, 2));
  
  // Clonar el request para leer el body sin consumirlo
  const bodyText = await req.text();
  console.log(`[Webhook DEBUG] Raw Body: ${bodyText}`);
  
  // Parsear el body manualmente ya que lo leímos como texto
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bodyText);
    console.log(`[Webhook DEBUG] Parsed Body:`, JSON.stringify(body, null, 2));
  } catch (parseError) {
    console.error(`[Webhook DEBUG] Error parsing body:`, parseError);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 200 });
  }

  // Extraer IP y loguearla
  const clientIP = extractClientIP(headers);
  console.log(`[Webhook DEBUG] Client IP: ${clientIP}`);

  // NORMALIZAR: MP envía en 2 formatos diferentes
  // Formato 1 (antiguo): { "resource": "123456", "topic": "payment" }
  // Formato 2 (nuevo): { "id": "123456", "type": "payment" }
  let paymentId: string | number | undefined;
  let eventType: string | undefined;

  if (body.id && body.type) {
    // Formato nuevo
    paymentId = body.id as string | number;
    eventType = body.type as string;
  } else if (body.resource && body.topic) {
    // Formato antiguo - extraer ID del resource
    const resource = body.resource as string;
    // resource puede ser "144231899227" o "https://api.mercadolibre.com/merchant_orders/123"
    if (resource.includes('/')) {
      // Es una URL, extraer el último segmento
      paymentId = resource.split('/').pop();
    } else {
      // Es directamente el ID
      paymentId = resource;
    }
    eventType = body.topic as string;
    console.log(`[Webhook] Normalized from legacy format: resource=${resource}, topic=${body.topic} -> id=${paymentId}, type=${eventType}`);
  } else {
    console.error(`[Webhook DEBUG] Unknown webhook format:`, JSON.stringify(body));
    return NextResponse.json({ 
      received: true, 
      status: "unknown_format",
      body: body 
    }, { status: 200 });
  }

  // Validar que tengamos los campos necesarios
  if (!paymentId || !eventType) {
    console.error(`[Webhook DEBUG] Missing required fields after normalization: id=${paymentId}, type=${eventType}`);
    return NextResponse.json({ 
      received: true, 
      status: "missing_fields" 
    }, { status: 200 });
  }

  console.log(`[Webhook] Received event: type=${eventType}, payment_id=${paymentId}`);

  try {
    // STEP 1: SECURITY - Validate IP origin (con bypass si está habilitado)
    if (process.env.WEBHOOK_SKIP_IP_VALIDATION !== "true") {
      if (!validateMercadoPagoIP(clientIP)) {
        console.error(`[Webhook] Rejected request from IP: ${clientIP}`);
        throw new ValidationError(
          `Rejected request from unauthorized IP: ${clientIP}`,
          "Origen no autorizado",
        );
      }
    } else {
      console.warn(`[Webhook DEBUG] IP validation SKIPPED (debug mode)`);
    }

    // STEP 2: SECURITY - Validate webhook signature (con bypass si está habilitado)
    if (process.env.WEBHOOK_SKIP_SIGNATURE_VALIDATION !== "true") {
      const xTimestamp = headers["x-request-id"] || String(Date.now());
      
      if (
        !validateWebhookSignature(
          headers,
          bodyText,
          paymentId,
          xTimestamp,
        )
      ) {
        console.error(
          `[Webhook] Invalid signature for payment ${paymentId} - rejecting request`,
        );
        throw new ValidationError(
          `Invalid signature for payment ${paymentId}`,
          "Firma inválida",
        );
      }
      console.log(`[Webhook] Signature validated for payment ${paymentId}`);
    } else {
      console.warn(`[Webhook DEBUG] Signature validation SKIPPED (debug mode)`);
    }

    // STEP 3: Only process payment events
    if (eventType !== "payment") {
      console.log(`[Webhook] Ignoring non-payment event: ${eventType}`);
      return NextResponse.json(
        { received: true, status: "ignored", event_type: eventType },
        { status: 200 },
      );
    }

    // STEP 4: Fetch payment data from Mercado Pago (for validation and event context)
    const paymentClient = new Payment(client);
    let paymentData;

    try {
      paymentData = await paymentClient.get({ id: paymentId });
    } catch (mpError) {
      console.error(`[Webhook] Error fetching payment ${paymentId} from MP:`, mpError);
      throw new PaymentError(
        `Error fetching payment ${paymentId} from Mercado Pago: ${mpError instanceof Error ? mpError.message : String(mpError)}`,
        "Error al obtener pago de Mercado Pago",
      );
    }

    if (!paymentData || !paymentData.id) {
      console.error(`[Webhook] Invalid payment data for id=${paymentId}`);
      throw new PaymentError(
        `Invalid payment data received for id=${paymentId}`,
        "No se pudo obtener el pago",
      );
    }

    // Validate external_reference (order_id)
    if (!paymentData.external_reference) {
      console.error(`[Webhook] No external_reference in payment ${paymentId}`);
      throw new ValidationError(
        `No external_reference found in payment ${paymentId}`,
        "Orden no encontrada",
      );
    }

    // STEP 5: Enqueue event for async processing
    const processor = getWebhookQueueProcessor();
    const queueId = await processor.enqueueEvent(
      String(paymentData.id),
      eventType,
      paymentData as unknown as Record<string, unknown>,
    );

    // AGREGAR: Procesar el evento inmediatamente (no esperar a un job)
    try {
      const queueEvent = {
        id: queueId,
        payment_id: String(paymentData.id),
        event_type: eventType,
        webhook_data: paymentData as unknown as Record<string, unknown>,
        status: "pending" as const,
        retry_count: 0,
        max_retries: 5,
      };
      await processor.processEvent(queueEvent);
      console.log(
        `[Webhook] Event processed immediately: payment_id=${paymentData.id}`,
      );
    } catch (processError) {
      // Si falla el procesamiento inmediato, el evento queda encolado para retry
      console.error(
        `[Webhook] Immediate processing failed, event queued for retry:`,
        processError,
      );
    }

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
