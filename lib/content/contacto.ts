// Centraliza el contenido textual de la página de contacto
// Español argentino

export interface ContactContent {
  page: {
    title: string;
    description: string;
  };
  info: {
    title: string;
    intro: string;
    contextLabel: string;
    whatsapp: {
      title: string;
      description: string;
      cta: string;
    };
    secondaryTitle: string;
    emptyState: string;
    items: {
      email: { title: string; label: string };
      instagram: { title: string; label: string };
    };
  };
}

export const CONTACTO_CONTENT: ContactContent = {
  page: {
    title: "Contacto",
    description:
      "¿Querés consultar por alguno de nuestros productos? Escribinos para conocer disponibilidad, variantes o más detalles.",
  },
  info: {
    title: "Canales de contacto",
    intro:
      "WhatsApp es el canal principal para consultas sobre productos de Fira Estudio.",
    contextLabel: "Consulta por",
    whatsapp: {
      title: "WhatsApp",
      description: "Canal principal para consultas",
      cta: "Consultar por WhatsApp",
    },
    secondaryTitle: "Canales secundarios",
    emptyState: "Por ahora no hay un canal de contacto disponible en el sitio.",
    items: {
      email: {
        title: "Email",
        label: "Enviar email",
      },
      instagram: {
        title: "Instagram",
        label: "Ver Instagram",
      },
    },
  },
} as const;
