// Centraliza el contenido textual de la página de carrito
// Español argentino

export interface CarritoContent {
  page: {
    title: string;
    description: string;
  };
  empty: {
    message: string;
    cta: string;
  };
  actions: {
    clear: string;
    checkout: string;
    remove: string;
    retry: string;
  };
  labels: {
    total: string;
    quantity: string;
  };
  error: {
    load: string;
    confirmClear: string;
  };
}

export const CARRITO_CONTENT: CarritoContent = {
  page: {
    title: "Mi Carrito",
    description:
      "Revisa y gestiona los productos de tu carrito antes de finalizar la compra",
  },
  empty: {
    message: "Tu carrito está vacío",
    cta: "Ver productos",
  },
  actions: {
    clear: "Vaciar carrito",
    checkout: "Continuar con la compra",
    remove: "Eliminar",
    retry: "Reintentar",
  },
  labels: {
    total: "Total",
    quantity: "Cantidad",
  },
  error: {
    load: "Error al cargar el carrito",
    confirmClear: "¿Estás seguro de vaciar el carrito?",
  },
} as const;
