/**
 * Order Confirmation Email Template
 * Inspired by professional e-commerce receipt emails
 * Language: Spanish (Argentina)
 */

import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import type { Order, OrderItem } from "@/lib/types";

interface OrderConfirmationEmailProps {
  order: Order & { order_items: OrderItem[] };
}

export const OrderConfirmationEmail = ({
  order,
}: OrderConfirmationEmailProps) => {
  const orderItems = order.order_items || [];
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Html>
      <Head />
      <Preview>¡Tu pedido #{order.order_number} fue confirmado!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header / Logo */}
          <Section style={header}>
            <Heading style={heading}>Fira Estudio</Heading>
          </Section>

          {/* Confirmation Message */}
          <Section style={messageSection}>
            <Heading as="h1" style={h1}>
              ¡Tu compra fue confirmada!
            </Heading>
            <Text style={subtitle}>
              Tu pago fue procesado correctamente. Te contactaremos para
              coordinar la entrega.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order Details Section */}
          <Section style={informationSection}>
            <Row>
              <Column>
                <Text style={informationTitle}>Número de orden</Text>
                <Text style={informationValue}>#{order.order_number}</Text>
              </Column>
              <Column>
                <Text style={informationTitle}>Fecha de pedido</Text>
                <Text style={informationValue}>
                  {formatDate(order.created_at)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping Information */}
          <Section style={informationSection}>
            <Heading as="h2" style={h2}>
              Datos de envío
            </Heading>
            <Text style={informationValue}>{order.customer_name}</Text>
            {order.shipping_address && (
              <Text style={informationDetail}>{order.shipping_address}</Text>
            )}
            {order.customer_phone && (
              <Text style={informationDetail}>Tel: {order.customer_phone}</Text>
            )}
            <Text style={informationDetail}>{order.customer_email}</Text>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section style={productsSection}>
            <Heading as="h2" style={h2}>
              Detalle de tu pedido
            </Heading>

            {orderItems.map((item) => (
              <Section key={item.id} style={productRow}>
                <Row>
                  <Column style={productColumn}>
                    <Text style={productName}>{item.product_name}</Text>
                    <Text style={productDetails}>
                      Tamaño: {item.variacion_size} • Color:{" "}
                      {item.variacion_color}
                    </Text>
                    <Text style={productDetails}>
                      Cantidad: {item.quantity}
                    </Text>
                  </Column>
                  <Column style={priceColumn} align="right">
                    <Text style={productPrice}>
                      {formatter.format(item.unit_price)}
                    </Text>
                    <Text style={productSubtotal}>
                      Subtotal: {formatter.format(item.subtotal)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Hr style={divider} />

            {/* Total */}
            <Row style={totalRow}>
              <Column align="right">
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column align="right" style={totalAmountColumn}>
                <Text style={totalAmount}>
                  {formatter.format(order.total_amount)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Payment Method (if available) */}
          {order.payment_method && (
            <>
              <Section style={informationSection}>
                <Text style={informationTitle}>Método de pago</Text>
                <Text style={informationValue}>{order.payment_method}</Text>
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Notes (if available) */}
          {order.notes && (
            <>
              <Section style={informationSection}>
                <Text style={informationTitle}>Notas del pedido</Text>
                <Text style={informationDetail}>{order.notes}</Text>
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Help Section */}
          <Section style={helpSection}>
            <Text style={helpText}>
              ¿Necesitás ayuda con tu pedido? Escribinos a{" "}
              <Link href="mailto:contacto@firaestudio.com" style={link}>
                contacto@firaestudio.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Fira Estudio. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

OrderConfirmationEmail.PreviewProps = {
  order: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    order_number: "FS-2025-001",
    cart_id: "cart-123",
    customer_email: "cliente@ejemplo.com",
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
  },
} as OrderConfirmationEmailProps;

export default OrderConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#f8f8f8",
};

const heading = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const messageSection = {
  padding: "32px 20px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 16px",
};

const subtitle = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0",
};

const divider = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const informationSection = {
  padding: "0 20px",
};

const informationTitle = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const informationValue = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const informationDetail = {
  color: "#666666",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "4px 0",
};

const productsSection = {
  padding: "0 20px",
};

const productRow = {
  marginBottom: "16px",
};

const productColumn = {
  verticalAlign: "top" as const,
  paddingRight: "20px",
};

const priceColumn = {
  verticalAlign: "top" as const,
  width: "30%",
};

const productName = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const productDetails = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "2px 0",
};

const productPrice = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 4px",
};

const productSubtotal = {
  color: "#666666",
  fontSize: "14px",
  margin: "0",
};

const totalRow = {
  padding: "16px 0",
};

const totalLabel = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  paddingRight: "20px",
};

const totalAmountColumn = {
  width: "30%",
};

const totalAmount = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const helpSection = {
  padding: "24px 20px",
  textAlign: "center" as const,
  backgroundColor: "#f8f8f8",
};

const helpText = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const link = {
  color: "#1a1a1a",
  textDecoration: "underline",
};

const footer = {
  padding: "24px 20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#999999",
  fontSize: "12px",
  margin: "0",
};
