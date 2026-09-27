import { describe, expect, it } from "vitest";
import { validateWhatsAppBuild } from "./whatsapp-build-gate.mjs";

describe("WhatsApp build gate", () => {
  it.each([undefined, "development"])("allows local build for %s", (environment) => {
    expect(validateWhatsAppBuild(environment, undefined)).toEqual({ valid: true, required: false });
  });

  it.each(["preview", "production"])("requires a valid number for %s", (environment) => {
    expect(validateWhatsAppBuild(environment, undefined)).toEqual({ valid: false, required: true });
    expect(validateWhatsAppBuild(environment, "5492999123456")).toEqual({ valid: true, required: true });
  });

  it.each(["+5492999123456", "549 2999123456", "549-2999123456", "123456789", "1234567890123456"])(
    "rejects malformed public values without normalizing them",
    (value) => {
      expect(validateWhatsAppBuild("production", value).valid).toBe(false);
    },
  );
});
