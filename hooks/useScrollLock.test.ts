import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
  let originalOverflow: string;

  beforeEach(() => {
    // Store original overflow style
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    // Restore original overflow style
    document.body.style.overflow = originalOverflow;
  });

  it("locks body scroll when isLocked is true", () => {
    renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not lock body scroll when isLocked is false", () => {
    document.body.style.overflow = "auto";
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores original overflow value on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });

  it("updates scroll lock when isLocked changes", () => {
    document.body.style.overflow = "auto";
    const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: false },
    });

    expect(document.body.style.overflow).toBe("auto");

    rerender({ locked: true });

    expect(document.body.style.overflow).toBe("hidden");

    rerender({ locked: false });

    // When isLocked becomes false, cleanup from previous render restores overflow
    expect(document.body.style.overflow).toBe("auto");
  });

  it("preserves original overflow value even if it's not 'visible'", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });
});
