/**
 * Rate Limit API Route
 * 
 * Server-side rate limiting by IP address with separate configurations
 * for different action types (whatsapp, contact).
 */

import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/utils/security-logger";

/** Rate limit configuration for different action types */
const RATE_LIMITS = {
  whatsapp: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  },
  contact: {
    maxRequests: 3,
    windowMs: 300000, // 5 minutes
  },
} as const;

/** Rate limit record structure */
interface RateLimitRecord {
  count: number;
  resetAt: number;
  firstAttempt: number;
}

/** In-memory store for rate limit records */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Extracts client IP address from request headers
 * Priority: x-forwarded-for > x-real-ip > fallback to "unknown"
 * 
 * @param req - Next.js request object
 * @returns Client IP address or "unknown"
 */
async function getClientIP(req: NextRequest): Promise<string> {
  // Check x-forwarded-for header (Vercel, Cloudflare)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the list
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback
  return "unknown";
}

/**
 * POST endpoint - Check rate limit for an action
 * 
 * Expected body: { action: "whatsapp" | "contact" }
 * 
 * Returns:
 * - 200: { allowed: true }
 * - 429: { allowed: false, resetIn: number, message: string }
 * - 400: { error: string }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();
    const { action } = body;

    // Validate action
    if (!action || !(action in RATE_LIMITS)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'whatsapp' or 'contact'" },
        { status: 400 }
      );
    }

    // Get client IP
    const ip = await getClientIP(req);
    const key = `${action}:${ip}`;
    const config = RATE_LIMITS[action as keyof typeof RATE_LIMITS];
    const now = Date.now();

    // Get existing record
    const record = rateLimitStore.get(key);

    // Check if record exists and has not expired
    if (record && now < record.resetAt) {
      // Check if limit exceeded
      if (record.count >= config.maxRequests) {
        const resetIn = record.resetAt - now;

        // Log rate limit exceeded
        logSecurityEvent("rate_limit_exceeded", {
          action,
          ip,
          count: record.count,
          maxRequests: config.maxRequests,
          resetIn,
        });

        return NextResponse.json(
          {
            allowed: false,
            resetIn,
            message: `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 1000)} seconds.`,
          },
          { status: 429 }
        );
      }

      // Increment count
      record.count += 1;
      rateLimitStore.set(key, record);

      // Log rate limit check
      logSecurityEvent("rate_limit_check", {
        action,
        ip,
        count: record.count,
        maxRequests: config.maxRequests,
        allowed: true,
      });

      return NextResponse.json({ allowed: true });
    }

    // Create new record (no existing record or expired)
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + config.windowMs,
      firstAttempt: now,
    };
    rateLimitStore.set(key, newRecord);

    // Log rate limit check
    logSecurityEvent("rate_limit_check", {
      action,
      ip,
      count: 1,
      maxRequests: config.maxRequests,
      allowed: true,
      newRecord: true,
    });

    return NextResponse.json({ allowed: true });
  } catch (error) {
    // Log error and fail open (allow the action)
    logSecurityEvent("rate_limit_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    console.error("Rate limit check error:", error);

    // Fail open - allow the action
    return NextResponse.json({ allowed: true });
  }
}

/**
 * GET endpoint - Health check
 * 
 * Returns:
 * - 200: { status: "ok", activeRecords: number }
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    activeRecords: rateLimitStore.size,
  });
}

/**
 * Auto-cleanup: Remove expired records every 5 minutes
 * Uses lazy initialization to prevent multiple intervals during hot reloading
 */
let cleanupInterval: NodeJS.Timeout | null = null;

if (!cleanupInterval) {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000); // 5 minutes

  // Clean up interval on module unload (for development)
  if (process.env.NODE_ENV === "development") {
    process.on("SIGTERM", () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    });
  }
}
