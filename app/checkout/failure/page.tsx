import { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Pago Fallido",
  description: "Hubo un problema al procesar tu pago",
};

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Pago no completado</h1>

        <p className="text-muted-foreground">
          No pudimos procesar tu pago. Esto puede deberse a fondos
          insuficientes, datos incorrectos o cancelación del proceso.
        </p>

        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm">
          <p className="font-medium">¿Qué puedes hacer?</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            <li>• Verifica los datos de tu tarjeta</li>
            <li>• Asegúrate de tener fondos suficientes</li>
            <li>• Intenta con otro método de pago</li>
            <li>• Contacta a tu banco si el problema persiste</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/carrito"
            className="flex-1 border border-border px-6 py-3 rounded-lg hover:bg-muted transition"
          >
            Volver al carrito
          </Link>
          <Link
            href="/checkout"
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Reintentar pago
          </Link>
        </div>
      </div>
    </div>
  );
}
