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
      const externalReference = webhookData.external_reference as string;
      const status = webhookData.status as string;
      const statusDetail = webhookData.status_detail as string;

      // Validate external reference
      if (!externalReference) {
        throw new Error(`No external_reference found in payment ${paymentId}`);
      }

      // Check idempotency
      const existingLog =
        await this.cartRepository.getPaymentLogByPaymentId(paymentId);
      if (existingLog && existingLog.status === status) {
        console.log(
          `[WebhookQueue] Event already processed (idempotent): payment_id=${paymentId}`,
        );
      } else {
        // Save payment log
        await this.cartRepository.savePaymentLog(
          externalReference,
          paymentId,
          status || "unknown",
          statusDetail || "",
          null,
          "payment",
          webhookData,
        );

        // Update order status
        const orderStatus = this.mapPaymentStatusToOrderStatus(status);
        await this.cartRepository.updateOrderStatus(
          externalReference,
          orderStatus,
          paymentId,
        );

        console.log(
          `[WebhookQueue] Event processed successfully: payment_id=${paymentId}, order_id=${externalReference}`,
        );
      }

      // Mark as completed
      const duration = Date.now() - startTime;
      await this.updateQueueStatus(queueEvent.id!, "completed", null);
      console.log(
        `[WebhookQueue] Completed in ${duration}ms: payment_id=${paymentId}`,
      );

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
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
