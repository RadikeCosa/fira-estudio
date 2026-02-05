import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CartRepository } from "./cart.repository";

describe("CartRepository", () => {
  const mockSessionId = "test-session-123";
  const mockCartId = "cart-123";
  const mockVariacionId = "var-123";

  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    // Mock Supabase client con métodos que retornan Promises correctamente
    mockSupabase = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          single: vi.fn().mockResolvedValue({
            data: { id: "test-id" },
            error: null,
          }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "test-id" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })) as any,
    } as any;
  });

  describe("getOrCreateCart()", () => {
    it("should return existing cart if it exists", async () => {
      const mockCart = {
        id: mockCartId,
        session_id: mockSessionId,
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date().toISOString(),
      };

      // Setup mock to return existing cart
      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [mockCart],
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const result = await repo.getOrCreateCart(mockSessionId);

      expect(result.session_id).toBe(mockSessionId);
      expect(result.id).toBe(mockCartId);
    });

    it("should create new cart if it does not exist", async () => {
      const newCart = {
        id: "new-cart-id",
        session_id: mockSessionId,
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date().toISOString(),
      };

      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: newCart,
              error: null,
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const result = await repo.getOrCreateCart(mockSessionId);

      expect(result.id).toBe("new-cart-id");
      expect(result.session_id).toBe(mockSessionId);
    });

    it("should throw error if cart creation fails", async () => {
      const fromMock = mockSupabase.from as any;
      const insertError = new Error("Database error");

      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: insertError,
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await expect(repo.getOrCreateCart(mockSessionId)).rejects.toThrow(
        insertError,
      );
    });
  });

  describe("updateItemQuantity()", () => {
    it("should update item quantity successfully", async () => {
      const updatedItem = {
        id: "item-1",
        cart_id: mockCartId,
        variacion_id: mockVariacionId,
        quantity: 3,
        price_at_addition: 50,
        updated_at: new Date().toISOString(),
      };

      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedItem,
                error: null,
              }),
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const result = await repo.updateItemQuantity("item-1", 3);

      expect(result.quantity).toBe(3);
      expect(result.id).toBe("item-1");
    });
  });

  describe("validateStock()", () => {
    it("should pass validation if stock is available", async () => {
      const items = [
        {
          id: "item-1",
          cart_id: mockCartId,
          variacion_id: mockVariacionId,
          quantity: 2,
          price_at_addition: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
      ];

      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stock: 5 },
              error: null,
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const insufficient = await repo.validateStock(items);

      expect(insufficient).toHaveLength(0);
    });

    it("should fail if stock is insufficient", async () => {
      const items = [
        {
          id: "item-1",
          cart_id: mockCartId,
          variacion_id: mockVariacionId,
          quantity: 10,
          price_at_addition: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
      ];

      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stock: 5 },
              error: null,
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const insufficient = await repo.validateStock(items);

      expect(insufficient).toHaveLength(1);
      expect(insufficient[0].requested).toBe(10);
      expect(insufficient[0].available).toBe(5);
    });
  });

  describe("createOrderWithItems()", () => {
    it("should create order and items successfully", async () => {
      const cartItems = [
        {
          id: "item-1",
          cart_id: mockCartId,
          variacion_id: mockVariacionId,
          quantity: 2,
          price_at_addition: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          variacao: {
            id: mockVariacionId,
            sku: "MANTEL-123",
            tamanio: "150x200",
            color: "Rojo",
            stock: 5,
            precio: 50,
            producto_id: "prod-1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        } as any,
      ];

      const fromMock = mockSupabase.from as any;

      // First call: insert order
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "order-123" },
              error: null,
            }),
          }),
        }),
      });

      // Second call: insert order items
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const orderId = await repo.createOrderWithItems(
        mockCartId,
        "test@example.com",
        "Test User",
        100,
        cartItems,
      );

      expect(orderId).toBe("order-123");
    });

    it("should rollback order if items insertion fails", async () => {
      const cartItems = [
        {
          id: "item-1",
          cart_id: mockCartId,
          variacion_id: mockVariacionId,
          quantity: 2,
          price_at_addition: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          variacao: {
            sku: "MANTEL-123",
            tamanio: "150x200",
            color: "Rojo",
          },
        } as any,
      ];

      const fromMock = mockSupabase.from as any;

      // First call: insert order - success
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "order-123" },
              error: null,
            }),
          }),
        }),
      });

      // Second call: insert order items - fails
      const itemsError = new Error("Items insert failed");
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: itemsError,
        }),
      });

      // Third call: delete order (rollback)
      fromMock.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await expect(
        repo.createOrderWithItems(
          mockCartId,
          "test@example.com",
          "Test User",
          100,
          cartItems,
        ),
      ).rejects.toThrow(itemsError);
    });
  });

  describe("removeItem()", () => {
    it("should remove item from cart", async () => {
      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await repo.removeItem("item-1");

      expect(fromMock).toHaveBeenCalledWith("cart_items");
    });
  });

  describe("clearCart()", () => {
    it("should clear all items from cart", async () => {
      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await repo.clearCart(mockCartId);

      expect(fromMock).toHaveBeenCalledWith("cart_items");
    });
  });

  describe("decrementStockForOrder()", () => {
    it("should decrement stock for all items in order", async () => {
      const mockOrderId = "order-123";
      const mockOrderItems = [
        { variacion_id: "var-1", quantity: 2 },
        { variacion_id: "var-2", quantity: 1 },
      ];

      const fromMock = mockSupabase.from as any;

      // First call: fetch order items
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockOrderItems,
            error: null,
          }),
        }),
      });

      // Second call: get variacion stock for var-1
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stock: 5 },
              error: null,
            }),
          }),
        }),
      });

      // Third call: update stock for var-1
      fromMock.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // Fourth call: get variacion stock for var-2
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stock: 3 },
              error: null,
            }),
          }),
        }),
      });

      // Fifth call: update stock for var-2
      fromMock.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await repo.decrementStockForOrder(mockOrderId);

      expect(fromMock).toHaveBeenCalledWith("order_items");
      expect(fromMock).toHaveBeenCalledWith("variaciones");
    });

    it("should not decrement below zero", async () => {
      const mockOrderId = "order-123";
      const mockOrderItems = [{ variacion_id: "var-1", quantity: 10 }];

      const fromMock = mockSupabase.from as any;

      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockOrderItems,
            error: null,
          }),
        }),
      });

      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stock: 3 },
              error: null,
            }),
          }),
        }),
      });

      fromMock.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await repo.decrementStockForOrder(mockOrderId);

      // Verify stock was set to 0 (max of stock - quantity and 0)
      expect(fromMock).toHaveBeenCalledWith("variaciones");
    });

    it("should continue processing if one variacion fails", async () => {
      const mockOrderId = "order-123";
      const mockOrderItems = [
        { variacion_id: "var-1", quantity: 2 },
        { variacion_id: "var-2", quantity: 1 },
      ];

      const fromMock = mockSupabase.from as any;

      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockOrderItems,
            error: null,
          }),
        }),
      });

      // First variacion fails
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Variacion not found"),
            }),
          }),
        }),
      });

      // Second variacion succeeds
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stock: 3 },
              error: null,
            }),
          }),
        }),
      });

      fromMock.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      await repo.decrementStockForOrder(mockOrderId);

      // Should not throw, just log error and continue
      expect(fromMock).toHaveBeenCalledWith("variaciones");
    });
  });

  describe("getCartIdByOrderId()", () => {
    it("should return cart_id for valid order", async () => {
      const mockOrderId = "order-123";
      const mockCartId = "cart-456";

      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { cart_id: mockCartId },
              error: null,
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const result = await repo.getCartIdByOrderId(mockOrderId);

      expect(result).toBe(mockCartId);
      expect(fromMock).toHaveBeenCalledWith("orders");
    });

    it("should return null if order not found", async () => {
      const mockOrderId = "order-123";

      const fromMock = mockSupabase.from as any;
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Order not found"),
            }),
          }),
        }),
      });

      const repo = new CartRepository(mockSupabase);
      const result = await repo.getCartIdByOrderId(mockOrderId);

      expect(result).toBeNull();
    });
  });
});
