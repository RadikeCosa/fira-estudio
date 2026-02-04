# Configurar SERVICE_ROLE_KEY en Supabase

## 🔑 Problema

El CartRepository necesita la `SERVICE_ROLE_KEY` para bypasear las políticas RLS (Row Level Security) en desarrollo. Sin ella, todas las operaciones de carrito fallan con:

```
Error: new row violates row-level security policy for table "carts"
```

## ✅ Solución

### Paso 1: Obtener la SERVICE_ROLE_KEY desde Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings → API**
4. Busca **Service Role Key** (al lado de **Anon Public Key**)
5. Copia el valor completo (comienza con `eyJ...`)

### Paso 2: Agregar a `.env.local`

Edita `c:\Users\ramir\Documents\challaco\.env.local` y agrega:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Reemplaza el valor con tu clave real.**

### Paso 3: Restart del dev server

```bash
npm run dev
```

## ⚠️ Seguridad

- **NUNCA** expongas la SERVICE_ROLE_KEY en el cliente
- Solo usar en **Server Actions** y **API Routes**
- No guardar en git (`.env.local` está en `.gitignore`)
- Regenerar en producción

## 📋 Verificación

El servidor debe iniciar sin errores:

```
[Cart] Nuevo session_id generado: 844baf3c-9e8a-4486-9a29-1eb17a957ce1
GET / 200 in 1337ms (compile: 367ms, render: 970ms)
```

## 🔄 Alternativa: Desactivar RLS en Desarrollo

Si prefieres desactivar RLS temporalmente en desarrollo:

1. Ve a Supabase SQL Editor
2. Ejecuta `sql-code/disable-rls-dev.sql`
3. Luego:

```sql
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs DISABLE ROW LEVEL SECURITY;
```

**Importante:** Re-activar en producción.

## 📚 Referencias

- [Supabase Service Role Key](https://supabase.com/docs/guides/api/api-authentication#service-role-key)
- [RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
