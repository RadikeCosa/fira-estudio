/**
 * Script para testear el envío de email de confirmación
 * Ejecutar con: npx tsx scripts/test-email.ts
 */
import { Resend } from "resend";
import { render } from "@react-email/components";
import { OrderConfirmationEmail } from "../lib/emails/OrderConfirmationEmail";

async function main() {
  const RESEND_API_KEY = "re_QEsbPTL7_D5t7xfM9GBFjwU2oukek1W95";
  const resend = new Resend(RESEND_API_KEY);

  // Datos de prueba (los mismos PreviewProps del template)
  const order = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    order_number: "FS-2025-001",
    cart_id: "cart-123",
    customer_email: "ramirocosa@gmail.com", // ← Cambiá esto por tu email real
    customer_phone: "+54 9 11 1234-5678",
    customer_name: "María González",
    total_amount: 45000,
    status: "approved" as const,
    mercadopago_preference_id: "pref-123",
    mercadopago_payment_id: "pay-123",
    payment_method: "Tarjeta de crédito",
    shipping_address: "Av. Corrientes 1234, CABA, Buenos Aires",
    notes: "Entregar en horario de mañana",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: [
      {
        id: "item-1",
        order_id: "123e4567-e89b-12d3-a456-426614174000",
        variacion_id: "var-1",
        product_name: "Mantel Floral",
        quantity: 2,
        unit_price: 15000,
        subtotal: 30000,
        variacion_size: "150x200cm",
        variacion_color: "Rojo",
        sku: "MFL-150-R",
        created_at: new Date().toISOString(),
      },
      {
        id: "item-2",
        order_id: "123e4567-e89b-12d3-a456-426614174000",
        variacion_id: "var-2",
        product_name: "Servilletas Lisas",
        quantity: 4,
        unit_price: 3750,
        subtotal: 15000,
        variacion_size: "40x40cm",
        variacion_color: "Azul",
        sku: "SER-40-A",
        created_at: new Date().toISOString(),
      },
    ],
  };

  console.log("🔄 Renderizando template...");
  const emailHtml = await render(OrderConfirmationEmail({ order }));

  console.log("📧 Enviando email de prueba...");
  const { data, error } = await resend.emails.send({
    from: "Fira Estudio <onboarding@resend.dev>",
    to: order.customer_email,
    subject: `¡Pedido confirmado! #${order.order_number} - Fira Estudio`,
    html: emailHtml,
  });

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Email enviado!", data);
  }
}

main();
