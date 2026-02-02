# Error Boundaries Implementation

## Objetivo

Proporcionar error boundaries específicas para diferentes tipos de errores en Fira Estudio, reemplazando un manejador genérico con componentes contextuales.

---

## 🏗️ Arquitectura

### Files Principales

```
lib/errors/
├── types.ts              # ErrorType enum y classifyError()
└── types.test.ts         # Tests

components/errors/
├── NetworkError.tsx      # Error de conexión
├── DatabaseError.tsx     # Error de base de datos
├── NotFoundError.tsx     # Recurso no encontrado (404)
├── GenericError.tsx      # Error desconocido
└── index.ts              # Barrel export

app/productos/
├── error.tsx             # Error boundary para /productos
└── [slug]/
    └── error.tsx         # Error boundary para /productos/[slug]
```

---

## 🔍 Clasificación de Errores

### ErrorType Enum

```typescript
enum ErrorType {
  NETWORK = "NETWORK",         // Problemas de conexión
  DATABASE = "DATABASE",       // Errores de Supabase/PostgreSQL
  NOT_FOUND = "NOT_FOUND",     // 404 - Recurso no encontrado
  VALIDATION = "VALIDATION",   // Errores de validación
  UNKNOWN = "UNKNOWN",         // Desconocido (default)
}
```

### Patrones de Detección

#### NETWORK - Problemas de conexión

**Keywords:** "fetch", "network", "conexión", "timeout", "econnrefused"

```typescript
// Ejemplos
Error("fetch failed")         // ✓ NETWORK
Error("Network timeout")      // ✓ NETWORK
Error("ECONNREFUSED")         // ✓ NETWORK
Error("conexión rechazada")   // ✓ NETWORK
```

**Causas Comunes:**
- Usuario sin internet
- Servidor no accesible
- CORS issues
- DNS resolution failed

#### DATABASE - Errores de Supabase/PostgreSQL

**Keywords:** "pgrst", "database", "postgres", "supabase"

```typescript
// Ejemplos
Error("PGRST301: JWT expired")       // ✓ DATABASE
Error("database connection failed")  // ✓ DATABASE
Error("PGRST116")                    // ✓ NOT_FOUND (special case)
```

**Causas Comunes:**
- JWT token expirado
- Connection pool agotado
- Query timeout
- Violación de constraints

**Nota:** PGRST116 es un caso especial que mapea a NOT_FOUND (row not found).

#### NOT_FOUND - Recurso no encontrado

**Keywords:** "404", "not found", "no encontrado"

```typescript
// Ejemplos
Error("404 - Not Found")             // ✓ NOT_FOUND
Error("Producto no encontrado")      // ✓ NOT_FOUND
Error("PGRST116")                    // ✓ NOT_FOUND
```

**Causas Comunes:**
- URL slug inválido
- Recurso deletado
- Permiso insuficiente

#### VALIDATION - Errores de validación

**Keywords:** "validation", "validación", "invalid", "inválido"

```typescript
// Ejemplos
Error("Validation failed")           // ✓ VALIDATION
Error("Email inválido")              // ✓ VALIDATION
```

#### UNKNOWN - Default fallback

Cualquier error que no coincida con los patrones anteriores.

---

## 🎨 Componentes de Error

### 1. NetworkError

**Icono:** WiFi con slash  
**Mensaje:** "Error de conexión. Verificá tu conexión a internet e intentá nuevamente."  
**Acción:** Retry button

```typescript
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-container">
      <div className="error-icon">📡❌</div>
      <h2>Error de conexión</h2>
      <p>Verificá tu conexión a internet e intentá nuevamente.</p>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  );
}
```

### 2. DatabaseError

**Icono:** Database con slash  
**Mensaje:** "Error al cargar datos. Estamos trabajando en solucionarlo."  
**Acción:** Retry button

```typescript
export function DatabaseError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-container">
      <div className="error-icon">🗄️❌</div>
      <h2>Error al cargar datos</h2>
      <p>Estamos trabajando en solucionarlo. Intentá de nuevo en unos momentos.</p>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  );
}
```

### 3. NotFoundError

**Icono:** Search con X  
**Mensaje:** Customizable  
**Acción:** Link a /productos (sin retry)

```typescript
export function NotFoundError({
  message = "El contenido que buscás no está disponible",
}: {
  message?: string;
}) {
  return (
    <div className="error-container">
      <div className="error-icon">🔍❌</div>
      <h2>No encontrado</h2>
      <p>{message}</p>
      <a href="/productos">Volver a productos</a>
    </div>
  );
}
```

### 4. GenericError

**Icono:** Triangle alert  
**Mensaje:** "Algo salió mal."  
**Acción:** Retry button  
**Dev-only:** Stack trace (en development)

```typescript
export function GenericError({
  onRetry,
  error,
}: {
  onRetry: () => void;
  error?: Error;
}) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Algo salió mal</h2>
      <p>No pudimos procesar tu solicitud. Intentá de nuevo.</p>
      
      {process.env.NODE_ENV === "development" && error && (
        <details className="dev-only">
          <summary>Detalles del error (dev only)</summary>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </details>
      )}
      
      <button onClick={onRetry}>Reintentar</button>
    </div>
  );
}
```

---

## 📍 Uso en Error Boundary

### app/productos/error.tsx

```typescript
"use client";

import { useEffect } from "react";
import { classifyError, ErrorType } from "@/lib/errors/types";
import {
  NetworkError,
  DatabaseError,
  NotFoundError,
  GenericError,
} from "@/components/errors";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductosError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.)
    console.error("[Productos Error]", error);
  }, [error]);

  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.NETWORK:
      return <NetworkError onRetry={reset} />;
    
    case ErrorType.DATABASE:
      return <DatabaseError onRetry={reset} />;
    
    case ErrorType.NOT_FOUND:
      return <NotFoundError message="Los productos no están disponibles" />;
    
    default:
      return <GenericError onRetry={reset} error={error} />;
  }
}
```

### app/productos/[slug]/error.tsx

```typescript
"use client";

import { classifyError, ErrorType } from "@/lib/errors/types";
import { NotFoundError, DatabaseError, GenericError } from "@/components/errors";

export default function ProductoDetailError({ error, reset }) {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.NOT_FOUND:
      return (
        <NotFoundError message="Este producto no existe o fue removido" />
      );
    
    case ErrorType.DATABASE:
      return <DatabaseError onRetry={reset} />;
    
    default:
      return <GenericError onRetry={reset} error={error} />;
  }
}
```

---

## 🧪 Testing

### lib/errors/types.test.ts

```typescript
import { classifyError, ErrorType } from "@/lib/errors/types";

describe("classifyError", () => {
  describe("NETWORK errors", () => {
    it("debería clasificar 'fetch failed' como NETWORK", () => {
      const error = new Error("fetch failed");
      expect(classifyError(error)).toBe(ErrorType.NETWORK);
    });

    it("debería ser case-insensitive", () => {
      expect(classifyError(new Error("FETCH FAILED"))).toBe(ErrorType.NETWORK);
      expect(classifyError(new Error("Fetch Failed"))).toBe(ErrorType.NETWORK);
    });

    it("debería detectar 'econnrefused'", () => {
      expect(classifyError(new Error("ECONNREFUSED"))).toBe(ErrorType.NETWORK);
    });
  });

  describe("DATABASE errors", () => {
    it("debería clasificar PGRST errors como DATABASE", () => {
      expect(classifyError(new Error("PGRST301: JWT expired"))).toBe(
        ErrorType.DATABASE
      );
    });

    it("PGRST116 debería ser NOT_FOUND (special case)", () => {
      expect(classifyError(new Error("PGRST116: row not found"))).toBe(
        ErrorType.NOT_FOUND
      );
    });
  });

  describe("NOT_FOUND errors", () => {
    it("debería detectar '404'", () => {
      expect(classifyError(new Error("404 - Not Found"))).toBe(
        ErrorType.NOT_FOUND
      );
    });
  });

  describe("VALIDATION errors", () => {
    it("debería detectar 'validation'", () => {
      expect(classifyError(new Error("Validation failed"))).toBe(
        ErrorType.VALIDATION
      );
    });
  });

  describe("UNKNOWN errors", () => {
    it("debería usar UNKNOWN como default", () => {
      expect(classifyError(new Error("Random error"))).toBe(ErrorType.UNKNOWN);
    });
  });
});
```

---

## 🛠️ Troubleshooting

### Problema: Error Boundary no se activa

**Síntomas:** Error aparece en console pero no se muestra error boundary  
**Causas:**
- Error ocurrió en client component sin "use client"
- Error en event handler (no en render)
- Error en useEffect sin try/catch

**Solución:**
```typescript
// ✅ CORRECTO - Atrapar en useEffect
"use client";
import { useEffect } from "react";

export function Component() {
  useEffect(() => {
    try {
      // Async operation
      await fetchData();
    } catch (error) {
      // Error boundary NO atrapa esto
      // Maneja manualmente o re-throw
      throw error;
    }
  }, []);
}
```

### Problema: Error Message muy genérico

**Síntomas:** classifyError devuelve UNKNOWN para errors específicos  
**Solución:** Agregar nuevas keywords a classifyError:

```typescript
export function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  // Agregar keyword de tu nuevo tipo de error
  if (message.includes("tu-keyword-especifica")) {
    return ErrorType.YOUR_TYPE;
  }
  
  // ... resto de patterns
}
```

### Problema: Stack trace no visible en dev

**Solución:** Asegúrate que error está siendo pasado a GenericError:

```typescript
// ❌ INCORRECTO
<GenericError onRetry={reset} />  // Sin error

// ✅ CORRECTO
<GenericError onRetry={reset} error={error} />
```

---

## 🎯 Best Practices

### ✅ DO: Ser específico con mensajes

```typescript
// ✅ BUENO
<NotFoundError message="El producto 'Mantel Floral' no existe" />

// ❌ MALO
<NotFoundError message="Not found" />
```

### ✅ DO: Loguear errores

```typescript
useEffect(() => {
  console.error("[Productos Error]", error);
  // Enviar a Sentry, LogRocket, etc.
  captureException(error);
}, [error]);
```

### ✅ DO: Proporcionar alternativas

```typescript
// ✅ BUENO - Ofrece alternativa
<NotFoundError message="Este producto fue removido. Explorar otros →" />

// ❌ MALO - Solo dice el error
<NotFoundError message="Producto no encontrado" />
```

### ❌ DON'T: Exponer detalles técnicos en producción

```typescript
// ❌ MALO
<GenericError message={error.message} />  // "PGRST301: JWT expired"

// ✅ BUENO
<GenericError message="No pudimos conectar con el servidor" />
// (Detalles técnicos solo en dev)
```

---

## 📊 Error Handling Flow

```
User Action
    ↓
Component renders
    ↓
Error occurs (in render or async)
    ↓
Error Boundary catches it
    ↓
classifyError() categorizes
    ↓
Switch statement renders appropriate component
    ↓
User sees friendly error message
    ↓
User clicks "Retry" → reset()
```

---

## 🔗 Referencias

- `lib/errors/types.ts` - Error classification logic
- `components/errors/` - Error components
- `app/productos/error.tsx` - Error boundary example
- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling


## Usage Example

```typescript
// app/productos/error.tsx
"use client";

import { classifyError, ErrorType } from "@/lib/errors/types";
import { NetworkError, DatabaseError, NotFoundError, GenericError } from "@/components/errors";

export default function ProductosError({ error, reset }: ErrorBoundaryProps) {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.NETWORK:
      return <NetworkError onRetry={reset} />;
    case ErrorType.DATABASE:
      return <DatabaseError onRetry={reset} />;
    case ErrorType.NOT_FOUND:
      return <NotFoundError message="Los productos que buscás no están disponibles" />;
    default:
      return <GenericError onRetry={reset} error={error} />;
  }
}
```

## Design Consistency

All error components follow the same structure:

1. Centered container with max-width and padding
2. Border and background (muted)
3. Icon in colored circle (16x16 container, 8x8 icon)
4. Heading + descriptive message
5. Action button (Retry or Link) with accent color
6. Development-only error details (where applicable)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard accessible buttons/links
- Focus states with ring styles
- ARIA-friendly error messages

## Testing

To test the implementation:

1. Visit `/test-errors` to see all error states
2. Simulate errors in development to trigger actual error boundaries
3. Run tests: `npm run test:node` (tests the classifyError function)

## Future Enhancements

- Add animations for error transitions
- Add error tracking/logging integration
- Add "Report Problem" button for production errors
- Add user feedback collection
