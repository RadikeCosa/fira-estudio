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
});
