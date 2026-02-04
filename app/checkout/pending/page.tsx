import { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Pago Pendiente",
  description: "Tu pago está siendo procesado",
};

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-100 p-4">
            <Clock className="w-16 h-16 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Pago pendiente</h1>

        <p className="text-muted-foreground">
          Tu pago está siendo procesado. Esto puede tomar unos minutos. Te
          notificaremos por email cuando se complete.
        </p>

        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm">
          <p className="font-medium">¿Qué significa esto?</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            <li>• Tu pago está en proceso de verificación</li>
            <li>• Recibirás un email cuando se confirme</li>
            <li>• No es necesario realizar un nuevo pago</li>
            <li>• Si tienes dudas, contáctanos</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/contacto"
            className="flex-1 border border-border px-6 py-3 rounded-lg hover:bg-muted transition"
          >
            Contactar soporte
          </Link>
          <Link
            href="/"
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
