import { describe, expect, it } from "vitest";
import { getImageUrl } from "./image";

describe("getImageUrl", () => {
  it("uses the existing product placeholder for empty image URLs", () => {
    const placeholder = "/images/placeholders/placeholder-image.jpeg";

    expect(getImageUrl(null)).toBe(placeholder);
    expect(getImageUrl("")).toBe(placeholder);
  });
});
