import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Gloock: () => ({ variable: "--font-brand" }),
  Inter: () => ({ variable: "--font-sans" }),
}));

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: () => null,
}));

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => null,
}));

import { metadata } from "./layout";

describe("root metadata", () => {
  it("includes Google Search Console verification", () => {
    expect(metadata.verification).toMatchObject({
      google: "yIAuiC-866ahSn2Fh0PGCbmx_d6B5NNBwhXYf3778IE",
    });
  });
});
