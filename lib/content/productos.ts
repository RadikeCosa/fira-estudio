// Centraliza el contenido textual de la página de productos
// Español argentino

export interface ProductosContent {
  page: {
    defaultTitle: string;
    defaultDescription: string;
  };
  empty: {
    title: string;
    description: string;
  };
}

export const PRODUCTOS_CONTENT: ProductosContent = {
  page: {
    defaultTitle: "Nuestros Productos",
    defaultDescription:
      "Textiles artesanales hechos a mano con dedicación y cuidado. Cada pieza es única y especial.",
  },
  empty: {
    title: "No hay productos disponibles",
    description: "Pronto agregaremos nuevos productos a esta categoría.",
  },
} as const;
