// Centraliza el contenido textual de la página de productos
// Español argentino

export interface ProductosContent {
  page: {
    metadataTitle: string;
    metadataDescription: string;
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
    metadataTitle: "Catálogo de textiles artesanales",
    metadataDescription:
      "Explorá el catálogo de textiles artesanales de Fira Estudio: piezas para la mesa y el hogar con materiales, variantes e imágenes.",
    defaultTitle: "Textiles artesanales",
    defaultDescription:
      "Explorá el catálogo de Fira Estudio: piezas textiles para la mesa y el hogar con materiales, variantes e imágenes. La disponibilidad se confirma por consulta.",
  },
  empty: {
    title: "No hay productos disponibles",
    description: "Pronto agregaremos nuevos productos a esta categoría.",
  },
} as const;
