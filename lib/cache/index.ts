/**
 * Cache layer using React cache and Next.js unstable_cache
 * - React cache(): Deduplicates requests within a single render
 * - unstable_cache(): Persists data across requests
 * - Skips caching in development mode
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Cache configuration per entity type
 */
export const CACHE_CONFIG = {
  productos: {
    revalidate: 3600, // 1 hour
    tags: ["productos"] as string[],
  },
  categorias: {
    revalidate: 86400, // 24 hours
    tags: ["categorias"] as string[],
  },
  producto_detail: {
    revalidate: 1800, // 30 minutes
    tags: ["productos"] as string[],
  },
};

export type CacheEntity = keyof typeof CACHE_CONFIG;

interface CacheOptions {
  revalidate?: number;
  tags?: string[];
}

/**
 * Creates a cached query function that combines React cache and Next.js unstable_cache
 * @param fn - Async function to cache
 * @param config - Cache configuration (revalidate time and tags)
 * @returns Cached version of the function
 * 
 * @example
 * const getCachedProductos = createCachedQuery(
 *   async () => { ... },
 *   CACHE_CONFIG.productos
 * );
 */
export function createCachedQuery<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: CacheOptions,
): (...args: TArgs) => Promise<TResult> {
  // Skip caching in development mode
  if (process.env.NODE_ENV === "development") {
    return fn;
  }

  // First layer: React cache for request-level deduplication
  const reactCached = cache(fn);

  // Second layer: unstable_cache for cross-request persistence
  return (...args: TArgs) => {
    const cacheKey = JSON.stringify(args);
    
    const nextCached = unstable_cache(
      async () => reactCached(...args),
      [cacheKey],
      {
        revalidate: config.revalidate,
        tags: config.tags,
      },
    );

    return nextCached();
  };
}
