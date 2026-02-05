import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { CartRepository } from "@/lib/repositories/cart.repository";
import type { Order, OrderItem } from "@/lib/types";

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

/**
 * Extrae el order_id del external_reference
 * Formato: "email|orderId"
 */
function extractOrderId(externalReference: string): string | null {
  const parts = externalReference.split("|");
  if (parts.length === 2) {
    return parts[1];
  }
  return null;
}

/**
 * Formatea el precio en pesos argentinos
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const externalReference = params.external_reference;

  // Si no hay external_reference, mostrar error
  if (!externalReference) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Orden no encontrada</h1>
          <p className="text-muted-foreground">
            No pudimos encontrar la información de tu orden. Por favor, revisa
            tu email o contacta con soporte.
          </p>
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

  // Extraer order_id del external_reference
  const orderId = extractOrderId(externalReference);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Error en referencia</h1>
          <p className="text-muted-foreground">
            Formato de referencia inválido. Por favor, revisa tu email o
            contacta con soporte.
          </p>
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

  // Obtener orden con items desde la base de datos
  let order: (Order & { order_items: OrderItem[] }) | null = null;
  let orderError = false;

  try {
    const repo = new CartRepository();
    order = await repo.getOrderWithItems(orderId);
  } catch (error) {
    console.error("Error fetching order:", error);
    orderError = true;
  }

  // Si no se encuentra la orden o hay error, mostrar mensaje
  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Orden no encontrada</h1>
          <p className="text-muted-foreground">
            No pudimos encontrar tu orden en el sistema. Por favor, revisa tu
            email o contacta con soporte.
          </p>
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

  // Verificar que la orden esté aprobada
  if (order.status !== "approved" && order.status !== "paid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-100 p-4">
              <XCircle className="w-16 h-16 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Pago pendiente</h1>
          <p className="text-muted-foreground">
            Tu orden está siendo procesada. Te notificaremos cuando se confirme
            el pago.
          </p>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-left">
            <p className="font-medium mb-2">Número de orden:</p>
            <p className="font-mono text-xs">{order.order_number}</p>
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

  // Mostrar éxito con resumen de la orden
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-6">
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
        </div>

        {/* Número de orden */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Número de orden:
          </p>
          <p className="text-2xl font-bold font-mono">{order.order_number}</p>
        </div>

        {/* Resumen de la orden */}
        <div className="bg-white border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Resumen de la compra</h2>

          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.variacion_size} • {item.variacion_color}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.subtotal)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.unit_price)} c/u
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total</p>
              <p className="text-2xl font-bold">
                {formatPrice(order.total_amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Información de qué sigue */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-2 text-sm">
          <p className="font-medium">¿Qué sigue?</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Recibirás un email con el resumen de tu compra</li>
            <li>• Te contactaremos para coordinar la entrega</li>
            <li>• Puedes seguir el estado de tu pedido en tu email</li>
          </ul>
        </div>

        {/* Botones de navegación */}
        <div className="flex gap-3">
          <Link
            href="/productos"
            className="flex-1 border border-border px-6 py-3 rounded-lg hover:bg-muted transition text-center"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition text-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
