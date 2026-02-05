# 🚨 QUICK SETUP: Activar Modo Mantenimiento en Producción

## Pasos Rápidos (Vercel)

1. Ve a: https://vercel.com/tu-proyecto/settings/environment-variables

2. Agrega estas variables en **Production**:
   ```
   NEXT_PUBLIC_MAINTENANCE_MODE = true
   NEXT_PUBLIC_CHECKOUT_ENABLED = false
   NEXT_PUBLIC_MAINTENANCE_MESSAGE = Estamos configurando nuestro sistema de pagos. La tienda estará disponible próximamente.
   ```

3. Ve a: https://vercel.com/tu-proyecto/deployments

4. Click en el último deployment → **Redeploy** → **Use existing Build Cache**

5. ✅ El banner de mantenimiento aparecerá en ~2 minutos

## Para Desactivar

Cambia las variables a:
```
NEXT_PUBLIC_MAINTENANCE_MODE = false
NEXT_PUBLIC_CHECKOUT_ENABLED = true
```

Y redeploy.

## Documentación Completa

- [MAINTENANCE_MODE.md](./MAINTENANCE_MODE.md) - Guía completa
- [MAINTENANCE_MODE_VISUAL.md](./MAINTENANCE_MODE_VISUAL.md) - Referencias visuales

## ¿Qué hace?

- ✅ Muestra banner amarillo informativo
- ✅ Deshabilita el botón "Agregar al carrito"
- ✅ El sitio sigue visible para navegación y SEO
- ❌ No permite realizar compras

## Archivos Modificados

- `lib/config/features.ts` - Feature flags
- `components/maintenance-banner.tsx` - Banner component
- `app/layout.tsx` - Banner integration
- `components/carrito/AddToCartButton.tsx` - Checkout disable logic
- `.env.local.example` - Environment variables reference

## Soporte

Si tienes problemas:
1. Verifica que las variables estén en el environment correcto
2. Asegúrate de hacer Redeploy después de cambiar variables
3. Las variables `NEXT_PUBLIC_*` requieren rebuild
4. Limpia caché del navegador (Ctrl+Shift+R)
