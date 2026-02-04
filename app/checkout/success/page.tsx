import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Pago Exitoso",
  description: "Tu pago ha sido procesado correctamente",
};

interface SuccessPageProps {
  searchParams: Promise<{
    payment_id?: string;
    collection_id?: string;
    external_reference?: string;
    status?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const paymentId = params.payment_id || params.collection_id;
  const externalReference = params.external_reference;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold">¡Pago exitoso!</h1>

        <p className="text-muted-foreground">
          Tu pago ha sido procesado correctamente. Recibirás un email de
          confirmación con los detalles de tu compra.
        </p>

        {/* Información de Mercado Pago para certificación */}
        {(paymentId || externalReference) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-left">
            <p className="font-semibold text-blue-900">Información del Pago:</p>
            {paymentId && (
              <div className="space-y-1">
                <p className="text-blue-700 font-medium">Payment ID:</p>
                <p className="font-mono text-xs bg-white px-3 py-2 rounded border border-blue-200 break-all">
                  {paymentId}
                </p>
              </div>
            )}
            {externalReference && (
              <div className="space-y-1">
                <p className="text-blue-700 font-medium">External Reference:</p>
                <p className="font-mono text-xs bg-white px-3 py-2 rounded border border-blue-200 break-all">
                  {externalReference}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm">
          <p className="font-medium">¿Qué sigue?</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            <li>• Recibirás un email con el resumen de tu compra</li>
            <li>• Te contactaremos para coordinar la entrega</li>
            <li>• Puedes seguir el estado de tu pedido en tu email</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/productos"
            className="flex-1 border border-border px-6 py-3 rounded-lg hover:bg-muted transition"
          >
            Seguir comprando
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
