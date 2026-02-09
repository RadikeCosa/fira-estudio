# Order Confirmation Email

This document describes the order confirmation email feature for Fira Estudio.

## Overview

When a payment is successfully approved through Mercado Pago, the system automatically sends a confirmation email to the customer containing:

- Order number and date
- Customer information (name, shipping address, phone)
- List of purchased items (with sizes, colors, quantities, prices)
- Total amount
- Payment method
- Order notes (if any)

## Architecture

### Flow

```
Mercado Pago Payment Approved
    ↓
Webhook Received (app/api/checkout/webhook/route.ts)
    ↓
Event Enqueued (webhook_queue table)
    ↓
Queue Processor (lib/webhooks/queue-processor.ts)
    ↓
Order Status Updated → Stock Decremented → Cart Cleared
    ↓
Email Sent (lib/emails/send-order-confirmation.ts)
```

### Key Files

1. **`lib/emails/OrderConfirmationEmail.tsx`**
   - React Email component template
   - Styled in Spanish (Argentina)
   - Formats prices in ARS
   - Responsive design

2. **`lib/emails/send-order-confirmation.ts`**
   - Service that sends the email via Resend
   - Fetches order with items from database
   - Renders React Email template
   - Non-blocking error handling

3. **`lib/webhooks/queue-processor.ts`**
   - Integrates email sending after payment approval
   - Called after stock decrement and cart clear
   - Wrapped in try-catch to prevent webhook failures

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Resend API Key (required)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Optional: Custom sender email
# Must be verified in Resend dashboard
# Default: "Fira Estudio <no-reply@firaestudio.com>"
RESEND_FROM_EMAIL=Fira Estudio <noreply@tudominio.com>
```

### Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (recommended for production)
3. Generate API key from dashboard
4. Add `RESEND_API_KEY` to environment variables

**For development/testing:**
- Resend allows sending to your own email without domain verification
- Use your email as `to` address for testing

**For production:**
- Verify your domain in Resend dashboard
- Update `RESEND_FROM_EMAIL` with your domain email

## Email Content (Spanish - Argentina)

The email includes:

### Header
- **Logo/Brand:** "Fira Estudio" heading

### Confirmation Message
- **Title:** "¡Tu compra fue confirmada!"
- **Subtitle:** "Tu pago fue procesado correctamente. Te contactaremos para coordinar la entrega."

### Order Information
- Order number
- Order date

### Shipping Information
- Customer name
- Shipping address (if provided)
- Phone number (if provided)
- Email address

### Product Details
For each item:
- Product name
- Size and color
- Quantity
- Unit price
- Subtotal

### Total
- **Total amount** in ARS

### Optional Sections
- Payment method (if available)
- Order notes (if provided)

### Help Section
- Contact email: contacto@firaestudio.com

### Footer
- Copyright notice

## Error Handling

The email sending is **non-blocking** to prevent webhook failures:

```typescript
try {
  await sendOrderConfirmationEmail(orderId);
  console.log(`[WebhookQueue] Confirmation email sent for order: ${orderId}`);
} catch (emailError) {
  // Don't fail the webhook if email fails - payment already confirmed
  console.error(`[WebhookQueue] Failed to send confirmation email:`, emailError);
}
```

**Why non-blocking?**
- Payment has already been confirmed
- Order status already updated
- Stock already decremented
- Cart already cleared
- Email failure shouldn't affect order processing

**Error scenarios handled:**
- Missing `RESEND_API_KEY` (logs warning, skips send)
- Order not found (logs error, returns)
- Missing customer email (logs error, returns)
- No order items (logs error, returns)
- Resend API errors (logs error, returns)

All errors are logged but don't throw to prevent webhook failures.

## Testing

### Preview Email Template

React Email provides preview functionality:

```bash
# Install React Email CLI (optional)
npm install -g react-email

# Preview emails in browser
npx react-email dev

# Or add to package.json:
"scripts": {
  "email:dev": "react-email dev"
}
```

Then open: `http://localhost:3000` and select `OrderConfirmationEmail`.

### Test Sending

1. Create test order in your database
2. Ensure `RESEND_API_KEY` is configured
3. Call the service directly:

```typescript
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";

// In a test script or API route
await sendOrderConfirmationEmail("order-uuid-here");
```

### Monitor Logs

Check webhook processor logs:

```bash
# Success log
[WebhookQueue] Confirmation email sent for order: <orderId>
[Email] Confirmation email sent successfully: { orderId, orderNumber, customerEmail, emailId }

# Error logs
[Email] RESEND_API_KEY not configured - skipping email send
[Email] Order not found: <orderId>
[Email] No customer email for order: <orderId>
[Email] No order items for order: <orderId>
[Email] Failed to send confirmation email: { orderId, error }
[WebhookQueue] Failed to send confirmation email: <error>
```

## Customization

### Change Email Content

Edit `lib/emails/OrderConfirmationEmail.tsx`:

```tsx
// Update text
<Heading as="h1" style={h1}>
  ¡Tu compra fue confirmada! {/* Change this */}
</Heading>

// Update styles
const h1 = {
  color: "#1a1a1a", // Change color
  fontSize: "28px", // Change size
  // ...
};
```

### Change Sender Email

Update `.env.local`:

```bash
RESEND_FROM_EMAIL=Fira Estudio <hola@tudominio.com>
```

### Add Logo Image

1. Host logo image (e.g., in `/public/logo.png` or external CDN)
2. Update template:

```tsx
import { Img } from "@react-email/components";

// Replace text heading with image
<Section style={header}>
  <Img
    src="https://tudominio.com/logo.png"
    alt="Fira Estudio"
    width="150"
    height="50"
  />
</Section>
```

## Dependencies

- **[resend](https://www.npmjs.com/package/resend)**: Email sending service
- **[@react-email/components](https://www.npmjs.com/package/@react-email/components)**: React Email component library

## Troubleshooting

### Email not sending

1. **Check API key:**
   ```bash
   # In your environment
   echo $RESEND_API_KEY
   ```

2. **Check logs:**
   - Look for error logs in webhook processor
   - Check Resend dashboard for API errors

3. **Verify order data:**
   - Ensure order has `customer_email`
   - Ensure order has `order_items`

### Email in spam

1. **Verify domain in Resend:**
   - Add SPF, DKIM, DMARC records
   - Follow Resend's domain verification guide

2. **Use professional sender address:**
   - Use `noreply@tudominio.com` instead of `no-reply@firaestudio.com`

3. **Warm up domain:**
   - Start with low volume
   - Gradually increase sending

### Email not rendering correctly

1. **Test in multiple clients:**
   - Gmail, Outlook, Apple Mail, etc.
   - Use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) for testing

2. **Keep styles inline:**
   - React Email handles this automatically
   - Avoid external stylesheets

3. **Test responsive design:**
   - Email template is responsive
   - Test on mobile devices

## Future Enhancements

Potential improvements:

- [ ] Add order tracking link
- [ ] Include estimated delivery date
- [ ] Add product images to email
- [ ] Support for PDF invoice attachment
- [ ] Customer satisfaction survey link
- [ ] Email preferences/unsubscribe link
- [ ] Multi-language support (if expanding beyond Argentina)
- [ ] Order status update emails (shipped, delivered)
- [ ] Abandoned cart recovery emails

## Support

For issues or questions:
- Email: contacto@firaestudio.com
- Check webhook logs for error details
- Review Resend dashboard for delivery status
