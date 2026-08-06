import { beforeEach, describe, expect, it, vi } from "vitest";

const { featureFlags, cookieStore, cookiesMock, mockRepo } = vi.hoisted(() => ({
  featureFlags: {
    isCheckoutAvailable: true,
  },
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
  },
  cookiesMock: vi.fn(),
  mockRepo: {
    getOrCreateCart: vi.fn(),
    getCartWithItems: vi.fn(),
    addItem: vi.fn(),
    updateCartTotal: vi.fn(),
    removeItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    clearCart: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/config/features", () => ({
  get IS_PUBLIC_CHECKOUT_AVAILABLE() {
    return featureFlags.isCheckoutAvailable;
  },
}));

vi.mock("@/lib/repositories/cart.repository", () => ({
  CartRepository: vi.fn(() => mockRepo),
}));

import {
  addToCart,
  clearCart,
  createOrGetCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "./actions";

describe("cart server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    featureFlags.isCheckoutAvailable = true;

    cookieStore.get.mockReturnValue({ value: "session-123" });
    cookiesMock.mockResolvedValue(cookieStore);

    mockRepo.getOrCreateCart.mockResolvedValue({
      id: "cart-123",
      user_id: null,
      session_id: "session-123",
      total_amount: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      expires_at: "2026-01-08T00:00:00.000Z",
    });
    mockRepo.getCartWithItems.mockResolvedValue({
      id: "cart-123",
      user_id: null,
      session_id: "session-123",
      total_amount: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      expires_at: "2026-01-08T00:00:00.000Z",
      items: [],
    });
    mockRepo.addItem.mockResolvedValue({
      id: "item-123",
      cart_id: "cart-123",
      variacion_id: "var-123",
      quantity: 1,
      price_at_addition: 100,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    mockRepo.updateItemQuantity.mockResolvedValue({
      id: "item-123",
      cart_id: "cart-123",
      variacion_id: "var-123",
      quantity: 2,
      price_at_addition: 100,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
  });

  it("returns an inert cart without touching cookies or repository when checkout is disabled", async () => {
    featureFlags.isCheckoutAvailable = false;

    const cart = await getCart();

    expect(cart.items).toEqual([]);
    expect(cart.total_amount).toBe(0);
    expect(cookiesMock).not.toHaveBeenCalled();
    expect(mockRepo.getCartWithItems).not.toHaveBeenCalled();
  });

  it("blocks addToCart when checkout is disabled", async () => {
    featureFlags.isCheckoutAvailable = false;

    await expect(addToCart("var-123", 1, 100)).rejects.toThrow(
      "El checkout está temporalmente deshabilitado",
    );
    expect(cookiesMock).not.toHaveBeenCalled();
    expect(mockRepo.getOrCreateCart).not.toHaveBeenCalled();
    expect(mockRepo.addItem).not.toHaveBeenCalled();
  });

  it("blocks update, remove, clear and createOrGetCart when checkout is disabled", async () => {
    featureFlags.isCheckoutAvailable = false;

    await expect(updateCartQuantity("item-123", 2)).rejects.toThrow(
      "El checkout está temporalmente deshabilitado",
    );
    await expect(removeFromCart("item-123")).rejects.toThrow(
      "El checkout está temporalmente deshabilitado",
    );
    await expect(clearCart()).rejects.toThrow(
      "El checkout está temporalmente deshabilitado",
    );
    await expect(createOrGetCart()).rejects.toThrow(
      "El checkout está temporalmente deshabilitado",
    );

    expect(cookiesMock).not.toHaveBeenCalled();
    expect(mockRepo.updateItemQuantity).not.toHaveBeenCalled();
    expect(mockRepo.removeItem).not.toHaveBeenCalled();
    expect(mockRepo.clearCart).not.toHaveBeenCalled();
    expect(mockRepo.getOrCreateCart).not.toHaveBeenCalled();
  });

  it("preserves addToCart behavior when checkout is enabled", async () => {
    const item = await addToCart("var-123", 1, 100);

    expect(cookiesMock).toHaveBeenCalled();
    expect(mockRepo.getOrCreateCart).toHaveBeenCalledWith("session-123");
    expect(mockRepo.addItem).toHaveBeenCalledWith("cart-123", "var-123", 1, 100);
    expect(mockRepo.updateCartTotal).toHaveBeenCalledWith("cart-123");
    expect(item.id).toBe("item-123");
  });
});
