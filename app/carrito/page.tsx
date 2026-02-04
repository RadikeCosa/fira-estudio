import { Metadata } from "next";
import { ShoppingCart } from "@/components/carrito/ShoppingCart";

export const metadata: Metadata = {
  title: "Carrito de Compras",
  description:
    "Revisa y gestiona los productos de tu carrito antes de finalizar la compra",
};

export default function CarritoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mi Carrito</h1>
        <ShoppingCart />
      </div>
    </div>
  );
}
