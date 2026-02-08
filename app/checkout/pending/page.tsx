import { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CHECKOUT_CONTENT } from "@/lib/content/checkout";
import { BUTTONS, TYPOGRAPHY } from "@/lib/design/tokens";
import { combine } from "@/lib/design/tokens";

export const metadata: Metadata = {
  title: CHECKOUT_CONTENT.pending.title,
  description: CHECKOUT_CONTENT.pending.description,
};

export default function PendingPage() {
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
          <div className="rounded-full bg-yellow-100 p-4">
            <Clock className="w-16 h-16 text-yellow-600" />
          </div>
        </div>
        <h1 className={combine(TYPOGRAPHY.heading.section)}>
          {CHECKOUT_CONTENT.pending.title}
        </h1>
        <p className={combine(TYPOGRAPHY.body.muted)}>
          {CHECKOUT_CONTENT.pending.message}
        </p>
        <div
          className={combine(
            "bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm",
          )}
        >
          {" "}
          {/* info box */}
          <p className="font-medium">¿Qué significa esto?</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            {CHECKOUT_CONTENT.pending.instructions.map((inst, i) => (
              <li key={i}>• {inst}</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-3">
          <Link
            href="/contacto"
            className={combine(BUTTONS.secondary, "flex-1 px-6 py-3")}
          >
            {CHECKOUT_CONTENT.pending.ctaSupport}
          </Link>
          <Link
            href="/"
            className={combine(BUTTONS.primary, "flex-1 px-6 py-3")}
          >
            {CHECKOUT_CONTENT.pending.ctaHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
