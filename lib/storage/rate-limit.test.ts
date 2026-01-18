import assert from "node:assert/strict";
import { describe, it, beforeEach, mock } from "node:test";

import {
  getRateLimitData,
  setRateLimitData,
  checkRateLimit,
  recordAction,
  getTimeUntilReset,
} from "./rate-limit";

// Mock localStorage for tests
const createMockStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: mock.fn((key: string) => storage[key] || null),
    setItem: mock.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
  };
};

describe("Rate Limit Storage", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      localStorage: mockStorage as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  });

  describe("getRateLimitData", () => {
    it("returns empty array when no data exists", () => {
      const result = getRateLimitData("test_key");
      assert.deepEqual(result, []);
    });

    it("returns parsed timestamps array", () => {
      const timestamps = [1000, 2000, 3000];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = getRateLimitData("test_key");
      assert.deepEqual(result, timestamps);
    });

    it("returns empty array when localStorage unavailable", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = { localStorage: null };

      const result = getRateLimitData("test_key");
      assert.deepEqual(result, []);
    });

    it("returns empty array when data is invalid JSON", () => {
      mockStorage.setItem("test_key", "invalid json");

      const result = getRateLimitData("test_key");
      assert.deepEqual(result, []);
    });

    it("returns empty array when data is not an array", () => {
      mockStorage.setItem("test_key", JSON.stringify({ not: "array" }));

      const result = getRateLimitData("test_key");
      assert.deepEqual(result, []);
    });
  });

  describe("setRateLimitData", () => {
    it("stores timestamps array in localStorage", () => {
      const timestamps = [1000, 2000, 3000];
      setRateLimitData("test_key", timestamps);

      const stored = mockStorage.getItem("test_key");
      assert.equal(stored, JSON.stringify(timestamps));
    });

    it("handles localStorage unavailable gracefully", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = { localStorage: null };

      // Should not throw
      setRateLimitData("test_key", [1000]);
    });
  });

  describe("checkRateLimit", () => {
    it("returns false when no actions recorded", () => {
      const result = checkRateLimit("test_key", 5, 60000);
      assert.equal(result, false);
    });

    it("returns false when under limit", () => {
      const now = Date.now();
      const timestamps = [now - 1000, now - 2000];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = checkRateLimit("test_key", 5, 60000);
      assert.equal(result, false);
    });

    it("returns true when at limit", () => {
      const now = Date.now();
      const timestamps = [now - 1000, now - 2000, now - 3000, now - 4000, now - 5000];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = checkRateLimit("test_key", 5, 60000);
      assert.equal(result, true);
    });

    it("returns true when over limit", () => {
      const now = Date.now();
      const timestamps = [
        now - 1000,
        now - 2000,
        now - 3000,
        now - 4000,
        now - 5000,
        now - 6000,
      ];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = checkRateLimit("test_key", 5, 60000);
      assert.equal(result, true);
    });

    it("ignores old timestamps outside window", () => {
      const now = Date.now();
      const timestamps = [
        now - 1000, // Recent
        now - 70000, // Old (outside 60s window)
        now - 80000, // Old
      ];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = checkRateLimit("test_key", 5, 60000);
      assert.equal(result, false);
    });

    it("returns false on error (fail open)", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = { localStorage: null };

      const result = checkRateLimit("test_key", 5, 60000);
      assert.equal(result, false);
    });
  });

  describe("recordAction", () => {
    it("records new timestamp", () => {
      const now = Date.now();
      recordAction("test_key", 60000);

      const stored = getRateLimitData("test_key");
      assert.equal(stored.length, 1);
      assert.ok(stored[0] >= now);
    });

    it("appends to existing timestamps", () => {
      const now = Date.now();
      const existing = [now - 1000];
      mockStorage.setItem("test_key", JSON.stringify(existing));

      recordAction("test_key", 60000);

      const stored = getRateLimitData("test_key");
      assert.equal(stored.length, 2);
    });

    it("cleans up old timestamps", () => {
      const now = Date.now();
      const timestamps = [now - 1000, now - 70000, now - 80000];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      recordAction("test_key", 60000);

      const stored = getRateLimitData("test_key");
      // Should only keep recent timestamp + new one
      assert.equal(stored.length, 2);
      assert.ok(stored.every((ts) => now - ts < 60000));
    });

    it("handles localStorage unavailable gracefully", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = { localStorage: null };

      // Should not throw, returns true (graceful degradation)
      const result = recordAction("test_key", 60000);
      assert.equal(result, true);
    });
  });

  describe("getTimeUntilReset", () => {
    it("returns 0 when no timestamps", () => {
      const result = getTimeUntilReset("test_key", 60000);
      assert.equal(result, 0);
    });

    it("returns 0 when all timestamps expired", () => {
      const now = Date.now();
      const timestamps = [now - 70000, now - 80000];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = getTimeUntilReset("test_key", 60000);
      assert.equal(result, 0);
    });

    it("returns time until oldest timestamp expires", () => {
      const now = Date.now();
      const oldestAge = 50000; // 50 seconds ago
      const timestamps = [now - oldestAge, now - 1000];
      mockStorage.setItem("test_key", JSON.stringify(timestamps));

      const result = getTimeUntilReset("test_key", 60000);

      // Should be approximately 10 seconds (60s - 50s)
      assert.ok(result > 9000 && result <= 10000);
    });

    it("returns 0 on error", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = { localStorage: null };

      const result = getTimeUntilReset("test_key", 60000);
      assert.equal(result, 0);
    });
  });
});
