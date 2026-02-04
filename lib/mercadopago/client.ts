import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializa el cliente de Mercado Pago con el Access Token del entorno
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    integrator_id: process.env.MERCADOPAGO_INTEGRATOR_ID,
  },
});

export { client };
export { Preference };
