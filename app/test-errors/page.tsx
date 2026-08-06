import { notFound } from "next/navigation";
import TestErrorsPageClient from "./TestErrorsPageClient";

export default function TestErrorsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <TestErrorsPageClient />;
}
