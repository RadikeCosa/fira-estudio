// Centraliza el contenido textual de las páginas de checkout
// Español argentino

export interface CheckoutContent {
  page: {
    title: string;
    description: string;
  };
  form: {
    title: string;
  };
  success: {
    pageTitle: string;
    title: string;
    subtitle: string;
    // Estados de error / intermedios
    orderNotFound: string;
    orderNotFoundDescription: string;
    invalidReference: string;
    invalidReferenceDescription: string;
    pendingTitle: string;
    pendingMessage: string;
    // Resumen de orden
    orderSummaryTitle: string;
    orderIdLabel: string;
    totalLabel: string;
    quantityLabel: string;
    unitLabel: string;
    // Próximos pasos
    whatNextTitle: string;
    nextSteps: string[];
    // CTAs (compartidos entre happy path y estados de error)
    ctaPrimary: string;
    ctaSecondary: string;
  };
  failure: {
    title: string;
    description: string;
    message: string;
    instructions: string[];
    ctaBack: string;
    ctaRetry: string;
  };
  pending: {
    title: string;
    description: string;
    message: string;
    instructions: string[];
    ctaSupport: string;
    ctaHome: string;
  };
}

export const CHECKOUT_CONTENT: CheckoutContent = {
  page: {
    title: "Checkout - Finalizar Compra",
    description:
      "Completa tus datos para finalizar la compra de forma segura con Mercado Pago",
  },
  form: {
    title: "Finalizar Compra",
  },
  success: {
    pageTitle: "Pago Exitoso",
    title: "¡Pago exitoso!",
    subtitle:
      "Tu pago fue aprobado y estamos preparando tu pedido. Recibirás un email de confirmación.",
    // Estados de error / intermedios
    orderNotFound: "Orden no encontrada",
    orderNotFoundDescription:
      "No pudimos encontrar la orden asociada a este pago. Revisá tu email o contactá con soporte.",
    invalidReference: "Error en referencia",
    invalidReferenceDescription:
      "Formato de referencia inválido. Revisá tu email o contactá con soporte.",
    pendingTitle: "Pago pendiente",
    pendingMessage:
      "Tu orden está siendo procesada. Te notificaremos cuando se confirme el pago.",
    // Resumen de orden
    orderSummaryTitle: "Resumen de la orden",
    orderIdLabel: "N° de orden",
    totalLabel: "Total",
    quantityLabel: "Cantidad",
    unitLabel: "c/u",
    // Próximos pasos
    whatNextTitle: "¿Qué sigue?",
    nextSteps: [
      "Te enviaremos la confirmación por email.",
      "Vamos a preparar tu pedido.",
      "Te contactaremos para coordinar la entrega.",
    ],
    // CTAs
    ctaPrimary: "Ver catálogo",
    ctaSecondary: "Volver al inicio",
  },
  failure: {
    title: "Pago Fallido",
    description: "Hubo un problema al procesar tu pago",
    message:
      "No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, datos incorrectos o cancelación del proceso.",
    instructions: [
      "Verificá los datos de tu tarjeta",
      "Asegurate de tener fondos suficientes",
      "Intentá con otro método de pago",
      "Contactá a tu banco si el problema persiste",
    ],
    ctaBack: "Volver al carrito",
    ctaRetry: "Reintentar pago",
  },
  pending: {
    title: "Pago Pendiente",
    description: "Tu pago está siendo procesado",
    message:
      "Tu pago está siendo procesado. Esto puede tomar unos minutos. Te notificaremos por email cuando se complete.",
    instructions: [
      "Tu pago está en proceso de verificación",
      "Recibirás un email cuando se confirme",
      "No es necesario realizar un nuevo pago",
      "Si tenés dudas, contactanos",
    ],
    ctaSupport: "Contactar soporte",
    ctaHome: "Volver al inicio",
  },
};