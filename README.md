# 🎨 Fira Estudio - E-commerce

E-commerce de Fira Estudio construido con Next.js 15, TypeScript, Tailwind CSS, y Mercado Pago.

---

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Editar .env.local con tus valores
nano .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📚 Documentación

- **[Guía de Entornos](./docs/ENVIRONMENTS.md)** - Configuración de development, staging, production
- **[Modo Mantenimiento](./docs/NEXT_PUBLIC_MAINTENANCE_MODE.md)** - Cómo activar/desactivar mantenimiento
- **[Guía de Deployment](./docs/DEPLOYMENT.md)** - Cómo hacer deployments y rollbacks
- **[Email de Confirmación](./docs/ORDER_CONFIRMATION_EMAIL.md)** - Configuración de emails de pedido

---

## 🌐 Entornos

| Entorno         | URL                                                                   | Rama      | Estado           |
| --------------- | --------------------------------------------------------------------- | --------- | ---------------- |
| **Development** | `localhost:3000`                                                      | local     | 🟢 Activo        |
| **Staging**     | [Preview URL](https://fira-estudio-git-develop-radikecosa.vercel.app) | `develop` | 🟢 Activo        |
| **Production**  | [fira-estudio.vercel.app](https://fira-estudio.vercel.app)            | `main`    | 🟡 Mantenimiento |

**Nota:** Production está en modo mantenimiento mientras se configuran credenciales de Mercado Pago.

---

## 🛠️ Scripts

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (localhost:3000)
npm run build        # Build de producción
npm start            # Ejecutar build local

# Quality
npm run lint         # ESLint
npm run type-check   # TypeScript checking

# (Futuros)
npm test             # Tests con Vitest
npm run test:e2e     # Tests E2E con Playwright
```

---

## 🏗️ Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Pagos:** Mercado Pago
- **Database:** Supabase
- **Emails:** Resend + React Email
- **Deployment:** Vercel
- **Analytics:** Google Analytics 4

---

## 📁 Estructura del Proyecto

```
fira-estudio/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Rutas del sitio
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── layout/           # Header, Footer, etc.
│   ├── ui/               # Componentes reutilizables
│   └── maintenance-banner.tsx
├── lib/                   # Utilidades y configuración
│   ├── config/           # Feature flags, constants
│   ├── supabase/         # Cliente de Supabase
│   └── utils/            # Helpers
├── docs/                  # Documentación
│   ├── ENVIRONMENTS.md
│   ├── NEXT_PUBLIC_MAINTENANCE_MODE.md
│   └── DEPLOYMENT.md
├── public/               # Assets estáticos
└── .env.local.example    # Template de variables
```

---

## 🔐 Variables de Entorno

Ver [.env.local.example](./.env.local.example) para la lista completa.

**Variables críticas:**

```bash
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (Emails)
RESEND_API_KEY=

# Feature Flags
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_CHECKOUT_ENABLED=true
```

---

## 🤝 Contribución

### Git Flow

```
main (production)
  ↑
develop (staging)
  ↑
feature/[nombre] (features individuales)
```

### Proceso

1. Crear branch desde `develop`
2. Desarrollar y probar localmente
3. Push y crear PR a `develop`
4. Review y merge
5. Testing en staging
6. Cuando esté listo, PR de `develop` a `main`

Ver [DEPLOYMENT.md](./docs/DEPLOYMENT.md) para detalles.

---

## 📝 TODOs

### Alta Prioridad

- [ ] Obtener credenciales PROD de Mercado Pago
- [ ] Desactivar modo mantenimiento en producción
- [ ] Crear proyecto Supabase Staging

### Media Prioridad

- [ ] Implementar CI/CD con GitHub Actions
- [ ] Agregar tests unitarios (Vitest)
- [ ] Agregar tests E2E (Playwright)

### Baja Prioridad

- [ ] Configurar Sentry para error tracking
- [ ] Optimización de imágenes con next/image
- [ ] Configurar Redis para caching

---

## 📄 Licencia

Privado - Fira Estudio

---

## 📞 Contacto

- **Desarrollador:** @RadikeCosa
- **Proyecto:** Fira Estudio E-commerce
- **Repositorio:** [github.com/RadikeCosa/fira-estudio](https://github.com/RadikeCosa/fira-estudio)

---

Última actualización: 2026-02-06
