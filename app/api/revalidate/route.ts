import { NextRequest, NextResponse } from "next/server";
import {
  revalidateProductos,
  revalidateCategorias,
} from "@/lib/cache/revalidate";

/**
 * Endpoint para revalidar cache manualmente
 * Solo funciona en desarrollo o con token válido
 *
 * Uso:
 * POST /api/revalidate?type=productos&secret=tu_secret
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type") || "productos";

  // En desarrollo, permite sin secret
  // En producción, requiere token
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    if (type === "productos") {
      revalidateProductos();
    } else if (type === "categorias") {
      revalidateCategorias();
    } else {
      revalidateProductos();
      revalidateCategorias();
    }

    return NextResponse.json({
      revalidated: true,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed", details: (err as Error).message },
      { status: 500 },
    );
  }
}
