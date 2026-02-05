# 🔧 Modo Mantenimiento

## ¿Qué es?

El modo mantenimiento permite deshabilitar temporalmente las compras en el sitio sin sacarlo completamente offline.

## Características

- ✅ **Banner visible** informando del mantenimiento
- ✅ **Sitio navegable** - los productos siguen visibles
- ✅ **Checkout deshabilitado** - no se pueden hacer compras
- ✅ **SEO preservado** - Google sigue indexando
- ✅ **Controlado por variables** - no requiere deploy para activar/desactivar

## Activar Modo Mantenimiento

### En Vercel (Producción)

1. Ve a **Settings → Environment Variables**
2. Edita o agrega:

```
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Tu mensaje personalizado aquí
```

3. Redeploy desde **Deployments** → último deploy → **Redeploy**

### En Local

Edita `.env.local`:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
```

Reinicia el servidor de desarrollo: `npm run dev`

## Desactivar Modo Mantenimiento

Cambia las variables a:

```
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

Y redeploy.

## Variables de Entorno

| Variable | Valores | Default | Descripción |
|----------|---------|---------|-------------|
| `NEXT_PUBLIC_MAINTENANCE_MODE` | `true`/`false` | `false` | Muestra el banner de mantenimiento |
| `NEXT_PUBLIC_CHECKOUT_ENABLED` | `true`/`false` | `true` | Habilita/deshabilita el checkout |
| `NEXT_PUBLIC_MAINTENANCE_MESSAGE` | texto | (mensaje default) | Mensaje personalizado del banner |

## Uso Recomendado

### Escenarios comunes:

1. **Configurando sistema de pagos** (ahora)
   - `MAINTENANCE_MODE=true`
   - `CHECKOUT_ENABLED=false`

2. **Migrando base de datos**
   - `MAINTENANCE_MODE=true`
   - `CHECKOUT_ENABLED=false`

3. **Operación normal**
   - `MAINTENANCE_MODE=false`
   - `CHECKOUT_ENABLED=true`

4. **Testing en Preview (develop)**
   - `MAINTENANCE_MODE=false`
   - `CHECKOUT_ENABLED=true`

## Implementación Técnica

### Archivos creados/modificados:

- **`lib/config/features.ts`**: Feature flags centralizados
- **`components/maintenance-banner.tsx`**: Banner de mantenimiento
- **`app/layout.tsx`**: Integración del banner
- **`components/carrito/AddToCartButton.tsx`**: Lógica de deshabilitación
- **`.env.local.example`**: Nuevas variables documentadas

### Cómo funciona:

1. **Feature Flags** (`lib/config/features.ts`) lee las variables de entorno
2. **Banner** (`maintenance-banner.tsx`) se muestra solo si `IS_MAINTENANCE_MODE=true`
3. **Checkout** se deshabilita cuando `IS_CHECKOUT_ENABLED=false` o `IS_MAINTENANCE_MODE=true`
4. El banner es dismissible (usuario puede cerrarlo durante la sesión)

### Comportamiento del Checkout:

```typescript
// En AddToCartButton.tsx
const isCheckoutDisabled = IS_MAINTENANCE_MODE || !IS_CHECKOUT_ENABLED;

// El botón se deshabilita y muestra mensaje de error
if (isCheckoutDisabled) {
  setError("El checkout está temporalmente deshabilitado");
  return;
}
```

## Testing

### Probar localmente:

```bash
# 1. Crear .env.local con las variables
echo "NEXT_PUBLIC_MAINTENANCE_MODE=true" > .env.local
echo "NEXT_PUBLIC_CHECKOUT_ENABLED=false" >> .env.local

# 2. Ejecutar en desarrollo
npm run dev

# 3. Verificar:
# - Banner amarillo visible en la parte superior
# - Botón "Agregar al carrito" deshabilitado
# - Mensaje de error al intentar agregar
```

### Probar en Preview (Vercel):

1. Crear branch de feature
2. Push a GitHub
3. Vercel crea preview automático
4. Configurar variables en el preview environment
5. Verificar funcionamiento

## Troubleshooting

### El banner no aparece

- ✅ Verificar que `NEXT_PUBLIC_MAINTENANCE_MODE=true`
- ✅ Variables `NEXT_PUBLIC_*` requieren redeploy (no hot-reload)
- ✅ Verificar en Developer Console que `[Feature Flags]` muestra valores correctos

### El checkout sigue habilitado

- ✅ Verificar que `NEXT_PUBLIC_CHECKOUT_ENABLED=false` O `NEXT_PUBLIC_MAINTENANCE_MODE=true`
- ✅ Hacer hard refresh (Ctrl+Shift+R) para limpiar caché
- ✅ Verificar en Network tab que las variables se cargaron

### El mensaje no se personaliza

- ✅ Verificar que `NEXT_PUBLIC_MAINTENANCE_MESSAGE` está configurado
- ✅ Redeploy después de cambiar variables
- ✅ El mensaje tiene un default si la variable no existe

## Seguridad

- ✅ Las variables `NEXT_PUBLIC_*` son seguras de exponer (no contienen secretos)
- ✅ El banner es solo informativo (no afecta la seguridad)
- ✅ La deshabilitación del checkout es client-side (agregar validación server-side en el futuro)

## Roadmap Futuro

- [ ] Agregar validación server-side en las API routes del carrito
- [ ] Permitir modo mantenimiento parcial (solo ciertas categorías)
- [ ] Programar mantenimientos con fecha/hora específica
- [ ] Notificaciones automáticas por email cuando se activa/desactiva
- [ ] Página de estado dedicada (`/status`)
