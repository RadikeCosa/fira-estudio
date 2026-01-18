// Centraliza el contenido textual de la página de inicio (Home)
// Español argentino

export const HOME_CONTENT = {
  hero: {
    badge: "Textiles Artesanales Únicos",
    title: "Muma Estudio", // Este valor puede ser reemplazado dinámicamente si es necesario
    subtitle: "Textiles artesanales para tu hogar",
    description:
      "Creamos manteles, servilletas y caminos de mesa con dedicación artesanal. Cada pieza es única y diseñada para transformar tus espacios en lugares especiales.",
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
    title: "Nuestras Categorías",
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
        description: "Ideales para acompañar tus comidas y reuniones",
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
      "Estamos para ayudarte a encontrar el producto perfecto para tu hogar",
    ctaText: "Contactanos",
  },
};
