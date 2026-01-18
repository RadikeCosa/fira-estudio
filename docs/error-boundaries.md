# Error Boundaries Implementation

## Overview
This implementation provides specific error boundaries for different types of errors in Muma Estudio, replacing the generic error handler with context-aware error components.

## Files Created

### Core Error Classification
- **`lib/errors/types.ts`** - Error classification system
  - `ErrorType` enum: NETWORK, DATABASE, NOT_FOUND, VALIDATION, UNKNOWN
  - `classifyError(error: Error): ErrorType` function
  - Detects patterns in error messages to classify errors

### Error Components
All components follow consistent design patterns with Tailwind CSS:

1. **`components/errors/NetworkError.tsx`**
   - WiFi icon with slash (connection issue)
   - Message: "Error de conexión. Verificá tu conexión a internet e intentá nuevamente."
   - Retry button

2. **`components/errors/DatabaseError.tsx`**
   - Database icon with slash
   - Message: "Error al cargar datos. Estamos trabajando en solucionarlo."
   - Retry button

3. **`components/errors/NotFoundError.tsx`**
   - Search icon with X
   - Customizable message (default: "El contenido que buscás no está disponible")
   - Link to /productos (no retry button)

4. **`components/errors/GenericError.tsx`**
   - Triangle alert icon
   - Message: "Algo salió mal. No pudimos procesar tu solicitud."
   - Retry button
   - Development-only error details

5. **`components/errors/index.ts`**
   - Barrel export for easy imports

### Updated Files
- **`app/productos/error.tsx`**
  - Uses `classifyError()` to determine error type
  - Renders appropriate error component via switch statement
  - Passes `reset` callback to components with retry buttons

### Testing
- **`lib/errors/types.test.ts`**
  - Comprehensive tests for `classifyError` function
  - Tests for all error types: Network, Database, Not Found, Validation, Unknown
  - Tests case insensitivity
  - Tests special cases (e.g., PGRST116 → NOT_FOUND)

### Demo Page (for testing)
- **`app/test-errors/page.tsx`**
  - Interactive demo page to view all error components
  - Visit `/test-errors` to see all error states
  - Can be removed after testing

## Error Classification Logic

```typescript
classifyError(error: Error): ErrorType
```

### Detection Patterns:

**NETWORK** - Connection issues
- Keywords: "fetch", "network", "conexión", "connection", "timeout", "econnrefused"
- Example: `Error("fetch failed")` → NETWORK

**DATABASE** - Supabase/PostgreSQL errors
- Keywords: "pgrst", "database", "postgres", "supabase"
- Special case: "pgrst116" → NOT_FOUND (row not found)
- Example: `Error("PGRST301: JWT expired")` → DATABASE

**NOT_FOUND** - Missing resources
- Keywords: "404", "not found", "no encontrado"
- Also: PGRST116 errors
- Example: `Error("404 - Not Found")` → NOT_FOUND

**VALIDATION** - Input validation errors
- Keywords: "validation", "validación", "invalid", "inválido"
- Example: `Error("Validation failed")` → VALIDATION

**UNKNOWN** - Default fallback
- Any error that doesn't match above patterns
- Example: `Error("Something went wrong")` → UNKNOWN

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
