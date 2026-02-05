/**
 * Rate Limiting Tests for Create-Preference Endpoint
 *
 * Focused coverage:
 * - Allows up to 5 requests per IP
 * - Returns 429 on the 6th request
 * - Includes user-friendly Spanish error response
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const mockCartRepo = {
  getCartWithItems: vi.fn(),
  validateStock: vi.fn(),
  createOrderWithItems: vi.fn(),
  updateOrderStatus: vi.fn(),
  savePreferenceId: vi.fn(),
};

vi.mock("@/lib/mercadopago/client", () => {
  const create = vi.fn().mockResolvedValue({
    id: "pref-123",
    init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect",
  });

  return {
    client: {},
    Preference: class {
      constructor(_client: unknown) {}

      async create(): Promise<{ id: string; init_point: string }> {
        return create();
      }
    },
  };
});

vi.mock("@/lib/repositories/cart.repository", () => ({
  CartRepository: vi.fn(() => mockCartRepo),
}));

vi.mock("@/lib/config/urls", () => ({
  CHECKOUT_URLS: {
    success: "http://localhost:3000/checkout/success",
    failure: "http://localhost:3000/checkout/failure",
    pending: "http://localhost:3000/checkout/pending",
  },
  WEBHOOK_URL: "http://localhost:3000/api/checkout/webhook",
}));

vi.mock("@/lib/utils/security-logger", () => ({
  logSecurityEvent: vi.fn(),
}));

function createRequest(ip: string): NextRequest {
  const req = new NextRequest(
    "http://localhost:3000/api/checkout/create-preference",
    {
      method: "POST",
      headers: {
        "x-forwarded-for": ip,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        customerEmail: "test@example.com",
        customerName: "Test User",
        customerPhone: "1234567890",
        shippingAddress: "123 Main St",
      }),
    },
  );

  Object.defineProperty(req, "cookies", {
    value: {
      get: (name: string) =>
        name === "session_id" ? { value: "session-123" } : undefined,
    },
  });

  return req;
}

describe("POST /api/checkout/create-preference - Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";

    mockCartRepo.getCartWithItems.mockResolvedValue({
      id: "cart-123",
      items: [
        {
          id: "item-1",
          quantity: 1,
          price_at_addition: 10000,
          variacion: {
            sku: "SKU-001",
            tamanio: "150x200",
            color: "Red",
            producto: {
              nombre: "Mantel Floral",
              descripcion: "Test product",
              imagenes: [{ es_principal: true, url: "test.jpg" }],
            },
          },
        },
      ],
    });
    mockCartRepo.validateStock.mockResolvedValue([]);
    mockCartRepo.createOrderWithItems.mockResolvedValue("order-123");
    mockCartRepo.updateOrderStatus.mockResolvedValue(undefined);
    mockCartRepo.savePreferenceId.mockResolvedValue(undefined);
  });

  it("allows requests within the limit", async () => {
    const response = await POST(createRequest("192.168.10.10"));

    expect(response.status).not.toBe(429);
  });

  it("returns 429 on the 6th request from the same IP", async () => {
    const ip = "192.168.10.11";

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(createRequest(ip));
      expect(response.status).not.toBe(429);
    }

    const response = await POST(createRequest(ip));

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe("Demasiadas solicitudes de pago");
    expect(data.message).toContain("Por favor, intenta de nuevo");
    expect(data.resetIn).toBeGreaterThan(0);
  });
});
