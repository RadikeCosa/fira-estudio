/**
 * Webhook Queue Processor Endpoint
 *
 * POST /api/webhooks/process-queue
 *
 * Manually triggers queue processing.
 * Processes all pending/failed webhook events that are ready for retry.
 *
 * This can be called by:
 * - Cron jobs (every 1-5 minutes for frequent processing)
 * - Manual API calls for testing
 * - Monitoring systems to trigger on-demand processing
 *
 * Security: Requires WEBHOOK_QUEUE_PROCESSOR_TOKEN in Authorization header
 */

import { NextRequest, NextResponse } from "next/server";
import { getWebhookQueueProcessor } from "@/lib/webhooks/queue-processor";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (
      !authHeader ||
      authHeader !== `Bearer ${process.env.WEBHOOK_QUEUE_PROCESSOR_TOKEN}`
    ) {
      console.warn(`[Queue] Unauthorized queue processing request`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processor = getWebhookQueueProcessor();

    // Get stats before processing
    const statsBefore = {
      queue: await processor.getQueueStats(),
      deadLetter: await processor.getDeadLetterStats(),
    };

    // Process pending events
    const startTime = Date.now();
    const result = await processor.processPendingEvents();
    const duration = Date.now() - startTime;

    // Get stats after processing
    const statsAfter = {
      queue: await processor.getQueueStats(),
      deadLetter: await processor.getDeadLetterStats(),
    };

    console.log(`[Queue] Processing completed in ${duration}ms:`, {
      processed: result.processed,
      failed: result.failed,
      statsBefore,
      statsAfter,
    });

    return NextResponse.json(
      {
        status: "completed",
        duration_ms: duration,
        processed: result.processed,
        failed: result.failed,
        stats: {
          before: statsBefore,
          after: statsAfter,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Queue] Processor endpoint error:`, error);

    return NextResponse.json(
      {
        error: "Queue processing failed",
        details: errorMsg,
      },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<Response> {
  // Prevent GET access - only POST is allowed
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
