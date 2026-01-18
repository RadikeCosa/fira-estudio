/**
 * Tests for Contact page components (Phase 4)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "./ContactForm";
import { ContactInfo } from "./ContactInfo";

describe("ContactForm", () => {
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
    expect(screen.getByText("Enviar Consulta por WhatsApp")).toBeInTheDocument();
    
    // Check helper text
    expect(screen.getByText(/Al enviar, abriremos WhatsApp/)).toBeInTheDocument();
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

  it("opens WhatsApp with formatted message on submit", () => {
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
    const submitButton = screen.getByText("Enviar Consulta por WhatsApp");
    fireEvent.click(submitButton);
    
    // Check window.open was called
    expect(openSpy).toHaveBeenCalledTimes(1);
    
    // Check URL contains WhatsApp format
    const callArgs = openSpy.mock.calls[0][0] as string;
    expect(callArgs).toContain("wa.me");
    expect(callArgs).toContain("Juan%20P%C3%A9rez");
    expect(callArgs).toContain("juan%40example.com");
    
    openSpy.mockRestore();
  });

  it("handles optional telefono field correctly", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    
    render(<ContactForm />);
    
    // Fill form without telefono
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "María" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "maria@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/), {
      target: { value: "Consulta" },
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Enviar Consulta por WhatsApp"));
    
    // Check window.open was called
    expect(openSpy).toHaveBeenCalledTimes(1);
    
    openSpy.mockRestore();
  });

  it("uses Card component with correct props", () => {
    const { container } = render(<ContactForm />);
    
    // Card should have border and shadow classes
    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
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
    
    // Check WhatsApp
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    
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
    const emailElement = screen.getByText("Email").parentElement?.querySelector("a");
    expect(emailElement).toBeInTheDocument();
    expect(emailElement?.getAttribute("href")).toContain("mailto:");
    
    // WhatsApp should be external link
    const whatsappElement = screen.getByText("WhatsApp").parentElement?.querySelector("a");
    expect(whatsappElement).toHaveAttribute("target", "_blank");
    expect(whatsappElement).toHaveAttribute("rel", "noopener noreferrer");
    
    // Instagram should be external link
    const instagramElement = screen.getByText("Instagram").parentElement?.querySelector("a");
    expect(instagramElement).toHaveAttribute("target", "_blank");
    expect(instagramElement).toHaveAttribute("rel", "noopener noreferrer");
  });
});
