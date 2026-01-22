# Estándar de Metadata Centralizada

## Objetivo
Unificar la generación de metadata para SEO y redes sociales en todas las páginas del proyecto, usando la utilidad `buildMetadata` en `lib/seo/metadata.ts`.

## Beneficios
- Consistencia en los campos de metadata
- Mejor SEO y social sharing
- Mantenimiento más sencillo
- Uso centralizado de SITE_CONFIG

## Uso de `buildMetadata`
Importa la función en tu página:

```typescript
import { buildMetadata } from "@/lib/seo/metadata";
```

### Ejemplo para páginas estáticas
```typescript
export const metadata = buildMetadata({
  title: "Contacto",
  description: `Contactate con ${SITE_CONFIG.name}. Envianos tu consulta y te responderemos a la brevedad.`,
});
```

### Ejemplo para páginas dinámicas
```typescript
export async function generateMetadata({ params }) {
  // ...lógica para obtener datos dinámicos...
  return buildMetadata({
    title: producto.nombre,
    description: producto.descripcion,
    image: producto.imagenDestacada,
    url: `${SITE_CONFIG.url}/productos/${producto.slug}`,
  });
}
```

## Campos estandarizados
- `title`
- `description`
- `openGraph` (con `title`, `description`, `type`, `locale`, `url`, `siteName`, `images`)
- `twitter` (con `card`, `title`, `description`, `images`)

## Reglas
- Usa siempre SITE_CONFIG para valores por defecto.
- Incluye imagen destacada si está disponible, si no, se usará la default.
- Para páginas dinámicas, asegúrate de pasar los datos correctos.
- Mantén la lógica de metadata fuera de los componentes.

## Ejemplo de importación y uso
```typescript
import { buildMetadata } from "@/lib/seo/metadata";
```

## Actualización
Si agregas nuevos campos relevantes para SEO, actualiza la utilidad y este documento.

---

**Última actualización:** 22/01/2026
