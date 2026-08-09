import { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ContactInfo,
  type ContactProductContext,
} from "@/components/contacto/ContactInfo";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";

export const metadata: Metadata = buildMetadata({
  title: CONTACTO_CONTENT.page.title,
  description: CONTACTO_CONTENT.page.description,
  url: "/contacto",
});

export type ContactSearchParams = Record<string, string | string[] | undefined>;

const CONTEXT_MAX_LENGTH = 120;

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeContextParam(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\s+/g, " ");
  if (!trimmed) return undefined;

  return trimmed.slice(0, CONTEXT_MAX_LENGTH);
}

export function buildContactContext(
  searchParams?: ContactSearchParams,
): ContactProductContext | undefined {
  const producto = sanitizeContextParam(getFirstParam(searchParams?.producto));
  if (!producto) return undefined;

  const variante = sanitizeContextParam(getFirstParam(searchParams?.variante));
  return variante ? { producto, variante } : { producto };
}

interface ContactoPageProps {
  searchParams?: Promise<ContactSearchParams>;
}

export default async function ContactoPage({
  searchParams,
}: ContactoPageProps = {}) {
  const { page } = CONTACTO_CONTENT;
  const resolvedSearchParams = await searchParams;
  const contactContext = buildContactContext(resolvedSearchParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <PageHeader title={page.title} description={page.description} />

      <ContactInfo initialContext={contactContext} />
    </div>
  );
}
