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
    title: string;
    description: string;
    cta: string;
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
    title: "Pago Exitoso",
    description:
      "¡Gracias por tu compra! Te enviaremos un email con los detalles de tu pedido.",
    cta: "Ver pedido",
  },
  failure: {
    title: "Pago Fallido",
    description: "Hubo un problema al procesar tu pago",
    message:
      "No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, datos incorrectos o cancelación del proceso.",
    instructions: [
      "Verifica los datos de tu tarjeta",
      "Asegúrate de tener fondos suficientes",
      "Intenta con otro método de pago",
      "Contacta a tu banco si el problema persiste",
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
      "Si tienes dudas, contáctanos",
    ],
    ctaSupport: "Contactar soporte",
    ctaHome: "Volver al inicio",
  },
};
