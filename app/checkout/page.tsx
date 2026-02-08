import { Metadata } from "next";
import { CheckoutForm } from "@/components/carrito/CheckoutForm";
import { CHECKOUT_CONTENT } from "@/lib/content/checkout";
import { LAYOUT, SPACING, TYPOGRAPHY } from "@/lib/design/tokens";
import { combine } from "@/lib/design/tokens";

export const metadata: Metadata = {
  title: CHECKOUT_CONTENT.page.title,
  description: CHECKOUT_CONTENT.page.description,
};

export default function CheckoutPage() {
  return (
    <div className={combine("min-h-screen", "bg-background")}>
      {" "}
      {/* bg-background: token, min-h-screen: layout */}
      <div className={combine(LAYOUT.container.maxW7xl, SPACING.page)}>
        <h1 className={combine(TYPOGRAPHY.heading.section, SPACING.section)}>
          {CHECKOUT_CONTENT.form.title}
        </h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
