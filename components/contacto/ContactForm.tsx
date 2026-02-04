"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { ContactFormActions } from "@/components/contacto/ContactFormActions";
import { ContactFormFields } from "@/components/contacto/ContactFormFields";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";
import { SOCIAL_LINKS } from "@/lib/constants/navigation";
import { useRateLimit } from "@/hooks/useRateLimit";
import {
  sanitizeText,
  validateContactForm,
  type ContactFormData,
} from "@/lib/utils/validation";
import { checkServerRateLimit } from "@/lib/utils/rate-limit-server";
import {
  logSecurityEvent,
  detectSuspiciousPattern,
  logXSSAttempt,
} from "@/lib/utils/security-logger";

export function ContactForm() {
  const { form } = CONTACTO_CONTENT;

  // Rate limiting: 3 submissions per 5 minutes
  const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
    maxActions: 3,
    windowMs: 300000, // 5 minutes
    key: "contact_form_submissions",
  });

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>("");

  // Refs for focus management and timeout cleanup
  const nombreRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check client-side rate limit
    if (isRateLimited) {
      setRateLimitMessage(
        "Has alcanzado el límite de mensajes. Por favor, esperá unos minutos.",
      );
      return;
    }

    // Clear rate limit message if it was set
    setRateLimitMessage("");

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    // Honeypot detection (bot trap) - check for non-empty string value
    const honeypot = formData.get("website");
    if (
      honeypot &&
      typeof honeypot === "string" &&
      honeypot.trim().length > 0
    ) {
      // Silent rejection - don't give feedback to bots
      logSecurityEvent("bot_detected", {
        context: "contact_form",
        honeypot: "filled",
      });
      return;
    }

    // Get form values (raw, before sanitization for XSS detection)
    const rawData = {
      nombre: (formData.get("nombre") as string) || "",
      email: (formData.get("email") as string) || "",
      telefono: (formData.get("telefono") as string) || "",
      mensaje: (formData.get("mensaje") as string) || "",
    };

    // Check for XSS attempts before sanitization
    const fieldsToCheck = [
      { field: "nombre", value: rawData.nombre },
      { field: "email", value: rawData.email },
      { field: "telefono", value: rawData.telefono },
      { field: "mensaje", value: rawData.mensaje },
    ];

    for (const { field, value } of fieldsToCheck) {
      if (detectSuspiciousPattern(value)) {
        logXSSAttempt(field, value, "contact_form");
        setErrors((prev) => ({
          ...prev,
          [field]: "Contenido no permitido detectado",
        }));
        return;
      }
    }

    // Sanitize data (convert empty telefono to undefined)
    const data: ContactFormData = {
      nombre: sanitizeText(rawData.nombre),
      email: sanitizeText(rawData.email),
      telefono:
        rawData.telefono && rawData.telefono.trim()
          ? sanitizeText(rawData.telefono)
          : undefined,
      mensaje: sanitizeText(rawData.mensaje),
    };

    // Validate form
    const validation = validateContactForm(data);

    if (!validation.isValid) {
      setErrors(validation.errors);

      // Log validation failure
      logSecurityEvent("validation_failed", {
        context: "contact_form",
        errors: Object.keys(validation.errors),
      });

      // Focus on first field with error using refs
      if (validation.errors.nombre) {
        nombreRef.current?.focus();
      } else if (validation.errors.email) {
        emailRef.current?.focus();
      } else if (validation.errors.telefono) {
        telefonoRef.current?.focus();
      } else if (validation.errors.mensaje) {
        mensajeRef.current?.focus();
      }

      return;
    }

    // Clear errors
    setErrors({});

    // Check server-side rate limit
    const rateLimitResult = await checkServerRateLimit("contact");
    if (!rateLimitResult.allowed) {
      setRateLimitMessage(
        rateLimitResult.message ||
          "Has alcanzado el límite de mensajes. Por favor, esperá unos minutos.",
      );
      return;
    }

    // Record action for client-side rate limiting
    recordAction();

    // Set submitting state
    setIsSubmitting(true);

    // Build email body with sanitized data
    const message = `
Hola! Mi nombre es ${data.nombre}

Email: ${data.email}
${data.telefono ? `Teléfono: ${data.telefono}` : ""}

Consulta: 
${data.mensaje}
    `.trim();

    const subject = "Consulta desde el sitio";
    const mailtoUrl = `${SOCIAL_LINKS.email.href}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(message)}`;

    window.open(mailtoUrl, "_blank");

    // Reset form after 1 second
    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      if (formElement) {
        formElement.reset();
      }
    }, 1000);
  };

  // Get button text based on state
  const getButtonText = (): string => {
    if (isSubmitting) {
      return "Abriendo email...";
    }
    if (isRateLimited) {
      const seconds = Math.ceil(timeUntilReset / 1000);
      return `Disponible en ${seconds}s`;
    }
    return form.submitButton;
  };

  return (
    <Card hover={false}>
      <h2 className="mb-8 text-2xl font-bold text-foreground">{form.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ContactFormFields
          form={form}
          errors={errors}
          disabled={isSubmitting || isRateLimited}
          nombreRef={nombreRef}
          emailRef={emailRef}
          telefonoRef={telefonoRef}
          mensajeRef={mensajeRef}
        />

        <ContactFormActions
          buttonText={getButtonText()}
          disabled={isSubmitting || isRateLimited}
          rateLimitMessage={rateLimitMessage}
          isRateLimited={isRateLimited}
          submitHelperText={form.submitHelperText}
        />
      </form>
    </Card>
  );
}
