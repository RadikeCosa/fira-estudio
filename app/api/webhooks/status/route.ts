/**
 * Webhook Queue Status Endpoint
 *
 * GET /api/webhooks/status
 *
 * Returns current stats on:
 * - Webhook queue status (pending, processing, completed, failed)
 * - Dead letter queue stats
 * - Recent reconciliation logs
 *
 * Security: Requires WEBHOOK_STATUS_TOKEN in Authorization header
 */

import { NextRequest, NextResponse } from "next/server";
import { getWebhookQueueProcessor } from "@/lib/webhooks/queue-processor";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (
      !authHeader ||
      authHeader !== `Bearer ${process.env.WEBHOOK_STATUS_TOKEN}`
    ) {
      console.warn(`[Status] Unauthorized status request`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processor = getWebhookQueueProcessor();

    // Get queue and dead letter stats
    const queueStats = await processor.getQueueStats();
    const deadLetterStats = await processor.getDeadLetterStats();

    // Get recent reconciliation logs
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: recentLogs } = await supabase
      .from("webhook_reconciliation_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(5);

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        queue: queueStats,
        deadLetter: deadLetterStats,
        recentReconciliations: recentLogs || [],
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Status] Status endpoint error:`, error);

    return NextResponse.json(
      {
        error: "Failed to retrieve status",
        details: errorMsg,
      },
      { status: 500 },
    );
  }
}

export async function POST(): Promise<Response> {
  // Prevent POST access - only GET is allowed
  return NextResponse.json(
    { error: "Method not allowed. Use GET." },
    { status: 405 },
  );
}
