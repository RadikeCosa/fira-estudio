/**
 * Breadcrumb navigation component
 * SEO-optimized with JSON-LD structured data
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  generateBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/seo/structured-data";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb component with structured data for SEO
 * @param items - Array of breadcrumb items {name, url}
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Always include home at the start
  const allItems: BreadcrumbItem[] = [{ name: "Inicio", url: "/" }, ...items];

  // Generate structured data for SEO
  const schema = generateBreadcrumbSchema(allItems);

  return (
    <>
      {/* JSON-LD structured data */}
      <script {...renderJsonLd(schema)} />

      {/* Visual breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={item.url} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                {isLast ? (
                  <span
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
