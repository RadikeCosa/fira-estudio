/**
 * Tests for Contact page components (Phase 4)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "./ContactForm";
import { ContactInfo } from "./ContactInfo";
import * as rateLimitServer from "@/lib/utils/rate-limit-server";

// Mock the checkServerRateLimit function
vi.mock("@/lib/utils/rate-limit-server", () => ({
  checkServerRateLimit: vi.fn(),
}));

describe("ContactForm", () => {
  // Mock localStorage
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset and setup the mock for checkServerRateLimit
    vi.mocked(rateLimitServer.checkServerRateLimit).mockResolvedValue({
      allowed: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("renders all form fields from CONTACTO_CONTENT", () => {
    render(<ContactForm />);

    // Check form title
    expect(screen.getByText("Envianos tu consulta")).toBeInTheDocument();

    // Check all form fields are rendered
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mensaje/)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByText("Enviar consulta")).toBeInTheDocument();

    // Check helper text
    expect(
      screen.getByText(/Al enviar, abriremos tu correo/),
    ).toBeInTheDocument();
  });

  it("has required fields marked correctly", () => {
    render(<ContactForm />);

    // Nombre is required
    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute("required");

    // Email is required
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("required");

    // Teléfono is optional
    expect(screen.getByLabelText(/Teléfono/)).not.toHaveAttribute("required");

    // Mensaje is required
    expect(screen.getByLabelText(/Mensaje/)).toHaveAttribute("required");
  });

  it("opens email with formatted message on submit", async () => {
    // Mock window.open
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ContactForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "juan@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/), {
      target: { value: "+54 9 11 1234-5678" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/), {
      target: { value: "Me interesa un mantel" },
    });

    // Submit form
    const submitButton = screen.getByText("Enviar consulta");
    fireEvent.click(submitButton);

    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    // Check URL contains mailto format
    const callArgs = openSpy.mock.calls[0][0] as string;
    expect(callArgs).toContain("mailto:");
    expect(callArgs).toContain("subject=Consulta%20desde%20el%20sitio");
    expect(callArgs).toContain("Juan%20P%C3%A9rez");
    expect(callArgs).toContain("juan%40example.com");

    openSpy.mockRestore();
  });

  it("handles optional telefono field correctly", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ContactForm />);

    // Fill form without telefono (but with valid mensaje length)
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "María González" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "maria@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/), {
      target: { value: "Me interesa consultar sobre productos" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Enviar consulta"));

    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    openSpy.mockRestore();
  });

  it("uses Card component with correct props", () => {
    const { container } = render(<ContactForm />);

    // Card should have border and shadow classes
    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
  });

  // Security feature tests
  it("shows validation errors for invalid inputs", () => {
    render(<ContactForm />);

    // Fill form with invalid data
    const nombreInput = screen.getByLabelText(/Nombre/);
    const emailInput = screen.getByLabelText(/Email/);
    const mensajeInput = screen.getByLabelText(/Mensaje/);

    fireEvent.change(nombreInput, {
      target: { value: "J" }, // Too short
    });
    fireEvent.change(emailInput, {
      target: { value: "invalid" }, // Invalid email
    });
    fireEvent.change(mensajeInput, {
      target: { value: "Hi" }, // Too short
    });

    // Submit form using the form element itself
    const form = nombreInput.closest("form")!;
    fireEvent.submit(form);

    // Check that errors are displayed (they should appear synchronously)
    expect(
      screen.getByText(/El nombre debe tener al menos/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Por favor, ingresá un email válido/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El mensaje debe tener al menos/),
    ).toBeInTheDocument();
  });

  it("sanitizes HTML from inputs", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ContactForm />);

    // Fill form with HTML (use valid name after sanitization)
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Juan Pedro" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "juan@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/), {
      target: {
        value:
          "<script>alert('xss')</script>Mensaje importante sobre productos",
      },
    });

    // Submit form
    fireEvent.click(screen.getByText("Enviar consulta"));

    // XSS should be detected and rejected - window.open should not be called
    await vi.waitFor(() => {
      // The form should not submit due to XSS detection
      expect(openSpy).not.toHaveBeenCalled();
    });

    // Check for error message
    expect(
      screen.getByText(/Contenido no permitido detectado/),
    ).toBeInTheDocument();

    openSpy.mockRestore();
  });

  it("has honeypot field for bot detection", () => {
    const { container } = render(<ContactForm />);

    // Check honeypot field exists and is hidden
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveStyle({ opacity: 0 });
    expect(honeypot).toHaveAttribute("tabIndex", "-1");
  });

  it("blocks submission when honeypot is filled", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ContactForm />);

    // Fill form including honeypot (bot behavior)
    const honeypot = screen.getByRole("textbox", { hidden: true, name: "" });
    fireEvent.change(honeypot, { target: { value: "bot-value" } });

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "juan@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/), {
      target: { value: "Mensaje válido de consulta" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Enviar consulta"));

    // Should NOT open email (silent block)
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it("respects maxLength attributes on inputs", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute("maxLength", "50");
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("maxLength", "100");
    expect(screen.getByLabelText(/Teléfono/)).toHaveAttribute(
      "maxLength",
      "20",
    );
    expect(screen.getByLabelText(/Mensaje/)).toHaveAttribute(
      "maxLength",
      "500",
    );
  });
});

describe("ContactInfo", () => {
  it("renders contact information title", () => {
    render(<ContactInfo />);
    expect(screen.getByText("Información de Contacto")).toBeInTheDocument();
  });

  it("renders all contact items", () => {
    render(<ContactInfo />);

    // Check email
    expect(screen.getByText("Email")).toBeInTheDocument();

    // Check Instagram
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });

  it("renders business hours title and items", () => {
    render(<ContactInfo />);

    expect(screen.getByText("Horarios de Atención")).toBeInTheDocument();

    // Check schedule items
    expect(screen.getByText(/Lunes a Viernes/)).toBeInTheDocument();
    expect(screen.getByText(/Sábados/)).toBeInTheDocument();
    expect(screen.getByText(/Domingos/)).toBeInTheDocument();
  });

  it("displays active and inactive schedule indicators", () => {
    const { container } = render(<ContactInfo />);

    // Check for active indicators (brighter dots)
    const activeDots = container.querySelectorAll(".bg-foreground\\/50");
    expect(activeDots.length).toBeGreaterThan(0);

    // Check for inactive indicator (dimmer dot)
    const inactiveDots = container.querySelectorAll(".bg-foreground\\/20");
    expect(inactiveDots.length).toBeGreaterThan(0);
  });

  it("renders ContactInfoItem components with correct props", () => {
    render(<ContactInfo />);

    // Email should be a link
    const emailElement = screen
      .getByText("Email")
      .parentElement?.querySelector("a");
    if (emailElement) {
      expect(emailElement).toBeInTheDocument();
      expect(emailElement?.getAttribute("href")).toContain("mailto:");
    }

    // Instagram should be external link
    const instagramElement = screen
      .getByText("Instagram")
      .parentElement?.querySelector("a");
    if (instagramElement) {
      expect(instagramElement).toHaveAttribute("target", "_blank");
      expect(instagramElement).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
