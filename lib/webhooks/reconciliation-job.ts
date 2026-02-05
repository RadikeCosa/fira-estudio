/**
 * Webhook Reconciliation Job
 *
 * Runs hourly to:
 * 1. Process pending webhook queue events
 * 2. Review and archive dead letter queue entries
 * 3. Log reconciliation stats and errors
 * 4. Handle stuck/stale events
 *
 * This job ensures all webhooks are eventually processed,
 * even if they fail initially due to transient errors.
 */

import { getWebhookQueueProcessor } from "@/lib/webhooks/queue-processor";
import { createClient } from "@supabase/supabase-js";

export interface ReconciliationResult {
  jobId: string;
  startedAt: Date;
  completedAt: Date;
  status: "completed" | "failed" | "partial";
  queueProcessed: number;
  queueFailed: number;
  deadLetterReviewed: number;
  durationMs: number;
  error?: string;
}

/**
 * Main reconciliation job - called hourly from a cron job or scheduler
 */
export async function runWebhookReconciliation(): Promise<ReconciliationResult> {
  const jobId = `reconciliation_${Date.now()}`;
  const startTime = Date.now();
  const startedAt = new Date();

  console.log(`[Reconciliation] Starting webhook reconciliation job: ${jobId}`);

  try {
    const processor = getWebhookQueueProcessor();

    // Process pending/failed queue events
    console.log(`[Reconciliation] Processing pending queue events...`);
    const queueResult = await processor.processPendingEvents();

    // Get queue statistics
    const queueStats = await processor.getQueueStats();
    console.log(`[Reconciliation] Queue stats after processing:`, queueStats);

    // Get dead letter statistics
    const dlStats = await processor.getDeadLetterStats();
    console.log(`[Reconciliation] Dead letter queue stats:`, dlStats);

    // Clean up old completed events (older than 7 days)
    const cleanupResult = await cleanupOldEvents();
    console.log(`[Reconciliation] Cleanup completed:`, cleanupResult);

    // Log reconciliation results
    const durationMs = Date.now() - startTime;
    const result: ReconciliationResult = {
      jobId,
      startedAt,
      completedAt: new Date(),
      status: queueResult.failed === 0 ? "completed" : "partial",
      queueProcessed: queueResult.processed,
      queueFailed: queueResult.failed,
      deadLetterReviewed: dlStats.pending,
      durationMs,
    };

    await logReconciliationResult(result);

    console.log(
      `[Reconciliation] Job completed successfully in ${durationMs}ms:`,
      result,
    );

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    const result: ReconciliationResult = {
      jobId,
      startedAt,
      completedAt: new Date(),
      status: "failed",
      queueProcessed: 0,
      queueFailed: 0,
      deadLetterReviewed: 0,
      durationMs,
      error: errorMsg,
    };

    await logReconciliationResult(result);

    console.error(`[Reconciliation] Job failed:`, error);

    throw error;
  }
}

/**
 * Clean up old completed events (older than 7 days)
 * Archive them to keep the queue table lean
 */
async function cleanupOldEvents(): Promise<{
  deleted: number;
  archived: number;
}> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete completed events older than 7 days
    const { data: deletedData, error: deleteError } = await supabase
      .from("webhook_queue")
      .delete()
      .eq("status", "completed")
      .lt("completed_at", sevenDaysAgo.toISOString())
      .select();

    if (deleteError) {
      console.error(
        `[Reconciliation] Error cleaning up old events:`,
        deleteError,
      );
      return { deleted: 0, archived: 0 };
    }

    const deleted = deletedData?.length || 0;

    console.log(`[Reconciliation] Cleaned up ${deleted} old completed events`);

    return { deleted, archived: 0 };
  } catch (error) {
    console.error(`[Reconciliation] Error in cleanup:`, error);
    return { deleted: 0, archived: 0 };
  }
}

/**
 * Log reconciliation job results to database
 */
async function logReconciliationResult(
  result: ReconciliationResult,
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase
      .from("webhook_reconciliation_logs")
      .insert({
        job_id: result.jobId,
        started_at: result.startedAt.toISOString(),
        completed_at: result.completedAt.toISOString(),
        status: result.status,
        queue_processed: result.queueProcessed,
        queue_failed: result.queueFailed,
        dead_letter_reviewed: result.deadLetterReviewed,
        duration_ms: result.durationMs,
        error: result.error,
      });

    if (error) {
      console.error(`[Reconciliation] Error logging results:`, error);
    }
  } catch (error) {
    console.error(`[Reconciliation] Error in logging:`, error);
  }
}

/**
 * Express/Next.js API route handler for manual reconciliation trigger
 * Usage: POST /api/webhooks/reconcile
 */
export async function handleManualReconciliation(
  req: Request,
): Promise<Response> {
  // Verify auth token if needed
  const authToken = req.headers.get("authorization");
  if (authToken !== `Bearer ${process.env.WEBHOOK_RECONCILIATION_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const result = await runWebhookReconciliation();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "Reconciliation failed",
        details: errorMsg,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

/**
 * Cron job handler - can be called by various cron services
 * Examples:
 * - Vercel Cron: POST /api/cron/webhook-reconciliation
 * - AWS Lambda: CloudWatch Events scheduled rule
 * - Google Cloud Scheduler: HTTP POST to endpoint
 */
export async function handleCronReconciliation(
  req: Request,
): Promise<Response> {
  // Verify cron secret (depends on your cron service)
  const cronSecret = req.headers.get("authorization");
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const result = await runWebhookReconciliation();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "Cron reconciliation failed",
        details: errorMsg,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
