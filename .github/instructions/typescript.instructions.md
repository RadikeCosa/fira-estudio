---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript — Reglas del proyecto

## Tipos

- Siempre tipar parámetros y valor de retorno de funciones
- `interface` → modelos de dominio y DTOs
- `type` → unions, intersecciones, utilidades
- Nunca `any`; usar `unknown` y narrowing si el tipo es realmente desconocido

```ts
// ✅
export async function getProductos(): Promise<ProductoCompleto[]> { }
export interface ProductoCompleto extends Producto {
  categoria: Categoria | null;
  variaciones: Variacion[];
  imagenes: ImagenProducto[];
}

// ❌
let data: any;
async function get() { }
```

## Naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `ProductCard` |
| Funciones/vars | camelCase | `getProductos`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `SITE_CONFIG`, `WHATSAPP` |
| Contenido | `*_CONTENT` | `HOME_CONTENT` |
| Booleanos | prefijo `is/has/should` | `isLoading`, `hasError` |

## Imports

```ts
// ✅ Alias absoluto
import { getProductos } from "@/lib/supabase/queries";
import { TYPOGRAPHY } from "@/lib/design/tokens";

// ❌ Rutas relativas
import { getProductos } from "../../../lib/supabase/queries";
```

## Commits

Usar Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`