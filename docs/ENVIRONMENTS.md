# 🌐 Guía de Entornos - Fira Estudio

Esta guía explica cómo están configurados los diferentes entornos del proyecto y cómo trabajar con cada uno.

---

## 📊 Resumen de Entornos

| Entorno             | Rama Git               | Deploy en         | URL                                               | Propósito        |
| ------------------- | ---------------------- | ----------------- | ------------------------------------------------- | ---------------- |
| **Development**     | local                  | localhost         | `http://localhost:3000`                           | Desarrollo local |
| **Staging/Preview** | `develop`, `feature/*` | Vercel Preview    | `fira-estudio-git-[branch]-radikecosa.vercel.app` | Testing y demos  |
| **Production**      | `main`                 | Vercel Production | `fira-estudio.vercel.app`                         | Sitio público    |

---

## 🔧 Development (Local)

### **Propósito**

Desarrollo activo de features en tu máquina local.

### **Configuración**

**Rama:** Cualquiera (usualmente `feature/*` o `develop`)

**Variables de entorno:** `.env.local`

```bash
# Copiar desde template
cp .env.local.example .env.local

# Editar con tus valores reales
nano .env.local
```

### **Características**

- ✅ Mercado Pago en modo **TEST** (credenciales SANDBOX)
- ✅ Supabase apunta a proyecto compartido
- ✅ Debug flags habilitados (WEBHOOK*SKIP*\*)
- ✅ Hot reload
- ✅ Sin Google Analytics
- ✅ Checkout habilitado para testing

### **Comandos**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build local
npm run build

# Ejecutar build localmente
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

### **Variables clave**

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MERCADOPAGO_ACCESS_TOKEN=TEST-XXXXX           # Credenciales SANDBOX
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_MAINTENANCE_MODE=false             # Sin mantenimiento en dev
NEXT_PUBLIC_CHECKOUT_ENABLED=true              # Checkout habilitado
WEBHOOK_SKIP_IP_VALIDATION=true                # Para probar webhooks localmente
```

---

## 🧪 Staging/Preview (Vercel Preview Deployments)

### **Propósito**

Testing de features antes de ir a producción, demos para stakeholders.

### **Configuración**

**Ramas:** `develop`, `feature/*`, cualquier rama que no sea `main`

**Deploy automático:** Cada push a estas ramas crea un Preview Deployment

**Variables de entorno:** Configuradas en Vercel con entorno **Preview**

### **Características**

- ✅ Mercado Pago en modo **TEST** (credenciales SANDBOX)
- ✅ Supabase proyecto compartido (mismo que prod por ahora)
- ✅ URL única por branch/commit
- ✅ Sin Google Analytics
- ✅ Checkout habilitado para testing
- ✅ Sin modo mantenimiento
- ✅ Accesible sin login (Vercel Authentication: disabled)

### **URLs**

```
develop → https://fira-estudio-git-develop-radikecosa.vercel.app
feature/emails → https://fira-estudio-git-feature-emails-radikecosa.vercel.app
```

### **Workflow típico**

```bash
# Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Desarrollar localmente
npm run dev
# ... hacer cambios ...

# Push para crear Preview Deployment
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Vercel automáticamente:
# 1. Detecta el push
# 2. Crea un deployment
# 3. Comenta en el commit con la URL del preview
# 4. Puedes compartir la URL para feedback
```

### **Variables clave en Vercel (Preview)**

```bash
NEXT_PUBLIC_SITE_URL=                          # Vercel usa VERCEL_URL automáticamente
MERCADOPAGO_ACCESS_TOKEN=TEST-XXXXX            # Credenciales SANDBOX
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_MAINTENANCE_MODE=false             # Sin banner en staging
NEXT_PUBLIC_CHECKOUT_ENABLED=true              # Checkout funcional
```

---

## 🚀 Production (Vercel Production)

### **Propósito**

Sitio público accesible por usuarios finales y clientes reales.

### **Configuración**

**Rama:** `main`

**Deploy automático:** Cada merge a `main` despliega a producción

**Variables de entorno:** Configuradas en Vercel con entorno **Production**

### **Características**

- ⚠️ Mercado Pago en modo **PRODUCCIÓN** (cuando tengas credenciales reales)
- ⚠️ Supabase proyecto de producción (compartido por ahora)
- ✅ Google Analytics habilitado
- ⚠️ **Modo mantenimiento activo** (hasta tener credenciales PROD de MP)
- ❌ Checkout deshabilitado temporalmente
- ❌ Sin debug flags

### **URL**

```
https://fira-estudio.vercel.app
```

### **Workflow típico**

```bash
# Features se mergean a develop primero
git checkout develop
git pull origin develop
git merge feature/nueva-funcionalidad
git push origin develop

# Probar en Preview deployment de develop
# Verificar que todo funciona correctamente

# Cuando esté listo para producción, PR de develop → main
# 1. Abrir PR en GitHub: develop → main
# 2. Revisar cambios
# 3. Mergear (Squash and merge recomendado)
# 4. Vercel automáticamente despliega a producción
```

### **Variables clave en Vercel (Production)**

```bash
NEXT_PUBLIC_SITE_URL=https://fira-estudio.vercel.app
MERCADOPAGO_ACCESS_TOKEN=PENDING_PRODUCTION_TOKEN_REQUIRED  # ⚠️ Placeholder temporal
MERCADOPAGO_WEBHOOK_SECRET=PENDING_PRODUCTION_SECRET_REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX     # Analytics solo en prod
NEXT_PUBLIC_MAINTENANCE_MODE=true              # ⚠️ Activo hasta tener creds PROD
NEXT_PUBLIC_CHECKOUT_ENABLED=false             # ⚠️ Deshabilitado hasta tener creds PROD
```

---

## 🔐 Gestión de Secretos

### **Nunca commitear:**

- ❌ `.env.local`
- ❌ `.env.development`
- ❌ `.env.staging`
- ❌ `.env.production`
- ❌ Cualquier archivo con credenciales reales

### **Sí commitear:**

- ✅ `.env.local.example` (template sin valores reales)
- ✅ `.env.production.example` (template de referencia)
- ✅ Documentación sobre qué variables se necesitan

### **Dónde guardar secretos:**

- **Local:** `.env.local` (git-ignored)
- **Vercel:** Settings → Environment Variables
- **Backup seguro:** 1Password, LastPass, Bitwarden, etc.

---

## 🔄 Git Flow

```
main (production)
  ↑
  └── PR (cuando feature está lista)
       ↑
develop (staging permanente)
  ↑
  └── feature/nueva-funcionalidad (preview por feature)
       ↑
       └── commits locales
```

### **Proceso completo:**

1. **Crear feature desde develop**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-descriptivo
   ```

2. **Desarrollar localmente**

   ```bash
   npm run dev
   # ... hacer cambios ...
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. **Push y crear Preview**

   ```bash
   git push origin feature/nombre-descriptivo
   # Vercel crea preview automáticamente
   ```

4. **PR a develop**

   ```bash
   # En GitHub: feature/nombre → develop
   # Revisar, aprobar, mergear
   ```

5. **Testing en develop preview**

   ```bash
   # Vercel actualiza el preview de develop
   # Probar exhaustivamente
   ```

6. **PR a main (cuando esté listo)**
   ```bash
   # En GitHub: develop → main
   # Revisar, aprobar, mergear
   # Vercel despliega a producción automáticamente
   ```

---

## 🐛 Debugging por Entorno

### **Local**

```bash
# Ver logs en consola
npm run dev

# Ver variables cargadas (en código)
console.log(process.env.NEXT_PUBLIC_*)

# Verificar build
npm run build
```

### **Vercel (Preview/Production)**

1. **Vercel Dashboard → Deployments**
2. Click en el deployment problemático
3. **Runtime Logs** → Ver logs de ejecución
4. **Build Logs** → Ver logs de build
5. **Function Logs** → Ver logs de API routes

### **Verificar variables en runtime:**

```bash
# En cualquier API route
console.log('Environment:', process.env.NODE_ENV);
console.log('Vercel URL:', process.env.VERCEL_URL);
```

---

## ⚠️ Pendientes / TODOs

### **Alta prioridad:**

- [ ] Obtener credenciales de **PRODUCCIÓN** de Mercado Pago
- [ ] Actualizar variables en Vercel Production con credenciales reales
- [ ] Desactivar modo mantenimiento cuando prod esté listo
  ```bash
  NEXT_PUBLIC_MAINTENANCE_MODE=false
  NEXT_PUBLIC_CHECKOUT_ENABLED=true
  ```

### **Media prioridad:**

- [ ] Crear proyecto de **Supabase Staging** separado
- [ ] Actualizar variables de Preview para usar Supabase staging
- [ ] Configurar CI/CD (GitHub Actions) para:
  - [ ] Linting automático
  - [ ] Type checking
  - [ ] Tests (cuando existan)

### **Baja prioridad:**

- [ ] Configurar Vercel CLI local para testing de edge functions
- [ ] Agregar monitoring (Sentry, LogRocket)
- [ ] Configurar alertas de errores en producción

---

## 📞 Troubleshooting

### **"El banner no se ve"**

1. Verificar variables en Vercel: `NEXT_PUBLIC_MAINTENANCE_MODE=true`
2. Hacer **Redeploy** (sin usar cache)
3. Hard refresh en navegador (Ctrl+Shift+R)

### **"Las variables no se aplican"**

- Las variables `NEXT_PUBLIC_*` se inyectan en **build time**
- Necesitas **redeploy** después de cambiar variables
- Variables server-side se aplican en runtime

### **"Preview deployment requiere login"**

- Ve a **Settings → Deployment Protection**
- Cambia a "Anyone with the link" o "Disabled"

### **"Mercado Pago rechaza webhooks"**

- En **local**: Usar ngrok o flags de skip validation
- En **Vercel**: Verificar IP whitelisting y signature

---

## 📚 Referencias

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Mercado Pago Testing](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test)
- [Supabase Projects](https://supabase.com/docs/guides/platform/projects)

---

## 🎯 Resumen Rápido

| Feature           | Development   | Preview       | Production       |
| ----------------- | ------------- | ------------- | ---------------- |
| **Mercado Pago**  | TEST          | TEST          | PROD (pendiente) |
| **Checkout**      | ✅ Habilitado | ✅ Habilitado | ❌ Deshabilitado |
| **Mantenimiento** | ❌            | ❌            | ✅ (temporal)    |
| **Analytics**     | ❌            | ❌            | ✅               |
| **Supabase**      | Compartido    | Compartido    | Compartido\*     |
| **Debug Flags**   | ✅            | ❌            | ❌               |

**\* Temporal - crear proyecto staging separado más adelante**

---

Última actualización: 2026-02-06
Mantenido por: @RadikeCosa
