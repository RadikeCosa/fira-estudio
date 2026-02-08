import { Metadata } from "next";
import { ShoppingCart } from "@/components/carrito/ShoppingCart";

import { LAYOUT, SPACING, TYPOGRAPHY } from "@/lib/design/tokens";
import { combine } from "@/lib/design/tokens";
import { CARRITO_CONTENT } from "@/lib/content/carrito";

export const metadata: Metadata = {
  title: CARRITO_CONTENT.page.title,
  description: CARRITO_CONTENT.page.description,
};

export default function CarritoPage() {
  return (
    <div className={combine("min-h-screen", "bg-background")}>
      {" "}
      {/* bg-background: token, min-h-screen: layout */}
      <div className={combine(LAYOUT.container.maxW4xl, SPACING.page)}>
        <h1 className={combine(TYPOGRAPHY.heading.section, SPACING.section)}>
          {CARRITO_CONTENT.page.title}
        </h1>
        <ShoppingCart />
      </div>
    </div>
  );
}
