/**
 * Webhook Queue Processor
 *
 * Handles asynchronous processing of webhook events with:
 * - Exponential backoff retry strategy
 * - Dead letter queue for failed events
 * - Idempotency via payment logs
 * - Detailed error tracking
 *
 * Usage:
 * 1. Webhook endpoint adds event to queue
 * 2. Queue processor polls and retries failed events
 * 3. Hourly reconciliation job cleans up and retries stuck events
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { client } from "@/lib/mercadopago/client";
import { Payment } from "mercadopago";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";

export interface WebhookQueueEvent {
  id?: number;
  payment_id: string;
  event_type: string;
  webhook_data: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  retry_count: number;
  max_retries: number;
  last_error?: string;
  next_retry_at?: string;
}

export interface WebhookDeadLetterEntry {
  webhook_queue_id: number;
  payment_id: string;
  event_type: string;
  webhook_data: Record<string, unknown>;
  total_attempts: number;
  final_error: string;
  error_details?: Record<string, unknown>;
}

export class WebhookQueueProcessor {
  private supabase: SupabaseClient;
  private cartRepository: CartRepository;

  constructor(supabase?: SupabaseClient) {
    this.supabase =
      supabase ||
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
    this.cartRepository = new CartRepository(this.supabase);
  }

  /**
   * Fetch payment data from Mercado Pago API
   */
  private async fetchPaymentFromMP(paymentId: string): Promise<{
    external_reference: string;
    status: string;
    status_detail: string;
  }> {
    const paymentClient = new Payment(client);
    
    try {
      const paymentData = await paymentClient.get({ id: paymentId });
      
      if (!paymentData || !paymentData.external_reference) {
        throw new Error(`Payment ${paymentId} has no external_reference`);
      }
      
      return {
        external_reference: paymentData.external_reference,
        status: paymentData.status || 'unknown',
        status_detail: paymentData.status_detail || '',
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error(`[WebhookQueue] Error fetching payment ${paymentId} from MP:`, errorMsg);
      throw new Error(`Failed to fetch payment ${paymentId}: ${errorMsg}`);
    }
  }

  /**
   * Enqueue a webhook event for asynchronous processing
   */
  async enqueueEvent(
    paymentId: string,
    eventType: string,
    webhookData: Record<string, unknown>,
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from("webhook_queue")
      .insert({
        payment_id: paymentId,
        event_type: eventType,
        webhook_data: webhookData,
        status: "pending",
        retry_count: 0,
        max_retries: 5,
        next_retry_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      // If duplicate error, search for existing event
      if (error.code === '23505') {
        console.log(`[WebhookQueue] Event already exists (idempotent): payment_id=${paymentId}`);
        
        // Search for existing event
        const { data: existing } = await this.supabase
          .from("webhook_queue")
          .select("id")
          .eq("payment_id", paymentId)
          .eq("event_type", eventType)
          .single();
        
        if (existing) {
          return existing.id;
        }
      }
      
      console.error(`[WebhookQueue] Error enqueuing event:`, error);
      throw error;
    }

    console.log(
      `[WebhookQueue] Event enqueued: payment_id=${paymentId}, queue_id=${data.id}`,
    );
    return data.id;
  }

  /**
   * Process a single queued event
   */
  async processEvent(queueEvent: WebhookQueueEvent): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Update status to processing
      await this.updateQueueStatus(
        queueEvent.id!,
        "processing",
        null,
        new Date().toISOString(),
      );

      const { webhook_data: webhookData } = queueEvent;
      const paymentId = queueEvent.payment_id;
      
      // Intentar obtener datos del webhook_data primero
      let externalReference = webhookData.external_reference as string | undefined;
      let status = webhookData.status as string | undefined;
      let statusDetail = webhookData.status_detail as string | undefined;
      
      // Si no hay external_reference en webhook_data, fetch desde MP API
      if (!externalReference) {
        console.log(`[WebhookQueue] No external_reference in webhook_data, fetching from MP API for payment ${paymentId}...`);
        const paymentData = await this.fetchPaymentFromMP(paymentId);
        externalReference = paymentData.external_reference;
        status = paymentData.status;
        statusDetail = paymentData.status_detail;
        console.log(`[WebhookQueue] Got payment data from MP: external_reference=${externalReference}, status=${status}`);
      }

      // Validate external reference
      if (!externalReference) {
        throw new Error(`No external_reference found for payment ${paymentId}`);
      }

      // Extract order_id from external_reference
      // Format: "email|uuid" -> extract only the uuid (last part)
      let orderId = externalReference;
      if (externalReference && externalReference.includes('|')) {
        const parts = externalReference.split('|');
        orderId = parts[parts.length - 1]; // Take the last part (the UUID)
        console.log(`[WebhookQueue] Extracted order_id from external_reference: ${externalReference} -> ${orderId}`);
      }

      // Validate order_id
      if (!orderId) {
        throw new Error(`No order_id found in external_reference: ${externalReference}`);
      }

      // Fetch current order status
      const currentOrder = await this.cartRepository.getOrderById(orderId);
      const paymentStatus = status || "unknown";
      const orderStatus = this.mapPaymentStatusToOrderStatus(paymentStatus);
      
      // Check if order needs update (status or payment_id mismatch)
      const orderNeedsUpdate = 
        currentOrder.status !== orderStatus || 
        currentOrder.mercadopago_payment_id !== paymentId;

      // Check if payment_log already exists
      const existingLog =
        await this.cartRepository.getPaymentLogByPaymentId(paymentId);
      const logExists = existingLog && existingLog.status === paymentStatus;

      if (logExists && !orderNeedsUpdate) {
        // True idempotency: both log and order are already correct
        console.log(
          `[WebhookQueue] Event already fully processed (idempotent): payment_id=${paymentId}`,
        );
      } else {
        // Create payment_log if it doesn't exist
        if (!logExists) {
          await this.cartRepository.savePaymentLog(
            orderId,
            paymentId,
            paymentStatus,
            statusDetail || "",
            null,
            "payment",
            webhookData,
          );
          console.log(
            `[WebhookQueue] Payment log saved: payment_id=${paymentId}, status=${paymentStatus}`,
          );
        }

        // Update order if needed
        if (orderNeedsUpdate) {
          await this.cartRepository.updateOrderStatus(
            orderId,
            orderStatus,
            paymentId,
          );
          console.log(
            `[WebhookQueue] Order updated: order_id=${orderId}, status=${orderStatus}`,
          );
        }
      }

      // If payment approved, clear cart and decrement stock
      if (orderStatus === "approved") {
        try {
          // Decrement stock
          await this.cartRepository.decrementStockForOrder(orderId);
          console.log(
            `[WebhookQueue] Stock decremented for order: ${orderId}`,
          );

          // Clear the cart
          const cartId =
            await this.cartRepository.getCartIdByOrderId(orderId);
          if (cartId) {
            await this.cartRepository.clearCart(cartId);
            await this.cartRepository.updateCartTotal(cartId);
            console.log(`[WebhookQueue] Cart cleared: cart_id=${cartId}`);
          }
        } catch (postApprovalError) {
          // Don't fail webhook if this fails - payment already confirmed
          console.error(
            `[WebhookQueue] Post-approval actions failed:`,
            postApprovalError,
          );
        }

        // Send confirmation email
        try {
          await sendOrderConfirmationEmail(orderId);
          console.log(
            `[WebhookQueue] Confirmation email sent for order: ${orderId}`,
          );
        } catch (emailError) {
          // Don't fail the webhook if email fails - payment already confirmed
          console.error(
            `[WebhookQueue] Failed to send confirmation email:`,
            emailError,
          );
        }
      }

      // Mark as completed
      const duration = Date.now() - startTime;
      await this.updateQueueStatus(queueEvent.id!, "completed", null);
      console.log(
        `[WebhookQueue] Completed in ${duration}ms: payment_id=${paymentId}`,
      );

      return true;
    } catch (error) {
      // Serializar el error correctamente
      let errorMsg: string;
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object') {
        errorMsg = JSON.stringify(error);
      } else {
        errorMsg = String(error);
      }
      
      console.error(`[WebhookQueue] Error processing event:`, {
        queueId: queueEvent.id,
        paymentId: queueEvent.payment_id,
        error: errorMsg,
        retryCount: queueEvent.retry_count,
        maxRetries: queueEvent.max_retries,
      });

      // Decide if we should retry or move to dead letter
      const nextRetryCount = queueEvent.retry_count + 1;
      if (nextRetryCount >= queueEvent.max_retries) {
        // Move to dead letter queue
        await this.moveToDeadLetterQueue(
          queueEvent.id!,
          queueEvent.payment_id,
          queueEvent.event_type,
          queueEvent.webhook_data,
          nextRetryCount,
          errorMsg,
          error instanceof Error ? error : undefined,
        );
      } else {
        // Schedule retry with exponential backoff
        const nextRetryAt = this.calculateNextRetryTime(nextRetryCount);
        await this.updateQueueStatus(
          queueEvent.id!,
          "failed",
          errorMsg,
          nextRetryAt,
          nextRetryCount,
        );
      }

      return false;
    }
  }

  /**
   * Process all pending events that are ready for retry
   */
  async processPendingEvents(): Promise<{
    processed: number;
    failed: number;
  }> {
    const now = new Date().toISOString();

    // Get all pending/failed events ready for processing
    const { data: events, error } = await this.supabase
      .from("webhook_queue")
      .select("*")
      .in("status", ["pending", "failed"])
      .lte("next_retry_at", now)
      .order("retry_count", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error(`[WebhookQueue] Error fetching pending events:`, error);
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const event of events || []) {
      const success = await this.processEvent(event as WebhookQueueEvent);
      if (success) {
        processed++;
      } else {
        failed++;
      }
    }

    console.log(
      `[WebhookQueue] Batch processing completed: ${processed} successful, ${failed} failed`,
    );
    return { processed, failed };
  }

  /**
   * Move a failed event to dead letter queue after max retries
   */
  private async moveToDeadLetterQueue(
    queueId: number,
    paymentId: string,
    eventType: string,
    webhookData: Record<string, unknown>,
    totalAttempts: number,
    finalError: string,
    error?: Error,
  ): Promise<void> {
    try {
      // Insert into dead letter queue
      const { error: dlError } = await this.supabase
        .from("webhook_dead_letter")
        .insert({
          webhook_queue_id: queueId,
          payment_id: paymentId,
          event_type: eventType,
          webhook_data: webhookData,
          total_attempts: totalAttempts,
          final_error: finalError,
          error_details: error
            ? { stack: error.stack, message: error.message }
            : null,
          status: "pending",
        });

      if (dlError) throw dlError;

      // Update queue status to failed (but keep for reference)
      await this.updateQueueStatus(queueId, "failed", finalError);

      console.error(
        `[WebhookQueue] Event moved to dead letter queue: payment_id=${paymentId}, queue_id=${queueId}`,
      );
    } catch (err) {
      console.error(`[WebhookQueue] Error moving to dead letter queue:`, err);
    }
  }

  /**
   * Update queue event status
   */
  private async updateQueueStatus(
    queueId: number,
    status: string,
    lastError?: string | null,
    nextRetryAt?: string,
    retryCount?: number,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      last_attempt_at: new Date().toISOString(),
    };

    if (lastError !== undefined) {
      updateData.last_error = lastError;
    }

    if (nextRetryAt) {
      updateData.next_retry_at = nextRetryAt;
    }

    if (retryCount !== undefined) {
      updateData.retry_count = retryCount;
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from("webhook_queue")
      .update(updateData)
      .eq("id", queueId);

    if (error) {
      console.error(`[WebhookQueue] Error updating queue status:`, error);
      throw error;
    }
  }

  /**
   * Calculate next retry time using exponential backoff
   * Backoff: 1 min, 2 min, 4 min, 8 min, 16 min, 32 min
   */
  private calculateNextRetryTime(retryCount: number): string {
    const baseDelayMinutes = Math.min(Math.pow(2, retryCount - 1), 32);
    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + baseDelayMinutes);
    return nextRetry.toISOString();
  }

  /**
   * Map Mercado Pago payment status to order status
   */
  private mapPaymentStatusToOrderStatus(
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

  /**
   * Get dead letter queue statistics
   */
  async getDeadLetterStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
  }> {
    const { data: dlData, error } = await this.supabase
      .from("webhook_dead_letter")
      .select("status")
      .in("status", ["pending", "reviewed"]);

    if (error) {
      console.error(`[WebhookQueue] Error fetching dead letter stats:`, error);
      return { total: 0, pending: 0, reviewed: 0 };
    }

    const total = dlData?.length || 0;
    const pending = dlData?.filter((d) => d.status === "pending").length || 0;
    const reviewed = dlData?.filter((d) => d.status === "reviewed").length || 0;

    return { total, pending, reviewed };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const { data: queueData, error } = await this.supabase
      .from("webhook_queue")
      .select("status");

    if (error) {
      console.error(`[WebhookQueue] Error fetching queue stats:`, error);
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }

    const pending =
      queueData?.filter((q) => q.status === "pending").length || 0;
    const processing =
      queueData?.filter((q) => q.status === "processing").length || 0;
    const completed =
      queueData?.filter((q) => q.status === "completed").length || 0;
    const failed = queueData?.filter((q) => q.status === "failed").length || 0;

    return { pending, processing, completed, failed };
  }
}

/**
 * Singleton instance for webhook queue processing
 */
let processorInstance: WebhookQueueProcessor | null = null;

export function getWebhookQueueProcessor(): WebhookQueueProcessor {
  if (!processorInstance) {
    processorInstance = new WebhookQueueProcessor();
  }
  return processorInstance;
}
