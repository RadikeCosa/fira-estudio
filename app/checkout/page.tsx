import { Metadata } from "next";
import { CheckoutForm } from "@/components/carrito/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout - Finalizar Compra",
  description:
    "Completa tus datos para finalizar la compra de forma segura con Mercado Pago",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
