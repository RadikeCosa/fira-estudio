# PHASE 2 - PRODUCTION READINESS ROADMAP

**Status:** Phase 1 Complete (Test Suite Fix ✅)  
**Current:** 93.3% Test Pass Rate, 70% Production Readiness  
**Goal:** 95%+ Pass Rate, 100% Production Readiness

---

## 🎯 PHASE 1: COMPLETE ✅

### Issue #1: Tests Robo (FIXED)

- **Problem:** CartRepository used hardcoded static methods, impossible to mock
- **Solution:** Refactored to Dependency Injection pattern
- **Status:** ✅ RESOLVED - 62/62 critical path tests passing
- **Commit:** `cf6bb7b`

---

## 📋 PHASE 2: REMAINING ISSUES (3 Critical, ~8 hours total)

### Issue #2: Rate Limiting Integration ⏳

**Status:** Not started  
**Priority:** HIGH (Prevents abuse/DoS)  
**Est. Time:** 1-2 hours

**Files to Modify:**

1. **[app/api/checkout/create-preference/route.ts](app/api/checkout/create-preference/route.ts)**
   - Add rate limit check at start of POST handler
   - Return 429 (Too Many Requests) if limit exceeded
   - Current: No rate limiting

2. **[app/api/rate-limit/route.ts](app/api/rate-limit/route.ts)**
   - Already exists but not integrated
   - Need to export `checkRateLimit()` function
   - Should use IP + endpoint + time window

**Implementation Pattern:**

```typescript
// app/api/checkout/create-preference/route.ts
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  const clientIP = request.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit: 5 requests per 15 minutes
  const limit = await checkRateLimit(clientIP, "checkout", 5, "15m");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // ... rest of handler
}
```

**Testing:**

```typescript
// Test 429 response
describe("Rate Limiting", () => {
  test("returns 429 when limit exceeded", async () => {
    for (let i = 0; i < 6; i++) {
      const response = await POST(createRequest("192.168.1.1"));
      if (i < 5) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

---

### Issue #3: Error Handling Enhancement ⏳

**Status:** Not started  
**Priority:** HIGH (Better UX)  
**Est. Time:** 2-3 hours

**Files to Create/Modify:**

1. **[lib/errors/AppError.ts](lib/errors/AppError.ts)** (Create)
   - Base error class
   - Custom error types: ValidationError, NotFoundError, RateLimitError, PaymentError

```typescript
// lib/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public userMessage: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage: string) {
    super("VALIDATION_ERROR", 400, message, userMessage);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, userMessage: string) {
    super("PAYMENT_ERROR", 402, message, userMessage);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(
      "RATE_LIMIT_ERROR",
      429,
      "Too many requests",
      "Demasiadas solicitudes. Intenta de nuevo en 15 minutos.",
    );
  }
}
```

2. **[app/api/checkout/create-preference/route.ts](app/api/checkout/create-preference/route.ts)**
   - Use custom error classes
   - Return user-friendly messages

```typescript
// app/api/checkout/create-preference/route.ts
import { AppError, ValidationError, PaymentError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.cart_id) {
      throw new ValidationError(
        "Missing cart_id",
        "Carrito inválido. Intenta de nuevo.",
      );
    }

    const preference = await createPreference(body);
    return NextResponse.json(preference);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.userMessage,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
```

3. **[app/api/rate-limit/route.ts](app/api/rate-limit/route.ts)**
   - Throw RateLimitError instead of returning error object

```typescript
// app/api/rate-limit/route.ts
import { RateLimitError } from "@/lib/errors";

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  window: string,
): Promise<{ allowed: boolean }> {
  const count = await redis.incr(`rate-limit:${ip}:${endpoint}`);

  if (count === 1) {
    await redis.expire(`rate-limit:${ip}:${endpoint}`, parseWindow(window));
  }

  if (count > limit) {
    throw new RateLimitError();
  }

  return { allowed: true };
}
```

**Testing:**

```typescript
// Test error responses
describe("Error Handling", () => {
  test("returns user-friendly error message", async () => {
    const response = await POST(createRequest({})); // Missing cart_id
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Carrito inválido. Intenta de nuevo.");
  });
});
```

---

### Issue #4: Webhook Reconciliation Pattern ⏳

**Status:** Not started  
**Priority:** MEDIUM (Robustness)  
**Est. Time:** 2-3 hours

**Problem:**

- Webhook processing can fail mid-transaction
- No retry mechanism for partial failures
- No reconciliation for stale payments

**Solution:**

1. **[lib/utils/webhook-queue.ts](lib/utils/webhook-queue.ts)** (Create)
   - Queue-based webhook processing
   - Exponential backoff retries
   - Dead letter queue for failed webhooks

```typescript
// lib/utils/webhook-queue.ts
interface WebhookJob {
  id: string;
  topic: string;
  payload: any;
  attempts: number;
  maxAttempts: number;
  nextRetry?: Date;
  error?: string;
}

export class WebhookQueue {
  async enqueue(topic: string, payload: any): Promise<void> {
    const job: WebhookJob = {
      id: crypto.randomUUID(),
      topic,
      payload,
      attempts: 0,
      maxAttempts: 5,
    };

    await supabase.from("webhook_queue").insert([job]);
  }

  async process(): Promise<void> {
    // Process pending webhooks
    // Use exponential backoff: 1s, 2s, 4s, 8s, 16s
    // Move to dead_letter_queue after 5 attempts
  }
}
```

2. **[app/api/webhooks/mercadopago/route.ts](app/api/webhooks/mercadopago/route.ts)** (Modify)
   - Use WebhookQueue instead of direct processing
   - Return 202 Accepted immediately
   - Process asynchronously with retries

```typescript
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const payload = await request.json();

  // Queue webhook for processing
  await webhookQueue.enqueue("payment.received", payload);

  // Return immediately to Mercado Pago
  return NextResponse.json({ received: true }, { status: 202 });
}
```

**Testing:**

```typescript
// Test webhook retry
describe("Webhook Queue", () => {
  test("retries failed webhooks with exponential backoff", async () => {
    const queue = new WebhookQueue();
    await queue.enqueue("payment.received", { id: "test" });

    // Simulate first failure
    await queue.process(); // Attempt 1 fails

    // Check retry scheduled
    const job = await getJob("test");
    expect(job.attempts).toBe(1);
    expect(job.nextRetry).toBeDefined();
  });
});
```

---

## 📊 IMPACT SUMMARY

| Issue                  | Priority | Status  | Time   | Impact         |
| ---------------------- | -------- | ------- | ------ | -------------- |
| **#1: Tests Robo**     | CRITICAL | ✅ DONE | 2h     | 62 tests fixed |
| **#2: Rate Limiting**  | HIGH     | ⏳ TODO | 1-2h   | Prevents abuse |
| **#3: Error Handling** | HIGH     | ⏳ TODO | 2-3h   | Better UX      |
| **#4: Reconciliation** | MEDIUM   | ⏳ TODO | 2-3h   | Robustness     |
| **TOTAL REMAINING**    | -        | -       | **8h** | **95%+ ready** |

---

## 🎯 NEXT STEPS (Priority Order)

### Step 1: Rate Limiting Integration (1-2 hours)

**What:** Add rate limit check to checkout endpoint  
**Why:** Prevents abuse and DoS attacks  
**How:**

1. Review `app/api/rate-limit/route.ts`
2. Import and call `checkRateLimit()` in create-preference
3. Return 429 if limit exceeded
4. Write tests for 429 response

### Step 2: Error Handling Enhancement (2-3 hours)

**What:** Create custom error classes and user messages  
**Why:** Better error messages for users (Spanish)  
**How:**

1. Create `lib/errors/AppError.ts`
2. Update all API endpoints to use custom errors
3. Write tests for error messages

### Step 3: Webhook Reconciliation (2-3 hours)

**What:** Implement queue-based webhook processing  
**Why:** Robust handling of payment notifications  
**How:**

1. Create `lib/utils/webhook-queue.ts`
2. Update webhook handler to queue instead of direct process
3. Write tests for retry logic

---

## ✅ READINESS CHECKLIST

- [x] Phase 1: Test Suite Fixed
- [ ] Phase 2.1: Rate Limiting Added
- [ ] Phase 2.2: Error Handling Improved
- [ ] Phase 2.3: Webhook Reconciliation Implemented
- [ ] Phase 2.4: Full test suite passing (95%+)
- [ ] Phase 2.5: Deployed to staging
- [ ] Phase 2.6: Manual verification
- [ ] Phase 2.7: Deploy to production

---

## 📝 NOTES

- All changes follow Next.js 16 App Router patterns
- Keep TypeScript strict mode enforced
- Use centralized content/design tokens
- Write comprehensive tests (vitest)
- Commit to staging branch before production

---

**Last Updated:** February 5, 2026  
**Next Milestone:** Rate Limiting Integration Complete  
**Estimated Completion:** February 7, 2026
