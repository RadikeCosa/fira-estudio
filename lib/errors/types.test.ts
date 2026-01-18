import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyError, ErrorType } from "./types";

describe("classifyError", () => {
  describe("Network errors", () => {
    it("classifies fetch errors as NETWORK", () => {
      const error = new Error("fetch failed");
      assert.equal(classifyError(error), ErrorType.NETWORK);
    });

    it("classifies connection errors as NETWORK", () => {
      const error = new Error("Connection refused");
      assert.equal(classifyError(error), ErrorType.NETWORK);
    });

    it("classifies timeout errors as NETWORK", () => {
      const error = new Error("Request timeout");
      assert.equal(classifyError(error), ErrorType.NETWORK);
    });

    it("classifies network errors in Spanish as NETWORK", () => {
      const error = new Error("Error de conexión");
      assert.equal(classifyError(error), ErrorType.NETWORK);
    });
  });

  describe("Database errors", () => {
    it("classifies PGRST errors as DATABASE", () => {
      const error = new Error("PGRST301: JWT expired");
      assert.equal(classifyError(error), ErrorType.DATABASE);
    });

    it("classifies database errors as DATABASE", () => {
      const error = new Error("Database connection failed");
      assert.equal(classifyError(error), ErrorType.DATABASE);
    });

    it("classifies Supabase errors as DATABASE", () => {
      const error = new Error("Supabase query failed");
      assert.equal(classifyError(error), ErrorType.DATABASE);
    });

    it("classifies PostgreSQL errors as DATABASE", () => {
      const error = new Error("PostgreSQL error: unique constraint");
      assert.equal(classifyError(error), ErrorType.DATABASE);
    });

    it("classifies PGRST116 as NOT_FOUND (special case)", () => {
      const error = new Error("PGRST116: Row not found");
      assert.equal(classifyError(error), ErrorType.NOT_FOUND);
    });
  });

  describe("Not found errors", () => {
    it("classifies 404 errors as NOT_FOUND", () => {
      const error = new Error("404 - Not Found");
      assert.equal(classifyError(error), ErrorType.NOT_FOUND);
    });

    it("classifies 'not found' messages as NOT_FOUND", () => {
      const error = new Error("Resource not found");
      assert.equal(classifyError(error), ErrorType.NOT_FOUND);
    });

    it("classifies 'no encontrado' messages as NOT_FOUND", () => {
      const error = new Error("Recurso no encontrado");
      assert.equal(classifyError(error), ErrorType.NOT_FOUND);
    });
  });

  describe("Validation errors", () => {
    it("classifies validation errors as VALIDATION", () => {
      const error = new Error("Validation failed");
      assert.equal(classifyError(error), ErrorType.VALIDATION);
    });

    it("classifies invalid input errors as VALIDATION", () => {
      const error = new Error("Invalid email format");
      assert.equal(classifyError(error), ErrorType.VALIDATION);
    });

    it("classifies validation errors in Spanish as VALIDATION", () => {
      const error = new Error("Error de validación");
      assert.equal(classifyError(error), ErrorType.VALIDATION);
    });
  });

  describe("Unknown errors", () => {
    it("classifies unrecognized errors as UNKNOWN", () => {
      const error = new Error("Something went wrong");
      assert.equal(classifyError(error), ErrorType.UNKNOWN);
    });

    it("classifies generic errors as UNKNOWN", () => {
      const error = new Error("Error");
      assert.equal(classifyError(error), ErrorType.UNKNOWN);
    });
  });

  describe("Case insensitivity", () => {
    it("handles uppercase error messages", () => {
      const error = new Error("FETCH FAILED");
      assert.equal(classifyError(error), ErrorType.NETWORK);
    });

    it("handles mixed case error messages", () => {
      const error = new Error("Database Error");
      assert.equal(classifyError(error), ErrorType.DATABASE);
    });
  });
});
