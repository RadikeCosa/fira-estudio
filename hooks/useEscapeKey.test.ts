import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEscapeKey } from "./useEscapeKey";

describe("useEscapeKey", () => {
  let mockOnEscape: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnEscape = vi.fn();
  });

  it("calls onEscape when ESC key is pressed and isActive is true", () => {
    renderHook(() => useEscapeKey(mockOnEscape, true));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).toHaveBeenCalledTimes(1);
  });

  it("does not call onEscape when isActive is false", () => {
    renderHook(() => useEscapeKey(mockOnEscape, false));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).not.toHaveBeenCalled();
  });

  it("defaults to isActive=true when not provided", () => {
    renderHook(() => useEscapeKey(mockOnEscape));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).toHaveBeenCalledTimes(1);
  });

  it("does not call onEscape for other keys", () => {
    renderHook(() => useEscapeKey(mockOnEscape, true));

    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(enterEvent);

    const spaceEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spaceEvent);

    expect(mockOnEscape).not.toHaveBeenCalled();
  });

  it("removes event listener on unmount", () => {
    const { unmount } = renderHook(() => useEscapeKey(mockOnEscape, true));

    unmount();

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).not.toHaveBeenCalled();
  });

  it("updates event listener when onEscape changes", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) => useEscapeKey(callback, true),
      { initialProps: { callback: firstCallback } }
    );

    const escapeEvent1 = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent1);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).not.toHaveBeenCalled();

    rerender({ callback: secondCallback });

    const escapeEvent2 = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent2);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("updates event listener when isActive changes", () => {
    const { rerender } = renderHook(
      ({ active }) => useEscapeKey(mockOnEscape, active),
      { initialProps: { active: true } }
    );

    const escapeEvent1 = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent1);

    expect(mockOnEscape).toHaveBeenCalledTimes(1);

    rerender({ active: false });

    const escapeEvent2 = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent2);

    expect(mockOnEscape).toHaveBeenCalledTimes(1);

    rerender({ active: true });

    const escapeEvent3 = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent3);

    expect(mockOnEscape).toHaveBeenCalledTimes(2);
  });
});
