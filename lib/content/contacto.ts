// Centraliza el contenido textual de la página de contacto
// Español argentino

export interface ContactContent {
  page: {
    title: string;
    description: string;
  };
  form: {
    title: string;
    fields: {
      nombre: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      telefono: { label: string; placeholder: string; helper: string };
      mensaje: { label: string; placeholder: string };
    };
    submitButton: string;
    submitHelperText: string;
  };
  info: {
    title: string;
    items: {
      email: { title: string; value: string };
      instagram: { title: string; handle: string };
    };
  };
  horarios: {
    title: string;
    items: Array<{
      label: string;
      hours: string;
      active: boolean;
    }>;
  };
}

export const CONTACTO_CONTENT: ContactContent = {
  page: {
    title: "Contacto",
    description:
      "¿Tenés alguna consulta? Envianos un mensaje y te responderemos a la brevedad.",
  },
  form: {
    title: "Envianos tu consulta",
    fields: {
      nombre: {
        label: "Nombre",
        placeholder: "Tu nombre completo",
      },
      email: {
        label: "Email",
        placeholder: "tu@email.com",
      },
      telefono: {
        label: "Teléfono",
        placeholder: "+54 9 11 1234-5678",
        helper: "(opcional)",
      },
      mensaje: {
        label: "Mensaje",
        placeholder: "Contanos sobre tu consulta...",
      },
    },
    submitButton: "Enviar consulta",
    submitHelperText: "Al enviar, abriremos tu correo con el mensaje",
  },
  info: {
    title: "Información de Contacto",
    items: {
      email: {
        title: "Email",
        value: "contacto@firaestudio.com",
      },
      instagram: {
        title: "Instagram",
        handle: "@firaestudio",
      },
    },
  },
  horarios: {
    title: "Horarios de Atención",
    items: [
      { label: "Lunes a Viernes", hours: "9:00 - 18:00 hs", active: true },
      { label: "Sábados", hours: "10:00 - 14:00 hs", active: true },
      { label: "Domingos", hours: "Cerrado", active: false },
    ],
  },
} as const;
