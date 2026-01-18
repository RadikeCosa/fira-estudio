"use client";

interface DatabaseErrorProps {
  onRetry: () => void;
}

export function DatabaseError({ onRetry }: DatabaseErrorProps) {
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
        {/* Ícono de base de datos */}
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-destructive/10
            text-destructive
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
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6"
              strokeWidth={2.5}
              className="text-destructive"
            />
          </svg>
        </div>

        {/* Mensaje de error */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Error al cargar datos
          </h2>
          <p className="text-sm text-muted-foreground">
            Estamos trabajando en solucionarlo. Por favor, intentá nuevamente en
            unos momentos.
          </p>
        </div>

        {/* Botón reintentar */}
        <button
          onClick={onRetry}
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
          Reintentar
        </button>
      </div>
    </div>
  );
}
