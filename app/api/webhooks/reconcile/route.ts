/**
 * Webhook Reconciliation API Endpoint
 *
 * POST /api/webhooks/reconcile
 *
 * Triggers the webhook reconciliation job manually.
 * Can be called by:
 * - Cron jobs (Vercel Cron, AWS Lambda, Google Cloud Scheduler, etc.)
 * - Manual API calls for testing
 * - Monitoring systems for periodic cleanup
 *
 * Security: Requires WEBHOOK_RECONCILIATION_TOKEN in Authorization header
 */

import { NextRequest, NextResponse } from "next/server";
import { handleManualReconciliation } from "@/lib/webhooks/reconciliation-job";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (
      !authHeader ||
      authHeader !== `Bearer ${process.env.WEBHOOK_RECONCILIATION_TOKEN}`
    ) {
      console.warn(`[Reconciliation] Unauthorized reconciliation request`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run reconciliation
    const response = await handleManualReconciliation(req);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Reconciliation] Endpoint error:`, error);

    return NextResponse.json(
      {
        error: "Reconciliation failed",
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
