import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMetadata } from "./metadata";

describe("social metadata defaults", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the existing editorial social image by default", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example");

    const metadata = buildMetadata({ title: "Textiles", description: "Piezas textiles." });

    expect(metadata.openGraph?.images).toEqual([
      "https://fira.example/images/og-fira.webp",
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://fira.example/images/og-fira.webp",
    ]);
  });
});
