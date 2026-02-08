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
    size: string;
    color: string;
    stock: string;
    add: string;
    adding: string;
    viewCart: string;
  };
  error: {
    load: string;
    confirmClear: string;
    selectVariation: string;
    noStock: string;
    checkoutDisabled: string;
  };
  success: {
    added: string;
  };
  checkout: {
    title: string;
    summary: string;
    email: string;
    nombre: string;
    telefono: string;
    submit: string;
    processing: string;
    volver: string;
    instrucciones: string;
    placeholders: {
      email: string;
      nombre: string;
      telefono: string;
    };
    errors: {
      requiredEmail: string;
      invalidEmail: string;
      requiredNombre: string;
      shortNombre: string;
      requiredTelefono: string;
      invalidTelefono: string;
      general: string;
      noLink: string;
    };
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
    size: "Tamaño",
    color: "Color",
    stock: "Stock disponible",
    add: "Agregar al carrito",
    adding: "Agregando...",
    viewCart: "Ver carrito",
  },
  error: {
    load: "Error al cargar el carrito",
    confirmClear: "¿Estás seguro de vaciar el carrito?",
    selectVariation: "Por favor selecciona tamaño y color",
    noStock: "No hay stock suficiente",
    checkoutDisabled: "El checkout está temporalmente deshabilitado",
  },
  success: {
    added: "¡Producto agregado al carrito!",
  },
  checkout: {
    title: "Datos de contacto",
    summary: "Resumen del pedido",
    email: "Email",
    nombre: "Nombre completo",
    telefono: "Teléfono",
    submit: "Ir a pagar con Mercado Pago",
    processing: "Procesando...",
    volver: "← Volver al carrito",
    instrucciones:
      "Serás redirigido a Mercado Pago para completar el pago de forma segura",
    placeholders: {
      email: "tu@email.com",
      nombre: "Juan Pérez",
      telefono: "+54 9 11 1234-5678",
    },
    errors: {
      requiredEmail: "El email es requerido",
      invalidEmail: "Email inválido",
      requiredNombre: "El nombre es requerido",
      shortNombre: "El nombre debe tener al menos 3 caracteres",
      requiredTelefono: "El teléfono es requerido",
      invalidTelefono: "Teléfono inválido",
      general: "Error al crear la preferencia de pago",
      noLink: "No se recibió el link de pago",
    },
  },
} as const;
