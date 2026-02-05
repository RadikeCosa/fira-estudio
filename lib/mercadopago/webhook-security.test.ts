import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "crypto";
import {
  validateWebhookSignature,
  validateMercadoPagoIP,
  extractClientIP,
} from "@/lib/mercadopago/webhook-security";

describe("Mercado Pago Webhook Security", () => {
  const WEBHOOK_SECRET = "test-webhook-secret-123";

  beforeEach(() => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateWebhookSignature", () => {
    it("should accept valid signature with correct secret", () => {
      const paymentId = 12345;
      const ts = Math.floor(Date.now() / 1000);
      const payload = `id=${paymentId};type=payment;ts=${ts}`;

      const signature = createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

      const headers = {
        "x-signature": `ts=${ts};v1=${signature}`,
      };

      expect(validateWebhookSignature(headers, "", paymentId, String(ts))).toBe(
        true,
      );
    });

    it("should reject signature with wrong secret", () => {
      const paymentId = 12345;
      const ts = Math.floor(Date.now() / 1000);
      const wrongSecret = "wrong-secret";
      const payload = `id=${paymentId};type=payment;ts=${ts}`;

      const signature = createHmac("sha256", wrongSecret)
        .update(payload)
        .digest("hex");

      const headers = {
        "x-signature": `ts=${ts};v1=${signature}`,
      };

      expect(validateWebhookSignature(headers, "", paymentId, String(ts))).toBe(
        false,
      );
    });

    it("should reject signature with tampered payload", () => {
      const paymentId = 12345;
      const tamperedId = 99999;
      const ts = Math.floor(Date.now() / 1000);
      const payload = `id=${paymentId};type=payment;ts=${ts}`;

      const signature = createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

      const headers = {
        "x-signature": `ts=${ts};v1=${signature}`,
      };

      // Intentar validar con ID diferente
      expect(
        validateWebhookSignature(headers, "", tamperedId, String(ts)),
      ).toBe(false);
    });

    it("should reject old timestamps (>5 minutes)", () => {
      const paymentId = 12345;
      const oldTs = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const payload = `id=${paymentId};type=payment;ts=${oldTs}`;

      const signature = createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

      const headers = {
        "x-signature": `ts=${oldTs};v1=${signature}`,
      };

      expect(
        validateWebhookSignature(headers, "", paymentId, String(oldTs)),
      ).toBe(false);
    });

    it("should reject missing x-signature header", () => {
      const headers = {};

      expect(validateWebhookSignature(headers, "", 12345, "1234567890")).toBe(
        false,
      );
    });

    it("should reject malformed x-signature", () => {
      const headers = {
        "x-signature": "invalid-format",
      };

      expect(validateWebhookSignature(headers, "", 12345, "1234567890")).toBe(
        false,
      );
    });

    it("should handle x-signature as array (from headers.entries())", () => {
      const paymentId = 12345;
      const ts = Math.floor(Date.now() / 1000);
      const payload = `id=${paymentId};type=payment;ts=${ts}`;

      const signature = createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

      const headers = {
        "x-signature": [`ts=${ts};v1=${signature}`], // array form
      };

      expect(validateWebhookSignature(headers, "", paymentId, String(ts))).toBe(
        true,
      );
    });
  });

  describe("validateMercadoPagoIP", () => {
    it("should accept localhost in development", () => {
      process.env.NODE_ENV = "development";

      expect(validateMercadoPagoIP("127.0.0.1")).toBe(true);
      expect(validateMercadoPagoIP("localhost")).toBe(true);
    });

    it("should reject unauthorized IP in development (non-localhost)", () => {
      process.env.NODE_ENV = "development";

      expect(validateMercadoPagoIP("192.168.1.1")).toBe(false);
    });

    it("should accept Mercado Pago IP ranges", () => {
      process.env.NODE_ENV = "production";

      // These IPs are in the allowed ranges (200.121.192.0/24)
      expect(validateMercadoPagoIP("200.121.192.10")).toBe(true);
      expect(validateMercadoPagoIP("200.121.192.255")).toBe(true);

      // These IPs are in the allowed ranges (201.217.242.0/24)
      expect(validateMercadoPagoIP("201.217.242.50")).toBe(true);
    });

    it("should accept AWS IP ranges (MP uses AWS)", () => {
      process.env.NODE_ENV = "production";

      // AWS ranges: 18.0.0.0/8, 52.0.0.0/8, 54.0.0.0/8
      expect(validateMercadoPagoIP("18.1.2.3")).toBe(true);
      expect(validateMercadoPagoIP("52.100.50.25")).toBe(true);
      expect(validateMercadoPagoIP("54.200.100.50")).toBe(true);
    });

    it("should accept Google Cloud IP ranges (MP uses GCP)", () => {
      process.env.NODE_ENV = "production";

      // Google Cloud ranges: 34.0.0.0/8, 35.0.0.0/8
      expect(validateMercadoPagoIP("34.100.50.25")).toBe(true);
      expect(validateMercadoPagoIP("35.200.100.50")).toBe(true);
    });

    it("should reject non-Mercado Pago IPs in production", () => {
      process.env.NODE_ENV = "production";

      expect(validateMercadoPagoIP("192.168.1.1")).toBe(false);
      expect(validateMercadoPagoIP("8.8.8.8")).toBe(false);
      expect(validateMercadoPagoIP("1.1.1.1")).toBe(false);
    });

    it("should reject null/undefined IP", () => {
      expect(validateMercadoPagoIP(null)).toBe(false);
      expect(validateMercadoPagoIP(undefined as any)).toBe(false);
    });
  });

  describe("extractClientIP", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const headers = {
        "x-forwarded-for": "192.168.1.1, 10.0.0.1",
      };

      expect(extractClientIP(headers)).toBe("192.168.1.1");
    });

    it("should handle x-forwarded-for as array", () => {
      const headers = {
        "x-forwarded-for": ["203.0.113.1, 10.0.0.1"],
      };

      expect(extractClientIP(headers)).toBe("203.0.113.1");
    });

    it("should fallback to cf-connecting-ip", () => {
      const headers = {
        "cf-connecting-ip": "203.0.113.50",
      };

      expect(extractClientIP(headers)).toBe("203.0.113.50");
    });

    it("should prefer x-forwarded-for over cf-connecting-ip", () => {
      const headers = {
        "x-forwarded-for": "203.0.113.100",
        "cf-connecting-ip": "203.0.113.50",
      };

      expect(extractClientIP(headers)).toBe("203.0.113.100");
    });

    it("should return null if no IP headers found", () => {
      const headers = {};

      expect(extractClientIP(headers)).toBe(null);
    });

    it("should trim whitespace from IP", () => {
      const headers = {
        "x-forwarded-for": "  192.168.1.1  , 10.0.0.1",
      };

      expect(extractClientIP(headers)).toBe("192.168.1.1");
    });
  });
});
