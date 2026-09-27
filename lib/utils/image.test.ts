import { describe, expect, it } from "vitest";
import { getImageUrl, getProductImageAlt } from "./image";

describe("getImageUrl", () => {
  it("uses the existing product placeholder for empty image URLs", () => {
    const placeholder = "/images/placeholders/placeholder-image.jpeg";

    expect(getImageUrl(null)).toBe(placeholder);
    expect(getImageUrl("")).toBe(placeholder);
  });
});

describe("getProductImageAlt", () => {
  it("uses stored alt text when present", () => {
    expect(getProductImageAlt("Mantel Picnic", "Mantel azul sobre una mesa")).toBe(
      "Mantel azul sobre una mesa",
    );
  });

  it("describes the product view when stored alt text is empty", () => {
    expect(getProductImageAlt("Mantel Picnic", null)).toBe(
      "Mantel Picnic, vista principal",
    );
  });
});
