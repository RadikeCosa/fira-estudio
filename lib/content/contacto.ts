// Centraliza el contenido textual de la página de contacto
// Español argentino

export interface ContactContent {
  page: {
    title: string;
    description: string;
  };
  info: {
    contextLabel: string;
    cta: {
      whatsapp: string;
      email: string;
      instagram: string;
    };
    emptyState: string;
    items: {
      email: { label: string };
      instagram: { label: string };
    };
  };
}

export const CONTACTO_CONTENT: ContactContent = {
  page: {
    title: "Contacto",
    description:
      "Escribinos para consultar disponibilidad, variantes o detalles de una pieza.",
  },
  info: {
    contextLabel: "Sobre",
    cta: {
      whatsapp: "Escribir por WhatsApp",
      email: "Escribir por email",
      instagram: "Escribir por Instagram",
    },
    emptyState: "Por ahora no hay un canal de contacto disponible en el sitio.",
    items: {
      email: {
        label: "Email",
      },
      instagram: {
        label: "Instagram",
      },
    },
  },
} as const;
