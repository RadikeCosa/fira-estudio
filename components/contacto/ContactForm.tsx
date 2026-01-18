'use client';

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";
import { WHATSAPP } from "@/lib/constants";

export function ContactForm() {
  const { form } = CONTACTO_CONTENT;
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const message = `
Hola! Mi nombre es ${formData.get("nombre")}

Email: ${formData.get("email")}
${formData.get("telefono") ? `Teléfono: ${formData.get("telefono")}` : ""}

Consulta: 
${formData.get("mensaje")}
    `.trim();
    
    window.open(WHATSAPP.getUrl(message), "_blank");
  };

  return (
    <Card hover={false}>
      <h2 className="mb-8 text-2xl font-bold text-foreground">
        {form.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="nombre"
          name="nombre"
          label={form.fields.nombre.label}
          placeholder={form.fields.nombre.placeholder}
          required
        />

        <Input
          id="email"
          name="email"
          type="email"
          label={form.fields.email.label}
          placeholder={form.fields.email.placeholder}
          required
        />

        <Input
          id="telefono"
          name="telefono"
          type="tel"
          label={form.fields.telefono.label}
          helperText={form.fields.telefono.helper}
          placeholder={form.fields.telefono.placeholder}
        />

        <Textarea
          id="mensaje"
          name="mensaje"
          label={form.fields.mensaje.label}
          placeholder={form.fields.mensaje.placeholder}
          rows={5}
          required
        />

        <Button type="submit" variant="primary" size="md" className="w-full group">
          {form.submitButton}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {form.submitHelperText}
        </p>
      </form>
    </Card>
  );
}
