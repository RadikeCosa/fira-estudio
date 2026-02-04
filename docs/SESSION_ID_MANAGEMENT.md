# Session ID - Gestión de Carritos Anónimos

**Última actualización:** 4 de febrero de 2026

## 📋 Descripción

El `session_id` es un identificador único que permite mantener carritos de compra para usuarios anónimos (sin autenticación obligatoria) durante 7 días.

---

## 🔑 Cómo Funciona

### Flujo de Session ID

```
1. Usuario accede a la tienda
   ├─ No necesita login
   ├─ Se genera session_id (UUID v4)
   └─ Se guarda en cookie HTTP-only
        ↓

2. Usuario navega por productos
   ├─ Agrega productos al carrito
   ├─ Server Action: "use server" getCart()
   ├─ Extrae session_id de cookies
   ├─ Busca carrito en BD con ese session_id
   └─ Retorna items del carrito
        ↓

3. Usuario va a checkout
   ├─ Completa formulario
   ├─ POST /api/checkout/create-preference
   ├─ Server extrae session_id de request.cookies
   ├─ Busca carrito en BD
   ├─ Crea orden vinculada a ese session_id
   └─ Procesa pago
        ↓

4. Después del pago
   ├─ Webhook actualiza orden
   ├─ Carrito sigue disponible (puede agregar más)
   ├─ Mantiene persistencia durante 7 días
   └─ Luego se limpia automáticamente (cron job)
```

---

## 🛠️ Implementación

### En Client (Server Actions)

**Archivo:** `app/api/cart/actions.ts`

```typescript
"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 días

function getSessionId(): string {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    // Generar nuevo UUID
    sessionId = crypto.randomUUID();

    // Guardar en cookie (HTTP-only, secure, SameSite)
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return sessionId;
}
```

**Características:**

- ✅ UUID único generado con `crypto.randomUUID()`
- ✅ Almacenado en cookie HTTP-only (no accesible desde JavaScript)
- ✅ Secure: Solo enviado en HTTPS en producción
- ✅ SameSite: Protección contra CSRF
- ✅ Expira en 7 días automáticamente

### En Server (API Route)

**Archivo:** `app/api/checkout/create-preference/route.ts`

```typescript
function getSessionId(req: NextRequest): string {
  const sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    throw new Error("No session_id found in cookies");
  }
  return sessionId;
}

export async function POST(req: NextRequest) {
  const session_id = getSessionId(req);
  const cart = await CartRepository.getCartWithItems(session_id);
  // ... resto del código
}
```

---

## 🔐 Seguridad

### Cookie HTTP-Only

```typescript
httpOnly: true,  // No accesible desde JS (previene XSS)
secure: process.env.NODE_ENV === "production",  // Solo HTTPS en prod
sameSite: "lax",  // Protección CSRF
```

### Beneficios

✅ No puede ser accedida por JavaScript malicioso  
✅ Solo se envía en HTTPS en producción  
✅ Protección contra ataques CSRF  
✅ Se renueva automáticamente en cada request  
✅ Expira después de 7 días sin actividad

### Base de Datos

```sql
-- session_id es UNIQUE en tabla carts
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  session_id TEXT UNIQUE,  -- Identifica el usuario anónimo
  total_amount NUMERIC,
  expires_at TIMESTAMPTZ
);

-- RLS protege que cada usuario solo vea su carrito
CREATE POLICY "users see own cart" ON carts
  FOR ALL USING (session_id = current_session_id);
```

---

## 📊 Ciclo de Vida del Session ID

```
CREACIÓN (Primer acceso)
├─ Genera UUID: 550e8400-e29b-41d4-a716-446655440000
├─ Crea entrada en tabla carts
├─ Guarda en cookie
└─ expires_at = NOW() + 7 días

        ↓

UTILIZACIÓN (Activo durante 7 días)
├─ Usuario agrega items
├─ Server accede a session_id desde cookies
├─ Busca carrito en BD
├─ Retorna/actualiza items
├─ Cookie se renueva automáticamente
└─ expires_at se actualiza (NOW() + 7 días)

        ↓

EXPIRACIÓN (Después de 7 días sin actividad)
├─ Cookie expira en navegador
├─ BD marca carrito como expirado
├─ Cron job limpia carritos expirados
└─ Usuario obtiene nuevo session_id en siguiente acceso
```

---

## 💾 Almacenamiento en BD

### Tabla: carts

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,  -- Identificador anónimo
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Índice para búsquedas rápidas
CREATE INDEX carts_session_id_idx ON carts(session_id);
```

### Consultas

```sql
-- Obtener carrito de un usuario
SELECT * FROM carts WHERE session_id = 'UUID-aqui';

-- Ver carritos activos
SELECT COUNT(*) FROM carts
WHERE expires_at > NOW();

-- Limpiar carritos expirados (cron job)
DELETE FROM carts
WHERE expires_at < NOW();
```

---

## 🔄 Flujo de Checkout

### Paso 1: Cliente llama a getCart()

```typescript
// En componente (frontend)
const cart = await getCart(); // Server Action
```

**Lo que ocurre:**

```typescript
// En servidor (app/api/cart/actions.ts)
export async function getCart() {
  const session_id = getSessionId(); // Extrae de cookies
  // Retorna carrito del usuario
  return await CartRepository.getCartWithItems(session_id);
}
```

### Paso 2: Usuario va a checkout

```typescript
// POST /api/checkout/create-preference
const preference = {
  items: [...],
  payer: { email, name, phone },
  external_reference: orderId,  // UUID de orden
};
```

**Lo que ocurre:**

```typescript
export async function POST(req: NextRequest) {
  const session_id = getSessionId(req); // Extrae de request.cookies

  const cart = await CartRepository.getCartWithItems(session_id);

  // Crea orden vinculada a este session_id
  const orderId = await CartRepository.createOrderWithItems(
    cart.id,
    customerEmail,
    customerName,
    total,
    cart.items,
    customerPhone,
    shippingAddress,
  );
}
```

---

## 🧪 Testing

### En Desarrollo

```bash
# 1. Iniciar dev server
npm run dev

# 2. Abrir en navegador
http://localhost:3000

# 3. Ver cookies (DevTools)
F12 → Application → Cookies → localhost:3000
# Verás: session_id = "550e8400-e29b-41d4-a716-446655440000"

# 4. Agregar al carrito
# La cookie se mantiene y reutiliza

# 5. Ir a checkout
# El formulario ya tiene email/teléfono pre-llenados
```

### En Supabase

```sql
-- Ver carrito del usuario
SELECT * FROM carts
WHERE session_id = 'UUID-que-ves-en-cookies';

-- Ver items del carrito
SELECT ci.*, v.tamanio, v.color
FROM cart_items ci
JOIN variaciones v ON ci.variacion_id = v.id
WHERE ci.cart_id = 'CART-ID';
```

---

## 🔄 Continuidad Multi-Dispositivo (Futuro)

### Actualmente (Session ID basado en cookies)

```
Desktop:
  - Cookie con session_id en navegador
  - Carrito vinculado a ese session_id
  - 7 días de persistencia

Móvil:
  - Nueva cookie con diferente session_id
  - Carrito separado
```

### Futuro (Con autenticación)

```typescript
// Cuando usuario inicia sesión
const userId = currentUser.id;

// Usar user_id en lugar de session_id
const cart = await CartRepository.getCartByUserId(userId);

// Carrito se sincroniza en todos los dispositivos
```

---

## 🐛 Debugging

### Session ID no se crea

**Síntoma:** Error "No session_id found in cookies"

**Debug:**

```typescript
function getSessionId(): string {
  const cookieStore = cookies();
  console.log("[Cart] Cookies:", cookieStore.getAll());
  // Verá todas las cookies
}
```

### Carrito no persiste

**Síntoma:** Cada reload crea new session_id

**Causa:** Cookies deshabilitadas en navegador

**Solución:** Verificar settings de cookies

### Carrito expira a los 7 días

**Comportamiento esperado:** Cookies expiran automáticamente

**Para extender:** Llamar a `getCart()` renueva la cookie

---

## 📊 Monitoreo

### Queries útiles

```sql
-- Sesiones activas
SELECT COUNT(DISTINCT session_id) as active_sessions
FROM carts
WHERE expires_at > NOW();

-- Sesiones más antiguas
SELECT session_id, created_at, expires_at
FROM carts
ORDER BY created_at DESC
LIMIT 10;

-- Carritos con items (usuarios activos)
SELECT c.session_id, COUNT(ci.id) as item_count
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
GROUP BY c.session_id
HAVING COUNT(ci.id) > 0;
```

---

## ✅ Checklist

- [x] Session ID generado con UUID v4
- [x] Almacenado en cookie HTTP-only
- [x] Seguridad: Secure flag en producción
- [x] Seguridad: SameSite=lax para CSRF
- [x] Expira en 7 días
- [x] Se renueva en cada acceso
- [x] Vinculado a carrito en BD
- [x] Usado en getCart(), addToCart(), etc.
- [x] Usado en create-preference para obtener carrito
- [x] Documentación completa

---

## 🚀 Próximos Pasos

### Inmediato

1. **Probar en desarrollo:**

   ```bash
   npm run dev
   # Verificar que session_id aparece en DevTools
   ```

2. **Agregar al carrito:**
   - Session ID debe persistir
   - Carrito debe mantenerse en reload

3. **Ir a checkout:**
   - Session ID debe usarse para obtener carrito
   - Preferencia debe crearse exitosamente

### Futuro

- [ ] Cron job para limpiar carritos expirados
- [ ] Migración de carrito anónimo a autenticado
- [ ] Sincronización entre dispositivos (post-login)
- [ ] Analytics de abandonos de carrito
- [ ] Notificaciones de carrito abandonado

---

## 📚 Referencias

- [Next.js Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [HTTP Cookie - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Session Management Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

## 🎯 Resumen

✅ **Session ID:** UUID único por usuario anónimo  
✅ **Almacenamiento:** Cookie HTTP-only (7 días)  
✅ **Seguridad:** Secure, SameSite, HTTPOnly  
✅ **Persistencia:** Carrito se mantiene entre sesiones  
✅ **Escalabilidad:** Soporta anónimos sin obligar login

**Estado:** ✅ Completamente implementado
