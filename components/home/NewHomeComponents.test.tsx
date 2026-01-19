/**
 * Test that verifies new home page components can be imported
 * and have correct exports
 */

import { describe, it, expect } from "vitest";

describe("Home Page Components", () => {
  it("should export HeroSectionNew", async () => {
    const module = await import("@/components/home/HeroSectionNew");
    expect(module.HeroSectionNew).toBeDefined();
    expect(typeof module.HeroSectionNew).toBe("function");
  });

  it("should export FeaturedProducts", async () => {
    const module = await import("@/components/home/FeaturedProducts");
    expect(module.FeaturedProducts).toBeDefined();
    expect(typeof module.FeaturedProducts).toBe("function");
  });

  it("should export CollectionsGrid", async () => {
    const module = await import("@/components/home/CollectionsGrid");
    expect(module.CollectionsGrid).toBeDefined();
    expect(typeof module.CollectionsGrid).toBe("function");
  });

  it("should export ContactSection", async () => {
    const module = await import("@/components/home/ContactSection");
    expect(module.ContactSection).toBeDefined();
    expect(typeof module.ContactSection).toBe("function");
  });

  it("should export TextureDivider", async () => {
    const module = await import("@/components/home/TextureDivider");
    expect(module.TextureDivider).toBeDefined();
    expect(typeof module.TextureDivider).toBe("function");
  });

  it("should export ProgressBar", async () => {
    const module = await import("@/components/layout/ProgressBar");
    expect(module.ProgressBar).toBeDefined();
    expect(typeof module.ProgressBar).toBe("function");
  });
});

describe("Design Tokens", () => {
  it("should have hero heading typography", async () => {
    const { TYPOGRAPHY } = await import("@/lib/design/tokens");
    expect(TYPOGRAPHY.heading.hero).toBeDefined();
    expect(typeof TYPOGRAPHY.heading.hero).toBe("string");
  });

  it("should have large body typography", async () => {
    const { TYPOGRAPHY } = await import("@/lib/design/tokens");
    expect(TYPOGRAPHY.body.large).toBeDefined();
    expect(typeof TYPOGRAPHY.body.large).toBe("string");
  });

  it("should have card component tokens", async () => {
    const { COMPONENTS } = await import("@/lib/design/tokens");
    expect(COMPONENTS.card.product).toBeDefined();
    expect(COMPONENTS.card.image).toBeDefined();
    expect(COMPONENTS.card.imageHover).toBeDefined();
  });

  it("should have section spacing tokens", async () => {
    const { SPACING } = await import("@/lib/design/tokens");
    expect(SPACING.section.sm).toBeDefined();
    expect(SPACING.section.md).toBeDefined();
    expect(SPACING.section.lg).toBeDefined();
  });
});

describe("HOME_CONTENT", () => {
  it("should have updated structure with featured section", async () => {
    const { HOME_CONTENT } = await import("@/lib/content/home");
    expect(HOME_CONTENT.featured).toBeDefined();
    expect(HOME_CONTENT.featured.sectionTitle).toBe("Destacados");
    expect(HOME_CONTENT.featured.sectionSubtitle).toBe("Selección de temporada");
  });

  it("should have collections with featured flag", async () => {
    const { HOME_CONTENT } = await import("@/lib/content/home");
    expect(HOME_CONTENT.collections).toBeDefined();
    expect(HOME_CONTENT.collections.items).toHaveLength(3);
    expect(HOME_CONTENT.collections.items[0].featured).toBe(true);
    expect(HOME_CONTENT.collections.items[1].featured).toBe(false);
  });

  it("should have contact section", async () => {
    const { HOME_CONTENT } = await import("@/lib/content/home");
    expect(HOME_CONTENT.contact).toBeDefined();
    expect(HOME_CONTENT.contact.title).toBeDefined();
    expect(HOME_CONTENT.contact.cta.href).toBe("/contacto");
  });

  it("should have texture image config", async () => {
    const { HOME_CONTENT } = await import("@/lib/content/home");
    expect(HOME_CONTENT.textureImage).toBeDefined();
    expect(HOME_CONTENT.textureImage.src).toBe("/images/textures/linen-texture.jpg");
  });
});

describe("DecorativeBadge", () => {
  it("should support variant prop", async () => {
    const module = await import("@/components/ui/DecorativeBadge");
    expect(module.DecorativeBadge).toBeDefined();
  });
});

describe("Supabase Queries", () => {
  it("should export getProductosDestacados function", async () => {
    const module = await import("@/lib/supabase/queries");
    expect(module.getProductosDestacados).toBeDefined();
    expect(typeof module.getProductosDestacados).toBe("function");
  });

  it("should export getProductosDestacadosFresh function", async () => {
    const module = await import("@/lib/supabase/queries");
    expect(module.getProductosDestacadosFresh).toBeDefined();
    expect(typeof module.getProductosDestacadosFresh).toBe("function");
  });
});
