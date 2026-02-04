"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCart } from "@/app/api/cart/actions";

export function CartIndicator() {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartCount();

    // Refresh cart count every 30 seconds
    const interval = setInterval(loadCartCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadCartCount = async () => {
    try {
      const cart = await getCart();
      if (cart?.items) {
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setItemCount(total);
      } else {
        setItemCount(0);
      }
    } catch (err) {
      console.error("Error loading cart count:", err);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Link
        href="/carrito"
        className="relative p-2 hover:bg-muted rounded-lg transition"
      >
        <ShoppingCart className="w-6 h-6" />
      </Link>
    );
  }

  return (
    <Link
      href="/carrito"
      className="relative p-2 hover:bg-muted rounded-lg transition"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
