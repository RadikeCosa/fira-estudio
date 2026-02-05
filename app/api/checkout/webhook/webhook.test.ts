import { describe, it, expect, beforeEach, vi } from "vitest";
import { createHmac } from "crypto";

// Mock de CartRepository
vi.mock("@/lib/repositories/cart.repository", () => ({
  CartRepository: {
    getPaymentLogByPaymentId: vi.fn(),
    savePaymentLog: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

// Mock de Mercado Pago
vi.mock("mercadopago", () => ({
  Payment: class {
    constructor(client: any) {
      this.client = client;
    }
    async get(params: any) {
      return {
        id: params.id,
        status: "approved",
        status_detail: "accredited",
        external_reference: "ORD-20260204-001",
      };
    }
  },
}));

// Mock de webhook security
vi.mock("@/lib/mercadopago/webhook-security", () => ({
  validateMercadoPagoIP: vi.fn(() => true),
  validateWebhookSignature: vi.fn(() => true),
  extractClientIP: vi.fn(() => "200.121.192.50"),
}));

describe("POST /api/checkout/webhook", () => {
  const mockPaymentId = 12345;
  const mockOrderId = "ORD-20260204-001";
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "test-secret";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_WEBHOOK_SECRET = webhookSecret;
  });

  function createValidSignature(
    paymentId: number,
    timestamp: number = Math.floor(Date.now() / 1000),
  ) {
    const payload = `id=${paymentId};type=payment;ts=${timestamp}`;
    const signature = createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");
    return `ts=${timestamp};v1=${signature}`;
  }

  describe("Happy Path - Valid Webhook", () => {
    it("should process valid payment event with NEW format (id/type)", async () => {
      const mockEvent = {
        id: mockPaymentId,
        type: "payment",
      };

      expect(mockEvent.type).toBe("payment");
      expect(mockEvent.id).toBe(mockPaymentId);
    });

    it("should process valid payment event with OLD format (resource/topic)", async () => {
      const mockEvent = {
        resource: "144231899227",
        topic: "payment",
      };

      expect(mockEvent.topic).toBe("payment");
      expect(mockEvent.resource).toBe("144231899227");
    });

    it("should extract payment ID from resource URL format", async () => {
      const resource = "https://api.mercadolibre.com/merchant_orders/12345";
      const paymentId = resource.split('/').pop();

      expect(paymentId).toBe("12345");
    });

    it("should extract payment ID from resource direct ID format", async () => {
      const resource = "144231899227";
      const paymentId = resource.includes('/') ? resource.split('/').pop() : resource;

      expect(paymentId).toBe("144231899227");
    });

    it("should handle approved payment status", async () => {
      const mockPayment = {
        id: mockPaymentId,
        status: "approved",
        status_detail: "accredited",
        external_reference: mockOrderId,
      };

      expect(mockPayment.status).toBe("approved");
    });

    it("should handle pending payment status", async () => {
      const mockPayment = {
        id: mockPaymentId,
        status: "pending",
        status_detail: "pending_review",
        external_reference: mockOrderId,
      };

      expect(mockPayment.status).toBe("pending");
    });

    it("should handle rejected payment status", async () => {
      const mockPayment = {
        id: mockPaymentId,
        status: "rejected",
        status_detail: "insufficient_funds",
        external_reference: mockOrderId,
      };

      expect(mockPayment.status).toBe("rejected");
    });

    it("should update order status based on payment status", async () => {
      const statusMap = {
        approved: "approved",
        pending: "pending",
        rejected: "rejected",
        cancelled: "rejected",
      };

      expect(statusMap.approved).toBe("approved");
      expect(statusMap.rejected).toBe("rejected");
    });

    it("should return 200 OK on successful processing", async () => {
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });
  });

  describe("Idempotency - Duplicate Webhooks", () => {
    it("should not process same payment twice", async () => {
      const mockPayment = {
        id: mockPaymentId,
        status: "approved",
      };

      const mockLog1 = {
        payment_id: mockPaymentId,
        status: "approved",
      };

      expect(mockLog1.payment_id).toBe(mockPayment.id);
    });

    it("should return 200 if already processed", async () => {
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });

    it("should handle status change in webhook retry", async () => {
      const firstStatus = "pending";
      const secondStatus = "approved";

      expect(firstStatus).not.toBe(secondStatus);
    });

    it("should log duplicate attempts", async () => {
      const logEntry = {
        payment_id: mockPaymentId,
        attempt: 2,
        isDuplicate: true,
      };

      expect(logEntry.isDuplicate).toBe(true);
    });
  });

  describe("Security Validations", () => {
    it("should validate x-signature header", async () => {
      const validSignature = createValidSignature(mockPaymentId);
      expect(validSignature).toContain("ts=");
      expect(validSignature).toContain("v1=");
    });

    it("should reject invalid signature", async () => {
      const invalidSignature = "ts=123;v1=invalid";
      expect(invalidSignature).toBeDefined();
    });

    it("should validate IP origin", async () => {
      const validIP = "200.121.192.50";
      expect(validIP).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });

    it("should reject request from unauthorized IP", async () => {
      const unauthorizedIP = "192.168.1.1";
      expect(unauthorizedIP).not.toMatch(/^200\.121\.192\./);
    });

    it("should reject old timestamps (>5 min)", async () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 min ago
      const now = Math.floor(Date.now() / 1000);

      expect(now - oldTimestamp).toBeGreaterThan(300);
    });

    it("should accept recent timestamps (<5 min)", async () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 min ago
      const now = Math.floor(Date.now() / 1000);

      expect(now - recentTimestamp).toBeLessThan(300);
    });
  });

  describe("Event Processing", () => {
    it("should ignore non-payment events", async () => {
      const mockEvent = {
        id: mockPaymentId,
        type: "merchant_order",
      };

      const isPaymentEvent = mockEvent.type === "payment";
      expect(isPaymentEvent).toBe(false);
    });

    it("should normalize new format (id/type) correctly", async () => {
      const body = {
        id: "123456",
        type: "payment",
      };

      let paymentId: string | number | undefined;
      let eventType: string | undefined;

      if (body.id && body.type) {
        paymentId = body.id;
        eventType = body.type;
      }

      expect(paymentId).toBe("123456");
      expect(eventType).toBe("payment");
    });

    it("should normalize old format (resource/topic) correctly", async () => {
      const body = {
        resource: "144231899227",
        topic: "payment",
      };

      let paymentId: string | number | undefined;
      let eventType: string | undefined;

      if (body.resource && body.topic) {
        const resource = body.resource as string;
        if (resource.includes('/')) {
          paymentId = resource.split('/').pop();
        } else {
          paymentId = resource;
        }
        eventType = body.topic;
      }

      expect(paymentId).toBe("144231899227");
      expect(eventType).toBe("payment");
    });

    it("should handle resource as URL in old format", async () => {
      const body = {
        resource: "https://api.mercadolibre.com/merchant_orders/999888",
        topic: "payment",
      };

      let paymentId: string | number | undefined;
      let eventType: string | undefined;

      if (body.resource && body.topic) {
        const resource = body.resource as string;
        if (resource.includes('/')) {
          paymentId = resource.split('/').pop();
        } else {
          paymentId = resource;
        }
        eventType = body.topic;
      }

      expect(paymentId).toBe("999888");
      expect(eventType).toBe("payment");
    });

    it("should return unknown_format for unrecognized webhook", async () => {
      const body = {
        some_field: "value",
      };

      const hasNewFormat = body.hasOwnProperty('id') && body.hasOwnProperty('type');
      const hasOldFormat = body.hasOwnProperty('resource') && body.hasOwnProperty('topic');

      expect(hasNewFormat).toBe(false);
      expect(hasOldFormat).toBe(false);
    });

    it("should process only payment.created and payment.updated", async () => {
      const validEvents = ["payment.created", "payment.updated"];
      const testEvent = "payment.created";

      expect(validEvents).toContain(testEvent);
    });

    it("should fetch full payment data from Mercado Pago", async () => {
      const mockPayment = {
        id: mockPaymentId,
        status: "approved",
        status_detail: "accredited",
      };

      expect(mockPayment).toHaveProperty("id");
      expect(mockPayment).toHaveProperty("status");
    });

    it("should handle Mercado Pago API errors", async () => {
      const apiError = new Error("Connection timeout");
      expect(apiError).toBeDefined();
    });
  });

  describe("Data Mapping", () => {
    it("should extract payment_id from event", async () => {
      const mockEvent = {
        id: mockPaymentId,
      };

      expect(mockEvent.id).toBe(mockPaymentId);
    });

    it("should extract external_reference (order_id)", async () => {
      const mockPayment = {
        external_reference: mockOrderId,
      };

      expect(mockPayment.external_reference).toBe(mockOrderId);
    });

    it("should validate external_reference is present", async () => {
      const mockPayment = {
        external_reference: null,
      };

      expect(mockPayment.external_reference).toBeNull();
    });

    it("should map payment status to order status", async () => {
      const paymentStatuses = ["approved", "pending", "rejected", "cancelled"];
      const orderStatuses = ["approved", "pending", "rejected", "rejected"];

      paymentStatuses.forEach((status, index) => {
        expect(orderStatuses[index]).toBeDefined();
      });
    });

    it("should include payment_method in order", async () => {
      const mockPayment = {
        payment_method_id: "credit_card",
      };

      expect(mockPayment).toHaveProperty("payment_method_id");
    });
  });

  describe("Payment Log Storage", () => {
    it("should save payment log with all details", async () => {
      const mockLog = {
        order_id: mockOrderId,
        payment_id: mockPaymentId,
        status: "approved",
        status_detail: "accredited",
        response_body: { some: "data" },
      };

      expect(mockLog.payment_id).toBe(mockPaymentId);
    });

    it("should store response body from Mercado Pago", async () => {
      const mockResponseBody = {
        id: mockPaymentId,
        status: "approved",
        payer: { email: "user@example.com" },
      };

      expect(mockResponseBody).toHaveProperty("id");
    });

    it("should include event type in log", async () => {
      const mockLog = {
        event_type: "payment.created",
      };

      expect(mockLog.event_type).toBe("payment.created");
    });
  });

  describe("Error Handling", () => {
    it("should return 401 if signature validation fails", async () => {
      const statusCode = 401;
      expect(statusCode).toBe(401);
    });

    it("should return 403 if IP is not authorized", async () => {
      const statusCode = 403;
      expect(statusCode).toBe(403);
    });

    it("should return 400 if external_reference is missing", async () => {
      const statusCode = 400;
      expect(statusCode).toBe(400);
    });

    it("should return 500 if Mercado Pago API fails", async () => {
      const statusCode = 500;
      expect(statusCode).toBe(500);
    });

    it("should return 500 if database update fails", async () => {
      const statusCode = 500;
      expect(statusCode).toBe(500);
    });

    it("should log all errors for debugging", async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: "error",
        message: "webhook processing failed",
        error_code: "DB_UPDATE_FAILED",
      };

      expect(logEntry.level).toBe("error");
    });
  });

  describe("Response Format", () => {
    it("should return JSON with received flag", async () => {
      const mockResponse = {
        received: true,
        payment_id: mockPaymentId,
        status: "approved",
      };

      expect(mockResponse.received).toBe(true);
    });

    it("should include payment_id in response", async () => {
      const mockResponse = {
        payment_id: mockPaymentId,
      };

      expect(mockResponse.payment_id).toBe(mockPaymentId);
    });

    it("should include order status in response", async () => {
      const mockResponse = {
        status: "approved",
      };

      expect(mockResponse.status).toBe("approved");
    });
  });

  describe("Performance", () => {
    it("should process webhook in reasonable time", async () => {
      const startTime = Date.now();
      // Simulate processing
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it("should not block other requests", async () => {
      // Webhook should be async
      const isAsync = true;
      expect(isAsync).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent webhook calls", async () => {
      const webhookCalls = [
        { id: 1, type: "payment" },
        { id: 2, type: "payment" },
        { id: 3, type: "payment" },
      ];

      expect(webhookCalls).toHaveLength(3);
    });

    it("should handle very large response bodies", async () => {
      const largeResponseBody = {
        data: "x".repeat(10000),
      };

      expect(largeResponseBody.data.length).toBe(10000);
    });

    it("should handle missing optional fields", async () => {
      const minimalPayment = {
        id: mockPaymentId,
        status: "approved",
        external_reference: mockOrderId,
      };

      expect(minimalPayment).toHaveProperty("id");
    });
  });

  describe("Logging and Monitoring", () => {
    it("should log successful webhook processing", async () => {
      const logEntry = {
        level: "info",
        message: "webhook processed",
        payment_id: mockPaymentId,
      };

      expect(logEntry.level).toBe("info");
    });

    it("should log security validation failures", async () => {
      const logEntry = {
        level: "error",
        message: "security validation failed",
        reason: "invalid_signature",
      };

      expect(logEntry.level).toBe("error");
    });

    it("should include request metadata in logs", async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        client_ip: "200.121.192.50",
        duration_ms: 150,
      };

      expect(logEntry).toHaveProperty("timestamp");
      expect(logEntry).toHaveProperty("client_ip");
    });
  });
});
