# Manual Testing Guide for Webhook External Reference Fix

## Overview
This document describes how to manually test the fix for webhook processing with `external_reference` format "email|uuid".

## Background
- **Issue**: Webhook processor was trying to use the full `external_reference` (format: `email|uuid`) as a UUID for database queries, causing PostgreSQL UUID validation errors
- **Fix**: Extract the UUID part from the `external_reference` before using it in database queries
- **Error Before Fix**: `invalid input syntax for type uuid: "ramirocosa@gmail.com|16e2136a-ef59-41e0-ac54-6e1e025f5497"`

## Test Scenarios

### Scenario 1: Normal Webhook Processing (email|uuid format)

**Setup:**
1. Create a test order with `external_reference` = "test@example.com|550e8400-e29b-41d4-a716-446655440000"
2. Trigger webhook from Mercado Pago with this payment

**Expected Behavior:**
- Webhook receives the event
- Logs show: `[WebhookQueue] Extracted order_id from external_reference: test@example.com|550e8400-e29b-41d4-a716-446655440000 -> 550e8400-e29b-41d4-a716-446655440000`
- Order with ID `550e8400-e29b-41d4-a716-446655440000` is found and updated
- Payment log is saved with correct `order_id`
- No UUID validation errors

**How to Verify:**
```sql
-- Check payment_logs table
SELECT order_id, mercadopago_payment_id, status, created_at 
FROM payment_logs 
WHERE order_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC;

-- Check orders table
SELECT id, status, mercadopago_payment_id, updated_at 
FROM orders 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

### Scenario 2: Legacy Format (UUID only, no pipe)

**Setup:**
1. Create a test order with `external_reference` = "550e8400-e29b-41d4-a716-446655440000" (no email prefix)
2. Trigger webhook

**Expected Behavior:**
- No extraction needed (no pipe character found)
- Uses the full string as `orderId`
- Order is processed normally
- No errors

**Verification:**
Same SQL queries as Scenario 1

### Scenario 3: Approved Payment - Stock Decrement & Cart Clear

**Setup:**
1. Create order with items (e.g., 2 units of variation A, 3 units of variation B)
2. Note initial stock values
3. Trigger webhook with status "approved"

**Expected Behavior:**
- Order status updated to "approved"
- Stock decremented for each variation:
  - Variation A: stock reduced by 2
  - Variation B: stock reduced by 3
- Cart cleared (all items removed)
- Logs show: 
  - `[WebhookQueue] Stock decremented for order: {orderId}`
  - `[CartRepository] Stock decremented: variacion={id}, old={oldStock}, new={newStock}`
  - `[WebhookQueue] Cart cleared: cart_id={cartId}`

**How to Verify:**
```sql
-- Check order status
SELECT id, status, mercadopago_payment_id 
FROM orders 
WHERE id = '{orderId}';

-- Check stock changes
SELECT id, sku, stock 
FROM variaciones 
WHERE id IN ('{variationA_id}', '{variationB_id}');

-- Check cart is empty
SELECT * FROM cart_items 
WHERE cart_id = '{cartId}';
```

### Scenario 4: Duplicate Webhook Events (Idempotency)

**Setup:**
1. Send webhook event for payment ID "12345678"
2. Send the same webhook event again (duplicate)

**Expected Behavior:**
- First request: Event queued normally
- Second request: 
  - Catches constraint violation (error code '23505')
  - Logs: `[WebhookQueue] Event already exists (idempotent): payment_id=12345678`
  - Returns existing event ID
  - No error thrown

**How to Verify:**
```sql
-- Should only have one entry per payment_id
SELECT payment_id, COUNT(*) as count 
FROM webhook_queue 
WHERE payment_id = '12345678'
GROUP BY payment_id;
```

### Scenario 5: Multiple Pipe Separators (Edge Case)

**Setup:**
1. Create order with `external_reference` = "user@test.com|extra|550e8400-e29b-41d4-a716-446655440000"
2. Trigger webhook

**Expected Behavior:**
- Extraction logic takes the **last part** after splitting by pipe
- `orderId` = "550e8400-e29b-41d4-a716-446655440000"
- Order processed successfully

**Verification:**
Check logs for: `[WebhookQueue] Extracted order_id from external_reference: user@test.com|extra|550e8400-e29b-41d4-a716-446655440000 -> 550e8400-e29b-41d4-a716-446655440000`

### Scenario 6: Empty String After Pipe (Error Handling)

**Setup:**
1. Create malformed `external_reference` = "test@example.com|" (empty after pipe)
2. Trigger webhook

**Expected Behavior:**
- Extraction produces empty string for `orderId`
- Validation fails with error: `No order_id found in external_reference: test@example.com|`
- Event moved to dead letter queue after retries
- No database corruption

**How to Verify:**
```sql
-- Check dead letter queue
SELECT * FROM webhook_dead_letter 
WHERE webhook_data->>'external_reference' = 'test@example.com|';
```

## Log Monitoring

Key log messages to watch for:

### Success Indicators:
```
[WebhookQueue] Extracted order_id from external_reference: {fullRef} -> {uuid}
[WebhookQueue] Event processed successfully: payment_id={id}, order_id={uuid}, status={status}
[WebhookQueue] Stock decremented for order: {uuid}
[WebhookQueue] Cart cleared: cart_id={cartId}
[WebhookQueue] Completed in {ms}ms: payment_id={id}
```

### Error/Warning Indicators:
```
[WebhookQueue] Event already exists (idempotent): payment_id={id}
[WebhookQueue] No order_id found in external_reference: {ref}
[WebhookQueue] Error processing event: ...
[WebhookQueue] Post-approval actions failed: ...
```

## Testing Checklist

- [ ] Test Scenario 1: Normal email|uuid format
- [ ] Test Scenario 2: Legacy UUID-only format
- [ ] Test Scenario 3: Approved payment with stock/cart changes
- [ ] Test Scenario 4: Duplicate webhook handling
- [ ] Test Scenario 5: Multiple pipe separators
- [ ] Test Scenario 6: Empty string error handling
- [ ] Verify no PostgreSQL UUID validation errors in logs
- [ ] Verify payment logs are created with correct order_id
- [ ] Verify order status updates work correctly
- [ ] Verify stock decrements on approved payments
- [ ] Verify cart clearing on approved payments
- [ ] Monitor webhook_queue and webhook_dead_letter tables

## Rollback Plan

If issues are detected:

1. **Immediate**: Revert the PR to restore previous behavior
2. **Short-term**: Fix `external_reference` format in checkout to use UUID only
3. **Long-term**: Migrate existing orders to store email separately

## Related Files

- `lib/webhooks/queue-processor.ts` - Main fix implementation
- `lib/webhooks/queue-processor.test.ts` - Unit tests
- `app/api/checkout/create-preference/route.ts` - Where external_reference is created
- `lib/repositories/cart.repository.ts` - Database operations
