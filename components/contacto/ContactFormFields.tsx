import type { Ref } from "react";
import type { ContactContent } from "@/lib/content/contacto";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { VALIDATION_LIMITS } from "@/lib/utils/validation";

interface ContactFormFieldsProps {
  form: ContactContent["form"];
  errors: Record<string, string>;
  disabled: boolean;
  nombreRef: Ref<HTMLInputElement>;
  emailRef: Ref<HTMLInputElement>;
  telefonoRef: Ref<HTMLInputElement>;
  mensajeRef: Ref<HTMLTextAreaElement>;
}

export function ContactFormFields({
  form,
  errors,
  disabled,
  nombreRef,
  emailRef,
  telefonoRef,
  mensajeRef,
}: ContactFormFieldsProps) {
  return (
    <>
      {/* Honeypot field - invisible to humans, visible to bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
        aria-hidden="true"
      />

      <Input
        ref={nombreRef}
        id="nombre"
        name="nombre"
        label={form.fields.nombre.label}
        placeholder={form.fields.nombre.placeholder}
        error={errors.nombre}
        maxLength={VALIDATION_LIMITS.nombre.max}
        disabled={disabled}
        required
      />

      <Input
        ref={emailRef}
        id="email"
        name="email"
        type="email"
        label={form.fields.email.label}
        placeholder={form.fields.email.placeholder}
        error={errors.email}
        maxLength={VALIDATION_LIMITS.email.max}
        disabled={disabled}
        required
      />

      <Input
        ref={telefonoRef}
        id="telefono"
        name="telefono"
        type="tel"
        label={form.fields.telefono.label}
        helperText={form.fields.telefono.helper}
        placeholder={form.fields.telefono.placeholder}
        error={errors.telefono}
        maxLength={VALIDATION_LIMITS.telefono.max}
        disabled={disabled}
      />

      <Textarea
        ref={mensajeRef}
        id="mensaje"
        name="mensaje"
        label={form.fields.mensaje.label}
        placeholder={form.fields.mensaje.placeholder}
        rows={5}
        error={errors.mensaje}
        maxLength={VALIDATION_LIMITS.mensaje.max}
        disabled={disabled}
        required
      />
    </>
  );
}
