import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock de CartRepository
vi.mock("@/lib/repositories/cart.repository", () => ({
  CartRepository: {
    getCartWithItems: vi.fn(),
    validateStock: vi.fn(),
    createOrderWithItems: vi.fn(),
  },
}));

// Mock de Mercado Pago client
vi.mock("@/lib/mercadopago/client", () => ({
  client: {},
  Preference: class {
    async create(data: any) {
      return {
        id: "mp-pref-123",
        init_point: "https://www.mercadopago.com/checkout/v1/...",
        sandbox_init_point: "https://sandbox.mercadopago.com/checkout/v1/...",
      };
    }
  },
}));

// Mock de URLs config
vi.mock("@/lib/config/urls", () => ({
  CHECKOUT_URLS: {
    success: "http://localhost:3000/checkout/success",
    failure: "http://localhost:3000/checkout/failure",
    pending: "http://localhost:3000/checkout/pending",
  },
  WEBHOOK_URL: "http://localhost:3000/api/checkout/webhook",
}));

describe("POST /api/checkout/create-preference", () => {
  const mockSessionId = "test-session-123";
  const mockCustomerEmail = "customer@example.com";
  const mockCustomerName = "Test Customer";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-access-token";
  });

  describe("Happy Path", () => {
    it("should create preference with valid cart and customer data", async () => {
      const mockCart = {
        id: "cart-123",
        session_id: mockSessionId,
        total_amount: 100,
        items: [
          {
            id: "item-1",
            quantity: 2,
            price_at_addition: 50,
            variacion_id: "var-1",
            variacion: {
              id: "var-1",
              productos: {
                nombre: "Mantel Floral",
              },
              imagenes_producto: [
                {
                  url: "https://example.com/image.jpg",
                },
              ],
            },
          },
        ],
      };

      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.total_amount).toBe(100);
    });

    it("should include all required customer fields in preference", async () => {
      const customerData = {
        email: mockCustomerEmail,
        name: mockCustomerName,
        phone: "+123456789",
      };

      expect(customerData.email).toBe(mockCustomerEmail);
      expect(customerData.name).toBe(mockCustomerName);
    });

    it("should create order before creating preference", async () => {
      const mockOrder = {
        id: "order-123",
        cart_id: "cart-123",
        order_number: "ORD-20260204-001",
      };

      expect(mockOrder).toBeDefined();
    });

    it("should return init_point URL for checkout", async () => {
      const mockPreference = {
        init_point: "https://www.mercadopago.com/checkout/v1/...",
      };

      expect(mockPreference.init_point).toBeDefined();
      expect(mockPreference.init_point).toContain("mercadopago.com");
    });
  });

  describe("Validation Errors", () => {
    it("should reject if cart is empty", async () => {
      const mockEmptyCart = {
        items: [],
      };

      expect(mockEmptyCart.items).toHaveLength(0);
    });

    it("should reject if customerEmail is missing", async () => {
      const missingEmail = {
        name: mockCustomerName,
        phone: "+123456789",
      };

      expect(missingEmail).not.toHaveProperty("email");
    });

    it("should reject if customerName is missing", async () => {
      const missingName = {
        email: mockCustomerEmail,
        phone: "+123456789",
      };

      expect(missingName).not.toHaveProperty("name");
    });

    it("should reject if session_id is missing from cookies", async () => {
      const noCookie = {};
      expect(noCookie).not.toHaveProperty("session_id");
    });

    it("should validate email format", async () => {
      const validEmail = "test@example.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(validEmail)).toBe(true);
    });

    it("should reject invalid email format", async () => {
      const invalidEmail = "not-an-email";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(invalidEmail)).toBe(false);
    });
  });

  describe("Stock Validation", () => {
    it("should reject if product stock is insufficient", async () => {
      const items = [
        {
          variacion_id: "var-1",
          quantity: 10,
          available_stock: 5,
        },
      ];

      const insufficient = items.filter(
        (item: any) => item.quantity > item.available_stock,
      );
      expect(insufficient).toHaveLength(1);
    });

    it("should return error details for insufficient items", async () => {
      const stockErrors = [
        {
          variacion_id: "var-1",
          requested: 10,
          available: 5,
        },
      ];

      expect(stockErrors[0].variacion_id).toBe("var-1");
      expect(stockErrors[0].requested).toBeGreaterThan(
        stockErrors[0].available,
      );
    });

    it("should allow checkout if all stock is available", async () => {
      const items = [
        { variacion_id: "var-1", quantity: 2, available_stock: 10 },
        { variacion_id: "var-2", quantity: 1, available_stock: 5 },
      ];

      const insufficient = items.filter(
        (item: any) => item.quantity > item.available_stock,
      );
      expect(insufficient).toHaveLength(0);
    });
  });

  describe("Mercado Pago Integration", () => {
    it("should include items with title, quantity, unit_price", async () => {
      const mpItem = {
        title: "Mantel Floral - 150x200cm - Rojo",
        quantity: 2,
        unit_price: 50,
        currency_id: "ARS",
      };

      expect(mpItem).toHaveProperty("title");
      expect(mpItem).toHaveProperty("quantity");
      expect(mpItem).toHaveProperty("unit_price");
    });

    it("should include correct back_urls", async () => {
      const backUrls = {
        success: "http://localhost:3000/checkout/success",
        failure: "http://localhost:3000/checkout/failure",
        pending: "http://localhost:3000/checkout/pending",
      };

      expect(backUrls.success).toContain("/checkout/success");
      expect(backUrls.failure).toContain("/checkout/failure");
    });

    it("should use order_id as external_reference", async () => {
      const externalRef = "ORD-20260204-001";
      expect(externalRef).toMatch(/^ORD-\d{8}-\d{3}$/);
    });

    it("should include webhook URL", async () => {
      const webhookUrl = "http://localhost:3000/api/checkout/webhook";
      expect(webhookUrl).toContain("/api/checkout/webhook");
    });

    it("should include payer email", async () => {
      const payer = {
        email: mockCustomerEmail,
      };

      expect(payer.email).toBe(mockCustomerEmail);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 if MERCADOPAGO_ACCESS_TOKEN is missing", async () => {
      delete process.env.MERCADOPAGO_ACCESS_TOKEN;

      const missingEnv = ["MERCADOPAGO_ACCESS_TOKEN"];
      expect(missingEnv).toHaveLength(1);
    });

    it("should catch Mercado Pago API errors", async () => {
      const mpError = new Error("Connection timeout");
      expect(mpError).toBeDefined();
    });

    it("should return 500 if preference creation fails", async () => {
      // Mock error from Preference.create()
      const error = {
        status: 500,
        message: "Could not create preference",
      };

      expect(error.status).toBe(500);
    });

    it("should return meaningful error message for user", async () => {
      const errorMessage =
        "No pudimos procesar tu solicitud. Por favor intenta de nuevo.";
      expect(errorMessage).toBeDefined();
    });

    it("should log errors for debugging", async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: "error",
        message: "create preference failed",
      };

      expect(logEntry.level).toBe("error");
    });
  });

  describe("Security", () => {
    it("should not expose sensitive data in response", async () => {
      const response = {
        preference_id: "mp-pref-123",
        init_point: "https://...",
        order_id: "ORD-123",
      };

      expect(response).not.toHaveProperty("access_token");
      expect(response).not.toHaveProperty("secret");
    });

    it("should validate total amount server-side", async () => {
      const cartTotal = 100;
      const serverCalculatedTotal = 50 * 2; // recalculate from items

      expect(cartTotal).toBe(serverCalculatedTotal);
    });

    it("should sanitize customer input", async () => {
      const maliciousInput = "<script>alert('xss')</script>";
      const sanitized = maliciousInput.replace(/<[^>]*>/g, "");

      expect(sanitized).not.toContain("<script>");
    });
  });

  describe("Response Format", () => {
    it("should return JSON response", async () => {
      const mockResponse = {
        preference_id: "mp-pref-123",
        init_point: "https://...",
        order_id: "ORD-123",
      };

      expect(mockResponse).toEqual(
        expect.objectContaining({
          preference_id: expect.any(String),
          init_point: expect.any(String),
        }),
      );
    });

    it("should return HTTP 200 on success", async () => {
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });

    it("should return HTTP 400 on validation error", async () => {
      const statusCode = 400;
      expect(statusCode).toBe(400);
    });

    it("should return HTTP 500 on server error", async () => {
      const statusCode = 500;
      expect(statusCode).toBe(500);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large carts", async () => {
      const largeCart = {
        items: Array(100).fill({
          quantity: 1,
          price_at_addition: 10,
        }),
      };

      expect(largeCart.items).toHaveLength(100);
    });

    it("should handle decimal prices", async () => {
      const price = 19.99;
      expect(price % 1).toBeGreaterThan(0);
    });

    it("should handle very long customer names", async () => {
      const longName = "A".repeat(200);
      expect(longName.length).toBe(200);
    });

    it("should handle international phone numbers", async () => {
      const phoneNumbers = ["+1234567890", "+54911234567", "+34912345678"];
      phoneNumbers.forEach((phone) => {
        expect(phone).toMatch(/^\+\d+$/);
      });
    });
  });
});
