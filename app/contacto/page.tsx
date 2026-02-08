import { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contacto/ContactForm";
import { ContactInfo } from "@/components/contacto/ContactInfo";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";

export const metadata: Metadata = buildMetadata({
  title: CONTACTO_CONTENT.page.title,
  description: CONTACTO_CONTENT.page.description,
});

export default function ContactoPage() {
  const { page } = CONTACTO_CONTENT;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <PageHeader title={page.title} description={page.description} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ContactForm />
        <ContactInfo />
      </div>
    </div>
  );
}
