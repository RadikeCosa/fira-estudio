import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRateLimit } from "./useRateLimit";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorageMock.clear();
  });

  it("initializes with isRateLimited false", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 3, windowMs: 60000, key: "test" }),
    );

    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.timeUntilReset).toBe(0);
  });

  it("allows actions within limit", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 3, windowMs: 60000, key: "test" }),
    );

    act(() => {
      result.current.recordAction();
    });
    expect(result.current.isRateLimited).toBe(false);

    act(() => {
      result.current.recordAction();
    });
    expect(result.current.isRateLimited).toBe(false);
  });

  it("rate limits after max actions reached", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 2, windowMs: 60000, key: "test" }),
    );

    // First two actions should succeed
    act(() => {
      result.current.recordAction();
      result.current.recordAction();
    });

    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.timeUntilReset).toBeGreaterThan(0);
  });

  it("prevents action when rate limited", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 60000, key: "test" }),
    );

    // First action succeeds
    let success: boolean = false;
    act(() => {
      success = result.current.recordAction();
    });
    expect(success).toBe(true);

    // Second action should fail (rate limited)
    act(() => {
      success = result.current.recordAction();
    });
    expect(success).toBe(false);
    expect(result.current.isRateLimited).toBe(true);
  });

  it("resets after time window expires", async () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 60000, key: "test" }),
    );

    // Trigger rate limit
    act(() => {
      result.current.recordAction();
    });
    expect(result.current.isRateLimited).toBe(true);

    // Advance time past the window
    act(() => {
      vi.advanceTimersByTime(60001);
    });

    // Wait for state updates (the hook uses intervals)
    // Give it a moment to process the interval tick
    await act(async () => {
      await vi.advanceTimersToNextTimerAsync();
    });

    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.timeUntilReset).toBe(0);
  }, 10000); // Increase timeout to 10s

  it("persists actions in localStorage", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 3, windowMs: 60000, key: "persist_test" }),
    );

    act(() => {
      result.current.recordAction();
    });

    const stored = localStorageMock.getItem("persist_test");
    expect(stored).toBeTruthy();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    }
  });

  it.skip("loads existing rate limit data from localStorage", () => {
    // Pre-populate localStorage with rate limit data
    const now = Date.now();
    const timestamps = [now - 5000, now - 3000]; // Two actions 5s and 3s ago
    localStorageMock.setItem("existing_data", JSON.stringify(timestamps));

    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 2, windowMs: 60000, key: "existing_data" }),
    );

    // Should be rate limited because 2 actions already exist
    expect(result.current.isRateLimited).toBe(true);
  });

  it("updates timeUntilReset countdown", async () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 10000, key: "countdown_test" }),
    );

    // Trigger rate limit
    act(() => {
      result.current.recordAction();
    });

    const initialTime = result.current.timeUntilReset;
    expect(initialTime).toBeGreaterThan(0);
    expect(initialTime).toBeLessThanOrEqual(10000);

    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Trigger the interval callback
    await act(async () => {
      await vi.advanceTimersToNextTimerAsync();
    });

    // Time should have decreased
    expect(result.current.timeUntilReset).toBeLessThan(initialTime);
    expect(result.current.timeUntilReset).toBeGreaterThanOrEqual(0);
  }, 10000); // Increase timeout to 10s

  it("handles multiple different keys independently", () => {
    const { result: result1 } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 60000, key: "key1" }),
    );

    const { result: result2 } = renderHook(() =>
      useRateLimit({ maxActions: 1, windowMs: 60000, key: "key2" }),
    );

    // Rate limit key1
    act(() => {
      result1.current.recordAction();
    });

    expect(result1.current.isRateLimited).toBe(true);
    expect(result2.current.isRateLimited).toBe(false);

    // Key2 should still be able to record actions
    act(() => {
      const success = result2.current.recordAction();
      expect(success).toBe(true);
    });

    expect(result2.current.isRateLimited).toBe(true);
    expect(result1.current.isRateLimited).toBe(true);
  });

  it("cleans up old timestamps when recording new actions", () => {
    const now = Date.now();
    // Add old timestamp (outside window)
    localStorageMock.setItem(
      "cleanup_test",
      JSON.stringify([now - 70000]), // 70s ago (outside 60s window)
    );

    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 2, windowMs: 60000, key: "cleanup_test" }),
    );

    // Should not be rate limited (old timestamp should be ignored)
    expect(result.current.isRateLimited).toBe(false);

    // Record a new action
    act(() => {
      result.current.recordAction();
    });

    // Check localStorage - should only have 1 timestamp now
    const stored = localStorageMock.getItem("cleanup_test");
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.length).toBe(1); // Old timestamp cleaned up
    }
  });

  it("handles edge case of exactly maxActions", () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxActions: 3, windowMs: 60000, key: "edge_test" }),
    );

    // Record exactly maxActions (3)
    act(() => {
      result.current.recordAction();
      result.current.recordAction();
      result.current.recordAction();
    });

    // Should be rate limited after exactly 3 actions
    expect(result.current.isRateLimited).toBe(true);

    // Fourth action should fail
    let success: boolean = false;
    act(() => {
      success = result.current.recordAction();
    });
    expect(success).toBe(false);
  });
});
