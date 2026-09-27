import { describe, expect, it } from "vitest";
import { metadata as homeMetadata } from "./page";

describe("home metadata", () => {
  it("uses a non-brand page title so the global template does not duplicate it", () => {
    expect(homeMetadata.title).toBe("Textiles artesanales");
  });

  it("describes the catalog and consultation intent", () => {
    expect(homeMetadata.description).toBe(
      "Diseñamos y confeccionamos manteles, caminos, servilletas y accesorios textiles para usar cada día. Explorá el catálogo y consultá disponibilidad por WhatsApp.",
    );
  });
});
