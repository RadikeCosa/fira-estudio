import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { CartRepository } from "@/lib/repositories/cart.repository";
import type { Order, OrderItem } from "@/lib/types";
import { CHECKOUT_CONTENT } from "@/lib/content/checkout";
import { BUTTONS, TYPOGRAPHY } from "@/lib/design/tokens";
import { combine } from "@/lib/design/tokens";
import { formatPrice } from "@/lib/utils";

const content = CHECKOUT_CONTENT.success;

export const metadata: Metadata = {
  title: content.pageTitle,
  description: content.subtitle,
};

function extractOrderId(externalReference: string): string | null {
  const parts = externalReference.split("|");
  return parts.length >= 2 ? parts[parts.length - 1] : null;
}

/** Estado de error reutilizable para los casos previos al happy path */
function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>
        <h1 className={TYPOGRAPHY.heading.section}>{title}</h1>
        <p className={TYPOGRAPHY.body.muted}>{message}</p>
        <div className="flex gap-3">
          <Link href="/productos" className={combine(BUTTONS.secondary, "flex-1 px-6 py-3")}>
            {content.ctaSecondary}
          </Link>
          <Link href="/" className={combine(BUTTONS.primary, "flex-1 px-6 py-3")}>
            {content.ctaPrimary}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const externalReference = params.external_reference as string | undefined;

  if (!externalReference) {
    return (
      <ErrorState
        title={content.orderNotFound}
        message={content.orderNotFoundDescription}
      />
    );
  }

  const orderId = extractOrderId(externalReference);

  if (!orderId) {
    return (
      <ErrorState
        title={content.invalidReference}
        message={content.invalidReferenceDescription}
      />
    );
  }

  let order: (Order & { order_items: OrderItem[] }) | null = null;

  try {
    const repo = new CartRepository();
    order = await repo.getOrderWithItems(orderId);
  } catch (error) {
    console.error("[Success] Error fetching order:", error);
  }

  if (!order) {
    return (
      <ErrorState
        title={content.orderNotFound}
        message={content.orderNotFoundDescription}
      />
    );
  }

  if (order.status !== "approved" && order.status !== "paid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-100 p-4">
              <XCircle className="w-16 h-16 text-yellow-600" />
            </div>
          </div>
          <h1 className={TYPOGRAPHY.heading.section}>{content.pendingTitle}</h1>
          <p className={TYPOGRAPHY.body.muted}>{content.pendingMessage}</p>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-left">
            <p className="font-medium mb-2">{content.orderIdLabel}</p>
            <p className="font-mono text-xs">{order.order_number}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/productos" className={combine(BUTTONS.secondary, "flex-1 px-6 py-3")}>
              {content.ctaSecondary}
            </Link>
            <Link href="/" className={combine(BUTTONS.primary, "flex-1 px-6 py-3")}>
              {content.ctaPrimary}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className={TYPOGRAPHY.heading.section}>{content.title}</h1>
          <p className={TYPOGRAPHY.body.muted}>{content.subtitle}</p>
        </div>

        {/* Número de orden */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <p className={combine(TYPOGRAPHY.body.muted, "mb-2")}>{content.orderIdLabel}</p>
          <p className="text-2xl font-bold font-mono">{order.order_number}</p>
        </div>

        {/* Resumen */}
        <div className="bg-white border border-border rounded-lg p-6 space-y-4">
          <h2 className={TYPOGRAPHY.heading.subsection}>{content.orderSummaryTitle}</h2>

          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className={TYPOGRAPHY.body.muted}>
                    {item.variacion_size} • {item.variacion_color}
                  </p>
                  <p className={TYPOGRAPHY.body.muted}>
                    {content.quantityLabel}: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.subtotal)}</p>
                  <p className={TYPOGRAPHY.body.muted}>
                    {formatPrice(item.unit_price)} {content.unitLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 flex justify-between items-center">
            <p className="text-lg font-semibold">{content.totalLabel}</p>
            <p className="text-2xl font-bold">{formatPrice(order.total_amount)}</p>
          </div>
        </div>

        {/* Qué sigue */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm">
          <p className="font-medium">{content.whatNextTitle}</p>
          <ul className="space-y-1 text-muted-foreground">
            {content.nextSteps.map((step, i) => (
              <li key={i}>• {step}</li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link href="/productos" className={combine(BUTTONS.secondary, "flex-1 px-6 py-3 text-center")}>
            {content.ctaSecondary}
          </Link>
          <Link href="/" className={combine(BUTTONS.primary, "flex-1 px-6 py-3 text-center")}>
            {content.ctaPrimary}
          </Link>
        </div>

      </div>
    </div>
  );
}