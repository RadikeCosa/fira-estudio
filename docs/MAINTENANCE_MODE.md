# 🔧 Modo Mantenimiento

## ¿Qué es?

El modo mantenimiento permite deshabilitar temporalmente las compras en el sitio sin sacarlo completamente offline.

## Características

- ✅ **Banner visible** informando del mantenimiento (amarillo, parte superior)
- ✅ **Sitio navegable** - los productos siguen visibles
- ✅ **Checkout deshabilitado** - no se pueden hacer compras
- ✅ **SEO preservado** - Google sigue indexando
- ✅ **Controlado por variables** - no requiere deploy para activar/desactivar

---

## 🎯 Estado Actual

**Producción:** 🟡 **MODO MANTENIMIENTO ACTIVO**

**Razón:** Esperando credenciales de producción de Mercado Pago

**Fecha estimada de reactivación:** Por definir (cuando se obtengan credenciales PROD)

---

## Activar Modo Mantenimiento

### En Vercel (Producción)

1. Ve a **Settings → Environment Variables**
2. Edita o agrega:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Tu mensaje personalizado aquí
```

3. Redeploy desde **Deployments** → último deploy → **"..."** → **Redeploy**

### En Local

Edita `.env.local`:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
```

Reinicia el servidor de desarrollo: `npm run dev`

---

## Desactivar Modo Mantenimiento

### En Vercel

Cambia las variables a:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

Y redeploy.

### En Local

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

Reinicia el servidor.

---

## Variables de Entorno

| Variable                          | Valores        | Default           | Descripción                        |
| --------------------------------- | -------------- | ----------------- | ---------------------------------- |
| `NEXT_PUBLIC_MAINTENANCE_MODE`    | `true`/`false` | `false`           | Muestra el banner de mantenimiento |
| `NEXT_PUBLIC_CHECKOUT_ENABLED`    | `true`/`false` | `true`            | Habilita/deshabilita el checkout   |
| `NEXT_PUBLIC_MAINTENANCE_MESSAGE` | texto          | (mensaje default) | Mensaje personalizado del banner   |

---

## Uso Recomendado

### Escenarios comunes:

#### 1. **Configurando sistema de pagos** (ACTUAL)

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
```

**Banner muestra:** "Estamos configurando nuestro sistema de pagos. La tienda estará disponible próximamente."

#### 2. **Migrando base de datos**

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_CHECKOUT_ENABLED=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=Estamos mejorando nuestra infraestructura. Volvemos en 2 horas.
```

#### 3. **Operación normal**

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

#### 4. **Testing en Preview (develop)**

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

**Siempre sin mantenimiento en entornos de preview/staging**

---

## Implementación Técnica

### Banner Component

Ubicación: `components/maintenance-banner.tsx`

Características:

- Posición fija en la parte superior (`fixed top-0 z-[100]`)
- Solo se renderiza si `IS_NEXT_PUBLIC_MAINTENANCE_MODE === true`
- Botón de cierre (estado en cliente, se puede cerrar temporalmente)
- Hard refresh restaura el banner si fue cerrado

### Feature Flags

Ubicación: `lib/config/features.ts`

```typescript
export const IS_NEXT_PUBLIC_MAINTENANCE_MODE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export const IS_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

export const MAINTENANCE_MESSAGE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
  "Estamos realizando mejoras en nuestro sistema de pagos...";
```

---

## Checklist para Salir de Mantenimiento

Cuando esté listo para activar el checkout en producción:

- [ ] Obtener credenciales **PRODUCTION** de Mercado Pago
- [ ] Actualizar `MERCADOPAGO_ACCESS_TOKEN` en Vercel Production (reemplazar placeholder)
- [ ] Actualizar `MERCADOPAGO_WEBHOOK_SECRET` en Vercel Production
- [ ] Configurar webhook URL en Mercado Pago Dashboard
- [ ] Hacer test de compra en staging
- [ ] Cambiar variables en Vercel Production:
  ```bash
  NEXT_PUBLIC_MAINTENANCE_MODE=false
  NEXT_PUBLIC_CHECKOUT_ENABLED=true
  ```
- [ ] Redeploy producción
- [ ] Verificar que el banner desaparece
- [ ] Hacer test de compra real con tarjeta de prueba
- [ ] Monitorear errores en las primeras horas

---

## FAQ

**P: ¿Los usuarios pueden ver el sitio en modo mantenimiento?**  
R: Sí, pueden navegar y ver productos, solo no pueden comprar.

**P: ¿Afecta al SEO?**  
R: No, el sitio sigue accesible para Google. Solo deshabilitamos el checkout.

**P: ¿Puedo cambiar el mensaje sin redeploy?**  
R: Sí, cambia `NEXT_PUBLIC_MAINTENANCE_MESSAGE` en Vercel y redeploy (rápido, sin cambios de código).

**P: ¿Preview deployments tienen modo mantenimiento?**  
R: No, staging/preview siempre tienen el checkout habilitado para testing.

**P: ¿Qué pasa si cierro el banner?**  
R: Se oculta temporalmente pero vuelve a aparecer en hard refresh o nueva sesión.

---

Última actualización: 2026-02-06
Estado: Modo mantenimiento activo en producción
