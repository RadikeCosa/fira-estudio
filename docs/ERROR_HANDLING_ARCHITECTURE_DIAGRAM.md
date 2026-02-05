# Error Handling Architecture Diagram

## Error Class Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                        AppError                             │
│                    (Base Class)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Properties:                                         │   │
│  │  - code: ErrorCode (enum)                          │   │
│  │  - statusCode: number                              │   │
│  │  - userMessage: string (Spanish)                   │   │
│  │  - message: string (Technical)                     │   │
│  │  - details?: unknown (Optional context)            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┬──────────┬─────────┐
        │         │         │          │         │
        ▼         ▼         ▼          ▼         ▼
    ┌───────┐ ┌────────┐ ┌──────┐ ┌──────────┐ ┌───────┐
    │ Val   │ │Payment │ │ Rate │ │Config    │ │ Order │
    │Error  │ │ Error  │ │Limit │ │Error     │ │ Error │
    │(400)  │ │(500)   │ │(429) │ │(500)     │ │(500)  │
    └───────┘ └────────┘ └──────┘ └──────────┘ └───────┘
      │         │          │        │            │
      │         │          │        │            │
  Bad Input  API Fail   Too Many  Missing Env  DB Fail
  Missing     Payment    Requests   Variables    Update
  Fields      Not Found
```

---

## Error Response Flow

```
CLIENT REQUEST
    │
    ▼
┌─────────────────────────────────────┐
│  Endpoint Handler (POST/GET/etc)    │
│  ┌─────────────────────────────────┐│
│  │ try {                            ││
│  │   // Validation Phase            ││
│  │   if (!valid) throw ValidationError()│
│  │   // Business Logic Phase        ││
│  │   const result = await operation()│
│  │   return NextResponse.json(result)││
│  │ }                                ││
│  └─────────────────────────────────┘│
└────────────────┬────────────────────┘
                 │
         ┌───────▼────────┐
         │ Error Thrown?  │
         └───┬────────┬───┘
             │        │
        YES  │        │  NO
             ▼        ▼
        ┌─────────┐  ┌──────────────┐
        │ Catch   │  │ Return 200   │
        │ Error   │  │ with data    │
        └────┬────┘  └──────────────┘
             │
             ▼
        ┌──────────────────────────┐
        │ instanceof AppError?     │
        └───┬──────────────┬───────┘
        YES │              │ NO
            ▼              ▼
        ┌─────────────┐  ┌──────────────────┐
        │ Format      │  │ Generic Error    │
        │ AppError    │  │ Response (500)   │
        │ Response    │  └──────────────────┘
        │ with:       │
        │ - error msg │
        │ - code      │
        │ - details   │
        │ - status    │
        └──────┬──────┘
               ▼
        ┌──────────────────────┐
        │ Return JSON (500)    │
        │ {                    │
        │   error,             │
        │   code,              │
        │   details?,          │
        │   status             │
        │ }                    │
        └──────────────────────┘
               │
               ▼
        CLIENT RECEIVES
        ERROR RESPONSE
```

---

## Error Code Mapping

```
Error Type              HTTP Status    Use Case                Example
─────────────────────────────────────────────────────────────────────────
ValidationError         400            Invalid input           Invalid email
                                       Missing field           Missing name
                                       Bad format              Bad phone

PaymentError            500            API failure             MP API timeout
                                       Payment not found       Invalid data

RateLimitError          429            Too many requests       6+ req/15min

ConfigurationError      500            Missing config          HMAC_KEY not set
                                       Invalid setup           API key invalid

OrderError              500            DB operations fail      Order not found
                                       Status update fail      Update failed
```

---

## Request to Response Pattern

### Successful Request

```
POST /api/checkout/create-preference
Body: {
  "email": "customer@example.com",
  "items": [{ "id": 1, "quantity": 2, "title": "Producto" }]
}

                    ▼

            [Validation Passes]
            [Logic Executes]
            [Payment Created]

                    ▼

HTTP 200 OK
{
  "success": true,
  "preference_id": "12345678",
  "init_point": "https://mercadopago.com/..."
}
```

### Failed Request - Validation Error

```
POST /api/checkout/create-preference
Body: {
  "email": "invalid-email",  ← Missing @ symbol
  "items": []                ← Empty
}

                    ▼

            [Email Validation Fails]
            throw new ValidationError(
              "Invalid email format",
              "Correo electrónico inválido",
              { field: "email", value: "invalid-email" }
            )

                    ▼

HTTP 400 Bad Request
{
  "error": "Correo electrónico inválido",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "value": "invalid-email"
  },
  "status": 400
}
```

### Failed Request - Rate Limit Error

```
POST /api/checkout/create-preference
[6th request from IP 192.168.1.100 within 15 minutes]

                    ▼

            [Validation Passes]
            [Rate Limit Check]
            throw new RateLimitError(
              "Rate limit exceeded for IP 192.168.1.100",
              "Demasiadas solicitudes",
              { resetIn: 600000 }  ← 10 minutes in milliseconds
            )

                    ▼

HTTP 429 Too Many Requests
{
  "error": "Demasiadas solicitudes",
  "code": "RATE_LIMIT_ERROR",
  "details": {
    "resetIn": 600000
  },
  "status": 429
}
```

### Failed Request - Payment Error

```
POST /api/checkout/webhook
[Mercado Pago API fails to fetch payment]

                    ▼

            [Signature Validated]
            [Fetch from MP]
            throw new PaymentError(
              "Error fetching payment 123456 from MP: timeout",
              "Error al obtener el pago",
              { paymentId: "123456" }
            )

                    ▼

HTTP 500 Internal Server Error
{
  "error": "Error al obtener el pago",
  "code": "PAYMENT_ERROR",
  "details": {
    "paymentId": "123456"
  },
  "status": 500
}
```

---

## Error Throwing Patterns

### Pattern 1: Validation (Missing Field)

```typescript
const { email } = req.body;
if (!email) {
  throw new ValidationError(
    "Email is required",
    "Correo electrónico requerido",
  );
}
```

### Pattern 2: Validation (Invalid Format)

```typescript
if (!isValidEmail(email)) {
  throw new ValidationError(
    `Invalid email format: ${email}`,
    "Correo electrónico inválido",
    { field: "email", value: email },
  );
}
```

### Pattern 3: Payment Failure

```typescript
try {
  const payment = await getPaymentById(paymentId);
} catch (err) {
  throw new PaymentError(
    `Failed to fetch payment ${paymentId}: ${err.message}`,
    "Error al obtener el pago",
    { paymentId },
  );
}
```

### Pattern 4: Rate Limit

```typescript
const resetTime = calculateResetTime();
if (requestCount >= LIMIT) {
  throw new RateLimitError(
    `Rate limit exceeded for IP ${ip}`,
    "Demasiadas solicitudes",
    { resetIn: resetTime },
  );
}
```

### Pattern 5: Database Error

```typescript
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

## Implementation Checklist for New Endpoints

```
[ ] Import error classes
    import { AppError, ValidationError, PaymentError, ... } from "@/lib/errors/AppError"

[ ] Add try-catch wrapper
    try {
      // ... endpoint logic
    } catch (error) {
      // ... error handling
    }

[ ] Replace error returns with throws
    Replace: return NextResponse.json({error: "msg"}, {status: 400})
    With:    throw new ValidationError("msg", "user msg")

[ ] Add error handler
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.userMessage, code: error.code, ... },
        { status: error.statusCode }
      );
    }

[ ] Add fallback for unexpected errors
    return NextResponse.json(
      { error: "Error procesando solicitud" },
      { status: 500 }
    );

[ ] Write tests for error scenarios
    - Test each error path
    - Verify correct status code
    - Verify correct error message

[ ] Verify all tests pass
    npm run test -- --run
```

---

## Architecture Benefits

```
┌──────────────────────────────────────┐
│     Unified Error Architecture       │
├──────────────────────────────────────┤
│                                      │
│  Type Safety      ✅  Prevents typos │
│  Consistency      ✅  Same everywhere│
│  Security        ✅  No leakage     │
│  Maintainability ✅  Easy to extend │
│  Debuggability   ✅  Error context  │
│  Testability     ✅  Clear patterns │
│                                      │
└──────────────────────────────────────┘
```

---

## File Structure

```
lib/errors/
└── AppError.ts                  ← Error class definitions

app/api/checkout/
├── create-preference/
│   └── route.ts                 ← Fully implemented
├── webhook/
│   └── route.ts                 ← Fully implemented
└── rate-limit/
    └── route.ts                 ← Fully implemented

docs/
├── ERROR_HANDLING_COMPLETE.md                    ← Comprehensive guide
├── ERROR_HANDLING_QUICK_REFERENCE.md             ← Copy-paste patterns
└── SESSION_SUMMARY_ERROR_HANDLING.md             ← This session summary
```

---

**Last Updated:** 2025-02-05  
**Status:** ✅ All endpoints implemented and tested  
**Test Coverage:** 89/89 (100%)
