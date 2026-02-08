"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import type { Cart, CartItem } from "@/lib/types";
import { getCart } from "@/app/api/cart/actions";
import { CARRITO_CONTENT } from "@/lib/content/carrito";
import { BUTTONS, COMPONENTS } from "@/lib/design/tokens";

interface CheckoutFormData {
  email: string;
  nombre: string;
  telefono: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<(Cart & { items: CartItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    nombre: "",
    telefono: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({});

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();

      if (!cartData || !cartData.items || cartData.items.length === 0) {
        router.push("/carrito");
        return;
      }

      setCart(cartData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CheckoutFormData> = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = CARRITO_CONTENT.checkout.errors.requiredEmail;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = CARRITO_CONTENT.checkout.errors.invalidEmail;
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = CARRITO_CONTENT.checkout.errors.requiredNombre;
    } else if (formData.nombre.trim().length < 3) {
      errors.nombre = CARRITO_CONTENT.checkout.errors.shortNombre;
    }

    // Validar teléfono
    const telefonoRegex = /^[0-9\s\-\+\(\)]{8,20}$/;
    if (!formData.telefono.trim()) {
      errors.telefono = CARRITO_CONTENT.checkout.errors.requiredTelefono;
    } else if (!telefonoRegex.test(formData.telefono)) {
      errors.telefono = CARRITO_CONTENT.checkout.errors.invalidTelefono;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !cart) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: formData.email,
          customerName: formData.nombre,
          customerPhone: formData.telefono,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || CARRITO_CONTENT.checkout.errors.general);
      }

      // Redirigir a Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(CARRITO_CONTENT.checkout.errors.noLink);
      }
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Formulario */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {CARRITO_CONTENT.checkout.title}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            <p className="font-medium">
              {CARRITO_CONTENT.checkout.errors.general}
            </p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {CARRITO_CONTENT.checkout.email}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={
                COMPONENTS.input.base +
                " " +
                (formErrors.email ? COMPONENTS.error.border : "border-border")
              }
              placeholder={CARRITO_CONTENT.checkout.placeholders.email}
              disabled={submitting}
            />
            {formErrors.email && (
              <p className={COMPONENTS.error.text + " text-sm mt-1"}>
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium mb-2">
              {CARRITO_CONTENT.checkout.nombre}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className={
                COMPONENTS.input.base +
                " " +
                (formErrors.nombre ? COMPONENTS.error.border : "border-border")
              }
              placeholder={CARRITO_CONTENT.checkout.placeholders.nombre}
              disabled={submitting}
            />
            {formErrors.nombre && (
              <p className={COMPONENTS.error.text + " text-sm mt-1"}>
                {formErrors.nombre}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium mb-2"
            >
              {CARRITO_CONTENT.checkout.telefono}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              className={
                COMPONENTS.input.base +
                " " +
                (formErrors.telefono
                  ? COMPONENTS.error.border
                  : "border-border")
              }
              placeholder={CARRITO_CONTENT.checkout.placeholders.telefono}
              disabled={submitting}
            />
            {formErrors.telefono && (
              <p className={COMPONENTS.error.text + " text-sm mt-1"}>
                {formErrors.telefono}
              </p>
            )}
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={submitting}
            className={BUTTONS.primary + " w-full"}
          >
            {submitting
              ? CARRITO_CONTENT.checkout.processing
              : CARRITO_CONTENT.checkout.submit}
          </button>

          <p className="text-sm text-muted-foreground text-center">
            {CARRITO_CONTENT.checkout.instrucciones}
          </p>
        </form>
      </div>

      {/* Resumen del pedido */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {CARRITO_CONTENT.checkout.summary}
        </h2>

        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {cart.items.map((item) => {
              const producto = item.variacion?.producto;
              const imagenPrincipal =
                producto?.imagenes?.find((img) => img.es_principal)?.url ||
                producto?.imagenes?.[0]?.url;

              return (
                <div key={item.id} className="flex gap-3">
                  {imagenPrincipal && (
                    <div className="relative w-16 h-16 shrink-0">
                      <Image
                        src={getImageUrl(imagenPrincipal)}
                        alt={producto?.nombre || "Producto"}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {producto?.nombre || "Producto"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.variacion?.tamanio} • {item.variacion?.color}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatPrice(item.quantity * item.price_at_addition)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">
                {CARRITO_CONTENT.labels.total}
              </span>
              <span className="text-2xl font-bold">
                {formatPrice(cart.total_amount)}
              </span>
            </div>
          </div>

          {/* Link para volver */}
          <div className="pt-2">
            <a href="/carrito" className="text-sm text-primary hover:underline">
              {CARRITO_CONTENT.checkout.volver}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
