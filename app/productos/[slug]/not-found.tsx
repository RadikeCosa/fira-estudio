import Link from "next/link";

/**
 * Página 404 para producto no encontrado
 */
export default function ProductNotFound() {
  return (
    <main
      className="
      min-h-screen
      flex items-center justify-center
      px-4
    "
    >
      <div
        className="
        text-center space-y-6
        max-w-md
      "
      >
        <h1
          className="
          text-6xl font-bold
          text-accent
        "
        >
          404
        </h1>

        <h2
          className="
          text-2xl font-semibold
          text-foreground
        "
        >
          Producto no encontrado
        </h2>

        <p
          className="
          text-accent
        "
        >
          El producto que buscás no existe o ya no está disponible.
        </p>

        <Link
          href="/productos"
          className="
            inline-block
            px-6 py-3 rounded-lg
            bg-accent text-background
            font-medium
            hover:opacity-90
            transition-opacity
          "
        >
          Ver todos los productos
        </Link>
      </div>
    </main>
  );
}
