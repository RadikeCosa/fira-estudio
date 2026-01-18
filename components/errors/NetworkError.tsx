"use client";

interface NetworkErrorProps {
  onRetry: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
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
        {/* Ícono de WiFi */}
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
              d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
            />
            <line
              x1="2"
              y1="22"
              x2="22"
              y2="2"
              strokeWidth={2}
              strokeLinecap="round"
              className="text-destructive"
            />
          </svg>
        </div>

        {/* Mensaje de error */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Error de conexión
          </h2>
          <p className="text-sm text-muted-foreground">
            Verificá tu conexión a internet e intentá nuevamente.
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
