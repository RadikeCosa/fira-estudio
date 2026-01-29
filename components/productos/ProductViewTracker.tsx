"use client";

import { useEffect } from "react";
import { Producto } from "@/lib/types";
import { trackProductView } from "@/lib/analytics/gtag";

interface ProductViewTrackerProps {
  producto: Producto;
}

/**
 * ProductViewTracker - Track product page views
 *
 * Fires analytics event when product page is viewed
 * Runs only in production with gtag available
 *
 * @param producto - Product being viewed
 */
export function ProductViewTracker({ producto }: ProductViewTrackerProps) {
  useEffect(() => {
    trackProductView(producto);
  }, [producto]);

  return null;
}
