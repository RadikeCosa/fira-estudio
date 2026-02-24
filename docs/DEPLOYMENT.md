# 🚀 Guía de Deployment

Esta guía cubre cómo hacer deployments a los diferentes entornos del proyecto.

---

## 📋 Pre-requisitos

- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] Acceso al repositorio GitHub
- [ ] Acceso a Vercel Dashboard (para emergencias)
- [ ] Variables de entorno configuradas en Vercel

---

## 🔄 Deployment Automático (Normal)

### **Preview Deployments (develop, feature branches)**

```bash
# Cualquier push a una rama que NO sea main
git push origin [branch-name]
```

**Vercel automáticamente:**

1. Detecta el push
2. Ejecuta build
3. Despliega a URL única de preview
4. Comenta en el commit con la URL

**URL resultante:**

```
https://fira-estudio-git-[branch-name]-radikecosa.vercel.app
```

---

### **Production Deployment (main)**

```bash
# Solo cuando mergeas a main
git checkout main
git merge develop  # o a través de PR en GitHub
git push origin main
```

**Vercel automáticamente:**

1. Detecta el push a main
2. Ejecuta build
3. Despliega a producción
4. La URL permanece igual

**URL:**

```
https://fira-estudio.vercel.app
```

---

## 🛠️ Deployment Manual (Emergencias)

### Desde Vercel Dashboard

**Cuándo usarlo:**

- Necesitas redeploy sin cambios de código
- Cambiar variables de entorno
- Rollback a versión anterior

**Pasos:**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto **fira-estudio**
3. Ve a **Deployments**
4. Encuentra el deployment que quieres redeploy
5. Click en **"..."** → **Redeploy**
6. Opciones:
   - ✅ **Use existing Build Cache** - Más rápido, usa build anterior
   - ❌ **Don't use cache** - Build completo (usar si cambiaste variables)

---

### Desde Vercel CLI

**Instalación:**

```bash
npm i -g vercel
vercel login
```

**Deploy a preview:**

```bash
# Desde la raíz del proyecto
vercel

# Con nombre custom
vercel --name fira-estudio-test
```

**Deploy a producción:**

```bash
vercel --prod
```

---

## 🔙 Rollback

Si un deployment rompe producción:

### Opción 1: Desde Vercel UI (Más Rápido)

1. **Deployments** → Encuentra el último deployment **estable**
2. Click en **"..."** → **Promote to Production**
3. Confirma

**Producción vuelve inmediatamente** a ese deployment.

---

### Opción 2: Git Revert

```bash
# Ver últimos commits
git log --oneline

# Revertir el commit problemático
git revert [commit-hash]
git push origin main

# Vercel despliega automáticamente el revert
```

---

## 🧪 Testing Pre-Deployment

### Local

```bash
# Build de producción local
npm run build
npm start

# Verificar en http://localhost:3000
# Probar funcionalidades críticas
```

### Preview (Staging)

```bash
# Push a develop
git checkout develop
git merge feature/mi-feature
git push origin develop

# Esperar deployment
# Probar en URL de preview de develop
# Si funciona → mergear a main
```

---

## 📊 Verificación Post-Deployment

### Checklist después de deploy a producción:

- [ ] Sitio carga correctamente
- [ ] No hay errores en DevTools Console
- [ ] Banner de mantenimiento se muestra (si `NEXT_PUBLIC_MAINTENANCE_MODE=true`)
- [ ] Checkout deshabilitado/habilitado según configuración
- [ ] Imágenes cargan correctamente
- [ ] Navegación funciona
- [ ] Formularios funcionan
- [ ] Google Analytics tracking (si aplica)

### Verificar con Vercel Analytics:

1. **Vercel Dashboard → Analytics**
2. Ver:
   - Tiempo de carga
   - Errores 4xx/5xx
   - Tráfico

---

## 🔐 Deployment con Cambios de Variables

Si cambiaste variables de entorno:

1. **Vercel → Settings → Environment Variables**
2. Edita la variable
3. **Guarda**
4. **Deployments → Último deployment → Redeploy**
5. ⚠️ **NO usar cache** - necesitas rebuild con nuevas variables

---

## 🚨 Troubleshooting

### "Build failed"

**Revisar:**

1. **Vercel → Deployments → [deployment fallido] → Build Logs**
2. Buscar el error específico
3. Soluciones comunes:
   - Type errors → `npm run type-check` localmente
   - Linting errors → `npm run lint` y fix
   - Missing dependencies → `npm install`
   - Environment variable missing → verificar en Settings

---

### "Deployment successful pero sitio roto"

**Revisar:**

1. **Runtime Logs** en el deployment
2. DevTools Console en el sitio
3. Network tab - ver requests fallidos

**Solución rápida:**

- Rollback a deployment anterior estable

---

### "Variables no se aplican"

**Causa:** Variables `NEXT_PUBLIC_*` se inyectan en build time

**Solución:**

1. Cambiar variable en Vercel
2. Redeploy **sin usar cache**

---

## 📝 Deployment Checklist

### Para features nuevas:

```
[ ] Feature desarrollada localmente
[ ] Tests pasando (cuando existan)
[ ] Lint clean: npm run lint
[ ] Type check: npm run type-check
[ ] Build local exitoso: npm run build
[ ] Push a feature branch
[ ] Preview deployment exitoso
[ ] Testing en preview URL
[ ] PR a develop
[ ] Review de código
[ ] Merge a develop
[ ] Testing exhaustivo en develop preview
[ ] PR a main (cuando esté listo para producción)
[ ] Review final
[ ] Merge a main
[ ] Monitoring post-deployment (primeros 15 min)
```

---

## 🎯 Estrategias de Deployment

### **Feature Flags** (recomendado para features grandes)

En lugar de esperar a que una feature esté 100% lista:

```typescript
// lib/config/features.ts
export const NEW_FEATURE_ENABLED =
  process.env.NEXT_PUBLIC_NEW_FEATURE === "true";
```

```tsx
// En el componente
{
  NEW_FEATURE_ENABLED && <NewFeature />;
}
```

**Ventajas:**

- Deploy código a producción pero deshabilitado
- Activar cuando esté listo cambiando solo una variable
- A/B testing fácil

---

### **Canary Deployments** (futuro, con Vercel Pro)

Deployment gradual:

- 10% de tráfico al nuevo deployment
- Monitorear errores
- Si todo OK → 100% de tráfico

---

## 📚 Referencias

- [Vercel Deployments](https://vercel.com/docs/concepts/deployments/overview)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

Última actualización: 2026-02-06
