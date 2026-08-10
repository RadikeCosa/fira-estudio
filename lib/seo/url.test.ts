import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteBaseUrl, resolveAbsoluteUrl } from "./url";

describe("SEO URL helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes a configured base URL without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

    expect(getSiteBaseUrl()).toBe("https://example.com");
  });

  it("normalizes a configured base URL with a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");

    expect(getSiteBaseUrl()).toBe("https://example.com");
  });

  it("resolves an internal path that starts with a slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");

    expect(resolveAbsoluteUrl("/productos")).toBe(
      "https://example.com/productos",
    );
  });

  it("resolves an internal path without a leading slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");

    expect(resolveAbsoluteUrl("productos/foo")).toBe(
      "https://example.com/productos/foo",
    );
  });

  it("falls back to the local site URL when no public site URL is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(resolveAbsoluteUrl("/productos")).toBe(
      "http://localhost:3000/productos",
    );
  });

  it("keeps absolute URLs absolute", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");

    expect(resolveAbsoluteUrl("https://cdn.example.com/image.webp")).toBe(
      "https://cdn.example.com/image.webp",
    );
  });
});
