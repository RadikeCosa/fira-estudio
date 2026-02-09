/**
 * Order Confirmation Email Service
 * Sends confirmation emails using Resend after successful payment
 */

import { Resend } from "resend";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { OrderConfirmationEmail } from "./OrderConfirmationEmail";
import { render } from "@react-email/components";

// Lazy-initialized Resend client to avoid build-time errors
// The client is only created when actually needed (at runtime),
// not during Next.js build when env vars may not be available
let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/**
 * Send order confirmation email to customer
 * Non-blocking - errors are logged but don't throw to avoid failing the webhook
 *
 * @param orderId - The order ID to send confirmation for
 * @returns Promise<void>
 */
export async function sendOrderConfirmationEmail(
  orderId: string,
): Promise<void> {
  try {
    // Get Resend client (will be null if API key not configured)
    const resend = getResendClient();
    if (!resend) {
      console.error(
        "[Email] RESEND_API_KEY not configured - skipping email send",
      );
      return;
    }

    // Fetch order with items
    const cartRepository = new CartRepository();
    const order = await cartRepository.getOrderWithItems(orderId);

    if (!order) {
      console.error(`[Email] Order not found: ${orderId}`);
      return;
    }

    // Validate order has required data
    if (!order.customer_email) {
      console.error(`[Email] No customer email for order: ${orderId}`);
      return;
    }

    if (!order.order_items || order.order_items.length === 0) {
      console.error(`[Email] No order items for order: ${orderId}`);
      return;
    }

    // Prepare email
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Fira Estudio <no-reply@firaestudio.com>";
    const subject = `¡Pedido confirmado! #${order.order_number} - Fira Estudio`;

    // Render email HTML
    const emailHtml = await render(OrderConfirmationEmail({ order }));

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: order.customer_email,
      subject: subject,
      html: emailHtml,
    });

    if (error) {
      console.error(`[Email] Failed to send confirmation email:`, {
        orderId,
        error: error.message,
      });
      return;
    }

    console.log(`[Email] Confirmation email sent successfully:`, {
      orderId,
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      emailId: data?.id,
    });
  } catch (error) {
    // Catch all errors to prevent webhook failure
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Email] Unexpected error sending confirmation:`, {
      orderId,
      error: errorMsg,
    });
  }
}
