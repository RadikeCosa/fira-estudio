"use client";

interface GenericErrorProps {
  onRetry: () => void;
  error?: Error;
}

export function GenericError({ onRetry, error }: GenericErrorProps) {
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
        {/* Ícono de error */}
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
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Mensaje de error */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Algo salió mal
          </h2>
          <p className="text-sm text-muted-foreground">
            No pudimos procesar tu solicitud. Por favor, intentá nuevamente.
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

        {/* Detalles técnicos (solo en dev) */}
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 w-full max-w-xl text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Detalles técnicos
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
