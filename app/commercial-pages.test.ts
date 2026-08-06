import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import CarritoPage from "./carrito/page";
import CheckoutPage from "./checkout/page";
import CheckoutSuccessPage from "./checkout/success/page";
import CheckoutFailurePage from "./checkout/failure/page";
import CheckoutPendingPage from "./checkout/pending/page";
import TestErrorsPage from "./test-errors/page";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("historical public commerce pages", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it("does not render the cart page", () => {
    expect(() => CarritoPage()).toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("does not render the checkout form page", () => {
    expect(() => CheckoutPage()).toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("does not render payment result pages", () => {
    expect(() => CheckoutSuccessPage()).toThrow("NEXT_NOT_FOUND");
    expect(() => CheckoutFailurePage()).toThrow("NEXT_NOT_FOUND");
    expect(() => CheckoutPendingPage()).toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(3);
  });
});

describe("test error route exposure", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    notFoundMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("is not available in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => TestErrorsPage()).toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
