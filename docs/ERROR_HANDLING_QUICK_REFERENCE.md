# Error Handling Quick Reference

**Quick copy-paste patterns for implementing AppError in new endpoints**

---

## Pattern 1: Basic Validation Error

```typescript
import { ValidationError } from "@/lib/errors/AppError";

// Use when input is invalid
if (!email) {
  throw new ValidationError("Email is required", "El correo es requerido");
}

if (!isValidEmail(email)) {
  throw new ValidationError(
    "Invalid email format",
    "Correo electrónico inválido",
    { field: "email", value: email },
  );
}
```

---

## Pattern 2: Payment/Mercado Pago Error

```typescript
import { PaymentError } from "@/lib/errors/AppError";

// Use when Mercado Pago API fails
try {
  const payment = await client.payment.get({ id });
} catch (err) {
  throw new PaymentError(
    `Failed to fetch payment ${id}: ${err.message}`,
    "Error al obtener el pago",
    { paymentId: id },
  );
}
```

---

## Pattern 3: Rate Limit Error

```typescript
import { RateLimitError } from "@/lib/errors/AppError";

// Use when rate limit exceeded
const resetTime = calculateResetTime(); // milliseconds
throw new RateLimitError("Rate limit exceeded", "Demasiadas solicitudes", {
  resetIn: resetTime,
});
```

---

## Pattern 4: Order/Database Error

```typescript
import { OrderError } from "@/lib/errors/AppError";

// Use when database operations fail
try {
  await updateOrderStatus(orderId, status);
} catch (err) {
  throw new OrderError(
    `Failed to update order ${orderId}: ${err.message}`,
    "Error al actualizar el pedido",
    { orderId, status },
  );
}
```

---

## Pattern 5: Configuration Error

```typescript
import { ConfigurationError } from "@/lib/errors/AppError";

// Use when env vars/config is missing
if (!process.env.HMAC_KEY) {
  throw new ConfigurationError(
    "HMAC_KEY environment variable not set",
    "Error de configuración del servidor",
  );
}
```

---

## Pattern 6: Complete Error Handler

```typescript
import {
  AppError,
  ValidationError,
  PaymentError,
  RateLimitError,
  ConfigurationError,
  OrderError,
} from "@/lib/errors/AppError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Validation
    const body = await req.json();
    if (!body.field) {
      throw new ValidationError("Missing field", "Campo requerido");
    }

    // Business logic
    const result = await someOperation();

    // Success response
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Handle AppError
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.userMessage,
          code: error.code,
          ...(error.details && { details: error.details }),
        },
        { status: error.statusCode },
      );
    }

    // Fallback for unexpected errors
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Error procesando solicitud" },
      { status: 500 },
    );
  }
}
```

---

## Pattern 7: Custom Error Details

```typescript
// Always provide user-friendly Spanish messages
// Optional technical details for debugging

throw new ValidationError(
  "Invalid payment method: missing payment_token", // Technical
  "Método de pago inválido", // User message
  {
    paymentMethod: "credit_card",
    requiredField: "payment_token",
  }, // Details for logs
);
```

---

## HTTP Status Code Mapping

| Error Type           | Status | When to Use                       |
| -------------------- | ------ | --------------------------------- |
| `ValidationError`    | 400    | Invalid input, missing fields     |
| `RateLimitError`     | 429    | Too many requests                 |
| `PaymentError`       | 500    | Payment processing failure        |
| `OrderError`         | 500    | Order database operations failure |
| `ConfigurationError` | 500    | Missing env vars or invalid setup |

---

## Error Response Schema

**Always returns this format:**

```json
{
  "error": "User-friendly message in Spanish",
  "code": "ERROR_TYPE_CODE",
  "details": {
    "key": "optional technical context"
  },
  "status": 400
}
```

**Note:** The `details` field is optional. Only include when helpful for debugging.

---

## Testing Pattern

```typescript
import { describe, it, expect } from "vitest";
import { ValidationError } from "@/lib/errors/AppError";

describe("Error Handling", () => {
  it("throws ValidationError on invalid email", () => {
    expect(() => {
      validateEmail("invalid");
    }).toThrow(ValidationError);
  });

  it("returns 400 status for validation errors", async () => {
    const response = await fetch("POST /api/endpoint", {
      body: JSON.stringify({ email: "invalid" }),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe("VALIDATION_ERROR");
  });
});
```

---

## Common Error Messages (Spanish)

**Validation:**

- "Campo requerido" (Field required)
- "Formato inválido" (Invalid format)
- "Correo electrónico inválido" (Invalid email)
- "Teléfono inválido" (Invalid phone)

**Payment:**

- "Error al procesar el pago" (Error processing payment)
- "Error al obtener el pago" (Error fetching payment)
- "Pago no encontrado" (Payment not found)
- "Método de pago inválido" (Invalid payment method)

**Rate Limit:**

- "Demasiadas solicitudes" (Too many requests)
- "Por favor, espere antes de intentar de nuevo" (Please wait before retrying)

**Order:**

- "Pedido no encontrado" (Order not found)
- "Error al actualizar el pedido" (Error updating order)
- "Estado del pedido inválido" (Invalid order status)

**Configuration:**

- "Error de configuración del servidor" (Server configuration error)
- "Las credenciales están incompletas" (Incomplete credentials)

---

## Do's and Don'ts

✅ **DO:**

- Use AppError subclasses for all known error types
- Provide Spanish user messages
- Include relevant context in details
- Log technical errors for debugging
- Use consistent HTTP status codes
- Return valid JSON responses

❌ **DON'T:**

- Expose stack traces to client
- Use English in user messages
- Return different response formats
- Throw generic Error objects
- Leave try-catch blocks empty
- Crash the process on error

---

## File Locations

- **Base Classes:** `lib/errors/AppError.ts`
- **Create Preference Endpoint:** `app/api/checkout/create-preference/route.ts`
- **Webhook Endpoint:** `app/api/checkout/webhook/route.ts`
- **Rate Limit Endpoint:** `app/api/rate-limit/route.ts`

---

**Last Updated:** 2025-02-05  
**Status:** ✅ All patterns verified with 81/81 critical tests passing
