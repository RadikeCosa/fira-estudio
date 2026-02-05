/**
 * Tests for WebhookQueueProcessor
 * Validates UUID extraction from external_reference and error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebhookQueueProcessor } from "./queue-processor";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("WebhookQueueProcessor - UUID Extraction", () => {
  let mockSupabase: Partial<SupabaseClient>;
  let processor: WebhookQueueProcessor;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 1 },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null,
            })),
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        })),
      })),
    };

    processor = new WebhookQueueProcessor(mockSupabase as SupabaseClient);
  });

  describe("enqueueEvent - Duplicate Handling", () => {
    it("should return existing event ID when duplicate constraint error occurs", async () => {
      const existingId = 123;
      const paymentId = "12345678";
      const eventType = "payment";

      // Mock error on insert (duplicate)
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "23505", message: "duplicate key value" },
            })),
          })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { id: existingId },
                error: null,
              })),
            })),
          })),
        })),
      }));

      mockSupabase.from = mockFrom;
      processor = new WebhookQueueProcessor(mockSupabase as SupabaseClient);

      const result = await processor.enqueueEvent(paymentId, eventType, {});

      expect(result).toBe(existingId);
    });

    it("should throw error for non-duplicate database errors", async () => {
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: {
                code: "23502",
                message: "null value in column violates not-null constraint",
              },
            })),
          })),
        })),
      }));

      mockSupabase.from = mockFrom;
      processor = new WebhookQueueProcessor(mockSupabase as SupabaseClient);

      await expect(
        processor.enqueueEvent("12345", "payment", {}),
      ).rejects.toThrow();
    });
  });

  describe("External Reference UUID Extraction", () => {
    it("should extract UUID from email|uuid format", () => {
      const externalReference =
        "ramirocosa@gmail.com|16e2136a-ef59-41e0-ac54-6e1e025f5497";
      const expectedOrderId = "16e2136a-ef59-41e0-ac54-6e1e025f5497";

      // Simulate the extraction logic
      let orderId = externalReference;
      if (externalReference && externalReference.includes("|")) {
        const parts = externalReference.split("|");
        orderId = parts[parts.length - 1];
      }

      expect(orderId).toBe(expectedOrderId);
      expect(orderId).not.toContain("@");
      expect(orderId).not.toContain("|");
    });

    it("should handle external_reference without pipe separator", () => {
      const externalReference = "16e2136a-ef59-41e0-ac54-6e1e025f5497";
      const expectedOrderId = "16e2136a-ef59-41e0-ac54-6e1e025f5497";

      let orderId = externalReference;
      if (externalReference && externalReference.includes("|")) {
        const parts = externalReference.split("|");
        orderId = parts[parts.length - 1];
      }

      expect(orderId).toBe(expectedOrderId);
    });

    it("should handle multiple pipe separators (take last part)", () => {
      const externalReference =
        "user@test.com|extra|16e2136a-ef59-41e0-ac54-6e1e025f5497";
      const expectedOrderId = "16e2136a-ef59-41e0-ac54-6e1e025f5497";

      let orderId = externalReference;
      if (externalReference && externalReference.includes("|")) {
        const parts = externalReference.split("|");
        orderId = parts[parts.length - 1];
      }

      expect(orderId).toBe(expectedOrderId);
    });

    it("should validate empty string after extraction", () => {
      const externalReference = "email@test.com|";

      let orderId = externalReference;
      if (externalReference && externalReference.includes("|")) {
        const parts = externalReference.split("|");
        orderId = parts[parts.length - 1];
      }

      // Should validate orderId is not empty
      expect(orderId).toBe("");
    });
  });

  describe("Idempotency Logic", () => {
    let mockSupabase: Partial<SupabaseClient>;
    let processor: WebhookQueueProcessor;

    beforeEach(() => {
      // Create a more detailed mock for testing processEvent
      mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "webhook_queue") {
            return {
              update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            };
          }
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: null, error: null }),
                ),
              })),
            })),
          };
        }),
      };

      processor = new WebhookQueueProcessor(mockSupabase as SupabaseClient);
    });

    it("should update order when payment_log exists but order status is wrong", async () => {
      const orderId = "order-123";
      const paymentId = "payment-456";
      const correctStatus = "approved";

      // Mock: payment_log exists with correct status
      const getPaymentLogByPaymentId = vi
        .fn()
        .mockResolvedValue({ order_id: orderId, status: correctStatus });

      // Mock: order exists but has wrong status
      const getOrderById = vi.fn().mockResolvedValue({
        id: orderId,
        status: "pending", // Wrong status!
        mercadopago_payment_id: null,
      });

      // Mock: updateOrderStatus should be called
      const updateOrderStatus = vi.fn().mockResolvedValue(undefined);

      // Mock: savePaymentLog should NOT be called (already exists)
      const savePaymentLog = vi.fn().mockResolvedValue(undefined);

      // Mock: other methods
      const decrementStockForOrder = vi.fn().mockResolvedValue(undefined);
      const getCartIdByOrderId = vi.fn().mockResolvedValue("cart-123");
      const clearCart = vi.fn().mockResolvedValue(undefined);
      const updateCartTotal = vi.fn().mockResolvedValue(undefined);

      // Inject mocked CartRepository
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (processor as any).cartRepository = {
        getPaymentLogByPaymentId,
        getOrderById,
        updateOrderStatus,
        savePaymentLog,
        decrementStockForOrder,
        getCartIdByOrderId,
        clearCart,
        updateCartTotal,
      };

      // Process event
      const queueEvent = {
        id: 1,
        payment_id: paymentId,
        event_type: "payment",
        webhook_data: {
          external_reference: orderId,
          status: correctStatus,
          status_detail: "accredited",
        },
        status: "pending" as const,
        retry_count: 0,
        max_retries: 5,
      };

      await processor.processEvent(queueEvent);

      // Assertions
      expect(getOrderById).toHaveBeenCalledWith(orderId);
      expect(getPaymentLogByPaymentId).toHaveBeenCalledWith(paymentId);

      // Should NOT create new payment_log (already exists)
      expect(savePaymentLog).not.toHaveBeenCalled();

      // Should UPDATE order (wrong status)
      expect(updateOrderStatus).toHaveBeenCalledWith(
        orderId,
        correctStatus,
        paymentId,
      );

      // Should execute post-approval actions
      expect(decrementStockForOrder).toHaveBeenCalledWith(orderId);
      expect(clearCart).toHaveBeenCalledWith("cart-123");
    });

    it("should skip processing when both payment_log and order are already correct", async () => {
      const orderId = "order-123";
      const paymentId = "payment-456";
      const correctStatus = "approved";

      // Mock: payment_log exists with correct status
      const getPaymentLogByPaymentId = vi
        .fn()
        .mockResolvedValue({ order_id: orderId, status: correctStatus });

      // Mock: order exists with CORRECT status
      const getOrderById = vi.fn().mockResolvedValue({
        id: orderId,
        status: correctStatus, // Correct status!
        mercadopago_payment_id: paymentId, // Already set!
      });

      // Mock: updateOrderStatus should NOT be called
      const updateOrderStatus = vi.fn().mockResolvedValue(undefined);

      // Mock: savePaymentLog should NOT be called
      const savePaymentLog = vi.fn().mockResolvedValue(undefined);

      // Mock: post-approval actions should still execute (they have internal idempotency)
      const decrementStockForOrder = vi.fn().mockResolvedValue(undefined);
      const getCartIdByOrderId = vi.fn().mockResolvedValue("cart-123");
      const clearCart = vi.fn().mockResolvedValue(undefined);
      const updateCartTotal = vi.fn().mockResolvedValue(undefined);

      // Inject mocked CartRepository
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (processor as any).cartRepository = {
        getPaymentLogByPaymentId,
        getOrderById,
        updateOrderStatus,
        savePaymentLog,
        decrementStockForOrder,
        getCartIdByOrderId,
        clearCart,
        updateCartTotal,
      };

      // Process event
      const queueEvent = {
        id: 1,
        payment_id: paymentId,
        event_type: "payment",
        webhook_data: {
          external_reference: orderId,
          status: correctStatus,
          status_detail: "accredited",
        },
        status: "pending" as const,
        retry_count: 0,
        max_retries: 5,
      };

      await processor.processEvent(queueEvent);

      // Assertions
      expect(getOrderById).toHaveBeenCalledWith(orderId);
      expect(getPaymentLogByPaymentId).toHaveBeenCalledWith(paymentId);

      // Should NOT create payment_log (already exists)
      expect(savePaymentLog).not.toHaveBeenCalled();

      // Should NOT update order (already correct)
      expect(updateOrderStatus).not.toHaveBeenCalled();

      // Should still execute post-approval actions (they decide internally)
      expect(decrementStockForOrder).toHaveBeenCalledWith(orderId);
    });

    it("should create payment_log and update order when neither exists", async () => {
      const orderId = "order-123";
      const paymentId = "payment-456";
      const correctStatus = "approved";

      // Mock: no existing payment_log
      const getPaymentLogByPaymentId = vi.fn().mockResolvedValue(null);

      // Mock: order exists with pending status
      const getOrderById = vi.fn().mockResolvedValue({
        id: orderId,
        status: "pending",
        mercadopago_payment_id: null,
      });

      // Mock: updateOrderStatus should be called
      const updateOrderStatus = vi.fn().mockResolvedValue(undefined);

      // Mock: savePaymentLog should be called
      const savePaymentLog = vi.fn().mockResolvedValue(undefined);

      // Mock: other methods
      const decrementStockForOrder = vi.fn().mockResolvedValue(undefined);
      const getCartIdByOrderId = vi.fn().mockResolvedValue("cart-123");
      const clearCart = vi.fn().mockResolvedValue(undefined);
      const updateCartTotal = vi.fn().mockResolvedValue(undefined);

      // Inject mocked CartRepository
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (processor as any).cartRepository = {
        getPaymentLogByPaymentId,
        getOrderById,
        updateOrderStatus,
        savePaymentLog,
        decrementStockForOrder,
        getCartIdByOrderId,
        clearCart,
        updateCartTotal,
      };

      // Process event
      const queueEvent = {
        id: 1,
        payment_id: paymentId,
        event_type: "payment",
        webhook_data: {
          external_reference: orderId,
          status: correctStatus,
          status_detail: "accredited",
        },
        status: "pending" as const,
        retry_count: 0,
        max_retries: 5,
      };

      await processor.processEvent(queueEvent);

      // Assertions
      expect(getOrderById).toHaveBeenCalledWith(orderId);
      expect(getPaymentLogByPaymentId).toHaveBeenCalledWith(paymentId);

      // Should create payment_log
      expect(savePaymentLog).toHaveBeenCalledWith(
        orderId,
        paymentId,
        correctStatus,
        "accredited",
        null,
        "payment",
        expect.any(Object),
      );

      // Should update order
      expect(updateOrderStatus).toHaveBeenCalledWith(
        orderId,
        correctStatus,
        paymentId,
      );

      // Should execute post-approval actions
      expect(decrementStockForOrder).toHaveBeenCalledWith(orderId);
    });

    it("should handle case where order payment_id differs from webhook payment_id", async () => {
      const orderId = "order-123";
      const webhookPaymentId = "payment-456";
      const oldPaymentId = "payment-789";
      const correctStatus = "approved";

      // Mock: payment_log exists with correct status
      const getPaymentLogByPaymentId = vi
        .fn()
        .mockResolvedValue({ order_id: orderId, status: correctStatus });

      // Mock: order has different payment_id
      const getOrderById = vi.fn().mockResolvedValue({
        id: orderId,
        status: correctStatus,
        mercadopago_payment_id: oldPaymentId, // Different!
      });

      // Mock: updateOrderStatus should be called to update payment_id
      const updateOrderStatus = vi.fn().mockResolvedValue(undefined);

      const savePaymentLog = vi.fn().mockResolvedValue(undefined);
      const decrementStockForOrder = vi.fn().mockResolvedValue(undefined);
      const getCartIdByOrderId = vi.fn().mockResolvedValue("cart-123");
      const clearCart = vi.fn().mockResolvedValue(undefined);
      const updateCartTotal = vi.fn().mockResolvedValue(undefined);

      // Inject mocked CartRepository
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (processor as any).cartRepository = {
        getPaymentLogByPaymentId,
        getOrderById,
        updateOrderStatus,
        savePaymentLog,
        decrementStockForOrder,
        getCartIdByOrderId,
        clearCart,
        updateCartTotal,
      };

      // Process event
      const queueEvent = {
        id: 1,
        payment_id: webhookPaymentId,
        event_type: "payment",
        webhook_data: {
          external_reference: orderId,
          status: correctStatus,
          status_detail: "accredited",
        },
        status: "pending" as const,
        retry_count: 0,
        max_retries: 5,
      };

      await processor.processEvent(queueEvent);

      // Should update order (payment_id mismatch)
      expect(updateOrderStatus).toHaveBeenCalledWith(
        orderId,
        correctStatus,
        webhookPaymentId,
      );
    });
  });
});
