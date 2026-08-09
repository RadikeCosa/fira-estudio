import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactInfo } from "./ContactInfo";

describe("ContactInfo", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the direct contact surface without form fields or hours", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5492999123456");

    render(<ContactInfo />);

    expect(
      screen.queryByRole("heading", { name: /canales de contacto/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/canal principal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/canales secundarios/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/teléfono/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/mensaje/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/horarios de atención/i)).not.toBeInTheDocument();
  });

  it("renders the general WhatsApp CTA when WhatsApp is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5492999123456");

    render(<ContactInfo />);

    const cta = screen.getByRole("link", { name: /escribir por whatsapp/i });
    expect(cta).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/5492999123456\?text=/),
    );
    expect(decodeURIComponent(cta.getAttribute("href") ?? "")).toContain(
      "Hola, quería hacer una consulta sobre los productos de Fira Estudio.",
    );
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses product context in the WhatsApp message and visible summary", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5492999123456");

    render(<ContactInfo initialContext={{ producto: "Camino Magnolia" }} />);

    expect(screen.getByText(/Sobre:/)).toBeInTheDocument();
    expect(screen.getByText(/Camino Magnolia/)).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /escribir por whatsapp/i });
    expect(decodeURIComponent(cta.getAttribute("href") ?? "")).toContain(
      "Hola, quería consultar por Camino Magnolia. ¿Está disponible?",
    );
  });

  it("uses product and variation context in the WhatsApp message and visible summary", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5492999123456");

    render(
      <ContactInfo
        initialContext={{
          producto: "Camino Magnolia",
          variante: "Large / Azul",
        }}
      />,
    );

    expect(screen.getByText(/Camino Magnolia · Large \/ Azul/))
      .toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /escribir por whatsapp/i });
    expect(decodeURIComponent(cta.getAttribute("href") ?? "")).toContain(
      "Hola, quería consultar por Camino Magnolia, variante Large / Azul. ¿Está disponible?",
    );
  });

  it("does not render WhatsApp when it is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contacto@example.com");

    render(<ContactInfo />);

    expect(
      screen.queryByRole("link", { name: /escribir por whatsapp/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render example.com email placeholders", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contacto@example.com");

    render(<ContactInfo />);

    expect(screen.queryByText("contacto@example.com")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /email/i }))
      .not.toBeInTheDocument();
  });

  it.each(["contacto@example.org", "contacto@example.net"])(
    "does not render %s email placeholders",
    (emailAddress) => {
      vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", emailAddress);

      render(<ContactInfo />);

      expect(screen.queryByText(emailAddress)).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /email/i }))
        .not.toBeInTheDocument();
    },
  );

  it("renders a real email as the available action when WhatsApp is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "hola@firaestudio.com");

    render(<ContactInfo />);

    const email = screen.getByRole("link", {
      name: "Escribir por email a hola@firaestudio.com",
    });
    expect(email).toHaveAttribute("href", "mailto:hola@firaestudio.com");
  });

  it("renders Instagram only when an Instagram URL is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "https://instagram.com/firaestudio");

    render(<ContactInfo />);

    const instagram = screen.getByRole("link", {
      name: "Escribir por Instagram",
    });
    expect(instagram).toHaveAttribute(
      "href",
      "https://instagram.com/firaestudio",
    );
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders an empty state when no contact channel is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "");

    render(<ContactInfo />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Por ahora no hay un canal de contacto disponible en el sitio.",
    );
  });

  it("renders secondary channels discreetly when WhatsApp is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5492999123456");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "hola@firaestudio.com");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "https://instagram.com/firaestudio");

    render(<ContactInfo />);

    expect(
      screen.getByRole("link", { name: /escribir por whatsapp/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/firaestudio",
    );
    expect(screen.getByRole("link", { name: "hola@firaestudio.com" }))
      .toHaveAttribute("href", "mailto:hola@firaestudio.com");
  });
});
