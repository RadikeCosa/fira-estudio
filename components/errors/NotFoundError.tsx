"use client";

import Link from "next/link";

interface NotFoundErrorProps {
  message?: string;
}

export function NotFoundError({
  message = "El contenido que buscás no está disponible",
}: NotFoundErrorProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="
          flex
          min-h-[500px]
          flex-col
          items-center
          justify-center
          gap-6
          rounded-lg
          border border-border
          bg-muted/30
          p-8
          text-center
        "
      >
        {/* Ícono de búsqueda con X */}
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-muted
            text-muted-foreground
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9l6 6m0-6l-6 6"
              strokeWidth={2}
            />
          </svg>
        </div>

        {/* Mensaje de error */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            No encontrado
          </h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Link a productos */}
        <Link
          href="/productos"
          className="
            rounded-lg
            bg-accent
            px-6
            py-3
            font-medium
            text-white
            transition-all
            hover:bg-accent/90
            hover:shadow-md
            focus:outline-none
            focus:ring-2
            focus:ring-accent
            focus:ring-offset-2
          "
        >
          Ver todos los productos
        </Link>
      </div>
    </div>
  );
}
