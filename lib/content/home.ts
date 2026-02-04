// Centraliza el contenido textual de la página de inicio (Home)
// Español argentino

export const HOME_CONTENT = {
  hero: {
    badge: "Textiles Artesanales Únicos",
    title: "Fira Estudio", // Este valor puede ser reemplazado dinámicamente si es necesario
    subtitle: "Textiles Artesanales Únicos",
    description:
      "Creamos manteles, servilletas, caminos de mesa y accesorios de cocina con dedicación y cuidado artesanal. Lindos. Útiles. Para usar cada día.",
    cta: {
      primary: "Ver Productos",
      secondary: "Sobre Nosotros",
    },
  },
  featuredProducts: {
    title: "Productos Destacados",
    description:
      "Nuestras piezas más especiales, creadas con dedicación y amor por el detalle",
    viewAllCta: "Ver todos los productos",
  },
  categories: {
    title: "Nuestras Colecciones",
    description: "Explora nuestra colección de textiles artesanales",
    items: [
      {
        id: "manteles",
        title: "Manteles",
        description: "Para darle un toque especial a tu mesa",
        href: "/productos",
      },
      {
        id: "servilletas",
        title: "Servilletas",
        description: "Servilletas de tela de alta calidad",
        href: "/productos",
      },
      {
        id: "caminos",
        title: "Caminos de Mesa",
        description: "El detalle perfecto para realzar cualquier ambiente",
        href: "/productos",
      },
    ],
  },
  finalCta: {
    title: "¿Tenés alguna consulta?",
    description:
      "Estamos para ayudarte a encontrar el producto perfecto para tu hogar. Contactanos y te responderemos a la brevedad.",
    ctaText: "Contactanos",
  },
};
