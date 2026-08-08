import { afterEach, describe, expect, it } from "vitest";
import {
  buildGeneralInquiryMessage,
  buildProductInquiryMessage,
  buildProductInquiryMessageFromParts,
  buildWhatsappUrl,
  getWhatsappNumber,
} from "./whatsapp";
import type { Producto, Variacion } from "@/lib/types";

describe("whatsapp contact helpers", () => {
  const producto: Producto = {
    id: "prod-1",
    nombre: "Mantel Floral",
    slug: "mantel-floral",
    descripcion: "Mantel artesanal con diseño floral",
    categoria_id: "cat-1",
    precio_desde: 15000,
    destacado: false,
    activo: true,
    tiempo_fabricacion: "3-5 días",
    material: "Algodón 100%",
    cuidados: "Lavar a mano",
    created_at: "2024-01-01T00:00:00Z",
  };

  const variacion: Variacion = {
    id: "var-1",
    producto_id: "prod-1",
    tamanio: "150x200cm",
    color: "Rojo",
    precio: 15000,
    stock: 5,
    sku: "MAN-150-RED",
    activo: true,
  };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  });

  it("builds a concise message without variation", () => {
    expect(buildProductInquiryMessage(producto)).toBe(
      "Hola, quería consultar por Mantel Floral. ¿Está disponible?",
    );
  });

  it("builds a concise message with variation", () => {
    expect(buildProductInquiryMessage(producto, variacion)).toBe(
      "Hola, quería consultar por Mantel Floral, variante 150x200cm / Rojo. ¿Está disponible?",
    );
  });

  it("builds the same product message from product and variation labels", () => {
    expect(
      buildProductInquiryMessageFromParts(
        "Mantel Floral",
        "150x200cm / Rojo",
      ),
    ).toBe(
      "Hola, quería consultar por Mantel Floral, variante 150x200cm / Rojo. ¿Está disponible?",
    );
  });

  it("builds a concise general inquiry message", () => {
    expect(buildGeneralInquiryMessage()).toBe(
      "Hola, quería hacer una consulta sobre los productos de Fira Estudio.",
    );
  });

  it("does not include price, stock, product URL, personal data, or checkout language", () => {
    const message = buildProductInquiryMessage(producto, variacion);

    expect(message).not.toContain("15000");
    expect(message).not.toContain("stock");
    expect(message).not.toContain("http");
    expect(message).not.toContain("email");
    expect(message).not.toMatch(/carrito|checkout|compr/i);
  });

  it("returns a valid configured number", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5492999123456";

    expect(getWhatsappNumber()).toBe("5492999123456");
  });

  it("returns undefined when the number is absent", () => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    expect(getWhatsappNumber()).toBeUndefined();
  });

  it("returns undefined when the number is empty", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "   ";

    expect(getWhatsappNumber()).toBeUndefined();
  });

  it("returns undefined when the number contains plus sign", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+5492999123456";

    expect(getWhatsappNumber()).toBeUndefined();
  });

  it("returns undefined when the number contains spaces", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "549 299 9123456";

    expect(getWhatsappNumber()).toBeUndefined();
  });

  it("returns undefined when the number contains hyphens", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "549-299-9123456";

    expect(getWhatsappNumber()).toBeUndefined();
  });

  it("builds an encoded wa.me URL for a valid number", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5492999123456";

    const url = buildWhatsappUrl(buildProductInquiryMessage(producto));

    expect(url).toBe(
      "https://wa.me/5492999123456?text=Hola%2C%20quer%C3%ADa%20consultar%20por%20Mantel%20Floral.%20%C2%BFEst%C3%A1%20disponible%3F",
    );
  });

  it("does not build a wa.me URL when the number is invalid", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+5492999123456";

    expect(buildWhatsappUrl(buildProductInquiryMessage(producto))).toBeNull();
  });
});
