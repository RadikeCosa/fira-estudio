import { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { CHECKOUT_CONTENT } from "@/lib/content/checkout";
import { BUTTONS, TYPOGRAPHY } from "@/lib/design/tokens";
import { combine } from "@/lib/design/tokens";

export const metadata: Metadata = {
  title: CHECKOUT_CONTENT.failure.title,
  description: CHECKOUT_CONTENT.failure.description,
};

export default function FailurePage() {
  return (
    <div
      className={combine(
        "min-h-screen",
        "bg-background",
        "flex items-center justify-center px-4",
      )}
    >
      {" "}
      {/* bg-background: token */}
      <div className={combine("max-w-md w-full text-center space-y-6")}>
        {" "}
        {/* layout helpers */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>
        <h1 className={combine(TYPOGRAPHY.heading.section)}>
          {CHECKOUT_CONTENT.failure.title}
        </h1>
        <p className={combine(TYPOGRAPHY.body.muted)}>
          {CHECKOUT_CONTENT.failure.message}
        </p>
        <div
          className={combine(
            "bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm",
          )}
        >
          {" "}
          {/* error box */}
          <p className="font-medium">¿Qué puedes hacer?</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            {CHECKOUT_CONTENT.failure.instructions.map((inst, i) => (
              <li key={i}>• {inst}</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-3">
          <Link
            href="/carrito"
            className={combine(BUTTONS.secondary, "flex-1 px-6 py-3")}
          >
            {CHECKOUT_CONTENT.failure.ctaBack}
          </Link>
          <Link
            href="/checkout"
            className={combine(BUTTONS.primary, "flex-1 px-6 py-3")}
          >
            {CHECKOUT_CONTENT.failure.ctaRetry}
          </Link>
        </div>
      </div>
    </div>
  );
}
