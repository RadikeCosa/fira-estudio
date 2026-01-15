/**
 * Loading state para página de detalle de producto
 */
export default function ProductLoading() {
  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div
          className="
          grid grid-cols-1 md:grid-cols-2
          gap-8 md:gap-12
        "
        >
          {/* Columna izquierda: Skeleton de imagen */}
          <div
            className="
            w-full aspect-square
            rounded-lg border border-border
            bg-muted animate-pulse
          "
          />

          {/* Columna derecha: Skeleton de información */}
          <div className="flex flex-col gap-8">
            {/* Badge de categoría */}
            <div
              className="
              w-24 h-6 rounded-full
              bg-muted animate-pulse
            "
            />

            {/* Título */}
            <div className="space-y-3">
              <div
                className="
                w-3/4 h-10
                rounded bg-muted animate-pulse
              "
              />
              <div
                className="
                w-1/2 h-10
                rounded bg-muted animate-pulse
              "
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <div
                className="
                w-full h-6
                rounded bg-muted animate-pulse
              "
              />
              <div
                className="
                w-full h-6
                rounded bg-muted animate-pulse
              "
              />
              <div
                className="
                w-2/3 h-6
                rounded bg-muted animate-pulse
              "
              />
            </div>

            {/* Detalles */}
            <div
              className="
              pt-6 space-y-4
              border-t border-border
            "
            >
              <div
                className="
                w-full h-5
                rounded bg-muted animate-pulse
              "
              />
              <div
                className="
                w-full h-5
                rounded bg-muted animate-pulse
              "
              />
            </div>

            {/* Selector y botón */}
            <div
              className="
              p-6 rounded-lg
              border border-border
              space-y-6
            "
            >
              <div
                className="
                w-full h-10
                rounded-lg bg-muted animate-pulse
              "
              />
              <div
                className="
                w-full h-10
                rounded-lg bg-muted animate-pulse
              "
              />
              <div
                className="
                w-full h-12
                rounded-lg bg-muted animate-pulse
              "
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
