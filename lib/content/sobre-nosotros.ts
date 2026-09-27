// Centraliza el contenido textual de la página sobre nosotros
// Español argentino

import { Heart, Sparkles, Leaf, type LucideIcon } from "lucide-react";

export interface AboutValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

export type AboutParagraph =
  | string
  | {
      before: string;
      link: {
        text: string;
        href: string;
      };
      after: string;
    };

export interface AboutContent {
  page: {
    title: string;
    subtitle: string;
  };
  image: {
    src: string;
    alt: string;
  };
  sections: {
    historia: {
      title: string;
      icon: LucideIcon;
      paragraphs: AboutParagraph[];
    };
    proceso: {
      title: string;
      icon: LucideIcon;
      paragraphs: AboutParagraph[];
    };
    valores: {
      title: string;
      description: string;
      items: AboutValue[];
    };
  };
}

export const ABOUT_CONTENT: AboutContent = {
  page: {
    title: "Sobre el taller",
    subtitle: "Diseñamos y confeccionamos textiles para la mesa y el hogar",
  },
  image: {
    src: "/images/about.webp",
    alt: "Manos marcando una tela junto a una máquina de coser",
  },
  sections: {
    historia: {
      title: "Nuestra historia",
      icon: Heart,
      paragraphs: [
        "Fira Estudio crea textiles para acompañar la vida cotidiana en la mesa y el hogar.",
        "Diseñamos cada pieza, seleccionamos las telas y trabajamos la confección y la serigrafía manual en el taller.",
        "Cuidamos las terminaciones para que cada textil combine belleza, utilidad y uso diario.",
      ],
    },
    proceso: {
      title: "Un proceso de taller",
      icon: Sparkles,
      paragraphs: [
        {
          before:
            "Cada pieza atraviesa distintas etapas de confección. Podés ",
          link: {
            text: "ver el catálogo",
            href: "/productos",
          },
            after: " para conocer los textiles terminados.",
        },
        "Elegimos telas según el uso de cada pieza y definimos el diseño antes de pasar a la confección.",
        "La serigrafía manual y la revisión de las terminaciones completan el trabajo en el taller.",
      ],
    },
    valores: {
      title: "Lo que cuidamos",
      description: "Decisiones concretas detrás de cada pieza",
      items: [
        {
          icon: Sparkles,
          title: "Diseño para lo cotidiano",
          description:
            "Diseñamos textiles que se integran al uso diario de la mesa y el hogar.",
        },
        {
          icon: Heart,
          title: "Oficio textil",
          description:
            "La confección y la serigrafía manual forman parte del proceso de producción en el taller.",
        },
        {
          icon: Leaf,
          title: "Producción cuidada",
          description:
            "Revisamos costuras, estampas y terminaciones antes de presentar cada pieza.",
        },
      ],
    },
  },
} as const;
