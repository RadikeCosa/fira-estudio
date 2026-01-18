// Centraliza el contenido textual de la página sobre nosotros
// Español argentino

import { Heart, Sparkles, Leaf, Users, type LucideIcon } from "lucide-react";

export interface AboutValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

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
      paragraphs: string[];
    };
    proceso: {
      title: string;
      icon: LucideIcon;
      paragraphs: string[];
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
    alt: "Taller de Muma Estudio",
  },
  sections: {
    historia: {
      title: "Nuestra Historia",
      icon: Heart,
      paragraphs: [
        "Muma Estudio nació de la pasión por crear piezas textiles únicas que transformen los espacios cotidianos en lugares especiales. Cada producto es el resultado de un cuidadoso proceso artesanal que combina técnicas tradicionales con diseños contemporáneos.",
        "Desde nuestros inicios, nos hemos dedicado a trabajar con materiales de primera calidad, buscando siempre la excelencia en cada detalle. Creemos que los textiles para el hogar no son solo elementos decorativos, sino piezas que acompañan momentos importantes y crean memorias.",
        "Nuestro taller es un espacio donde la creatividad y la artesanía se encuentran, dando vida a manteles, servilletas y caminos de mesa que cuentan historias y reflejan la personalidad de cada hogar.",
      ],
    },
    proceso: {
      title: "Proceso Artesanal",
      icon: Sparkles,
      paragraphs: [
        "Cada pieza que creamos pasa por un meticuloso proceso de elaboración que garantiza su calidad y durabilidad. Seleccionamos cuidadosamente los materiales, priorizando fibras naturales y telas de alta calidad que ofrecen tanto belleza como funcionalidad.",
        "El diseño de cada producto es pensado para complementar diferentes estilos de decoración, desde lo más clásico hasta lo más contemporáneo. Trabajamos con atención al detalle en cada costura, cada terminación, asegurándonos de que cada pieza sea perfecta antes de llegar a tu hogar.",
        "Nuestro compromiso es mantener viva la tradición artesanal, adaptándola a las necesidades y gustos actuales, creando productos que perduren en el tiempo tanto en calidad como en estilo.",
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
            "Creemos en el diseño con propósito. Cada elemento de nuestros productos está pensado para ser funcional, bello y duradero, evitando tendencias pasajeras y apostando por lo atemporal.",
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
            "Cada cliente es importante para nosotros. Ofrecemos atención personalizada, asesoramiento en la elección de productos y estamos siempre disponibles para responder consultas y acompañarte en tu compra.",
        },
      ],
    },
  },
} as const;
