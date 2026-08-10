// Centraliza el contenido textual de la página sobre nosotros
// Español argentino

import { Heart, Sparkles, Leaf, Users, type LucideIcon } from "lucide-react";

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
    title: "Sobre Nosotros",
    subtitle: "Creamos textiles únicos con dedicación y amor por el detalle",
  },
  image: {
    src: "/images/about.webp",
    alt: "Taller de fira Estudio",
  },
  sections: {
    historia: {
      title: "Nuestra Historia",
      icon: Heart,
      paragraphs: [
        "Fira Estudio nace de la idea de que un hogar puede encenderse con belleza simple y auténtica.",
        "Cada pieza es única porque lleva nuestra esencia: lindas, para que enamoren a primera vista; útiles, para que se integren naturalmente a tu rutina; y pensadas para usar cada día, porque creemos en la simpleza de lo cotidiano, en las mesas compartidas, en los momentos genuinos.",
        "Cada producto es el resultado de un dedicado proceso artesanal. En Fira Estudio seleccionamos textiles premium, diseñamos cada objeto, lo cosemos y lo estampamos manualmente mediante serigrafía, buscando siempre la excelencia en cada detalle.",
      ],
    },
    proceso: {
      title: "Proceso Artesanal",
      icon: Sparkles,
      paragraphs: [
        "Piezas artesanales que encienden tu hogar con calidad y durabilidad.",
        {
          before:
            "Cada pieza que creamos pasa por un meticuloso proceso de elaboración; podés ",
          link: {
            text: "ver el catálogo",
            href: "/productos",
          },
          after: " para conocer el resultado de nuestro trabajo.",
        },
        "Seleccionamos cuidadosamente materiales premium, priorizando fibras naturales y telas de alta calidad que combinan belleza con funcionalidad óptima.",
        "Prestamos atención rigurosa a cada costura a mano, cada terminación y cada estampa manual mediante serigrafía.",
      ],
    },
    valores: {
      title: "Nuestros Valores",
      description: "Los pilares que guían nuestro trabajo diario",
      items: [
        {
          icon: Sparkles,
          title: "Calidad Artesanal",
          description:
            "Nos comprometemos con la excelencia en cada pieza que creamos. Cada producto es elaborado con dedicación y cuidado, asegurando que cumpla con los más altos estándares de calidad.",
        },
        {
          icon: Heart,
          title: "Diseño Consciente",
          description:
            "Diseñamos con propósito. Cada uno de nuestros productos está pensado para ser funcional, bello y duradero apostando por lo atemporal.",
        },
        {
          icon: Leaf,
          title: "Producción Responsable",
          description:
            "Trabajamos de manera consciente y responsable, optimizando recursos y minimizando desperdicios. Valoramos el trabajo artesanal y el tiempo que requiere crear productos de calidad.",
        },
        {
          icon: Users,
          title: "Atención Personalizada",
          description:
            "Cada cliente es importante para nosotros. Ofrecemos atención personalizada, asesoramiento en la elección de productos y estamos siempre disponibles para responder consultas y acompañarte en tu elección.",
        },
      ],
    },
  },
} as const;
