# Muma Estudio

E-commerce de productos textiles artesanales (manteles, servilletas y caminos de mesa).

## 📋 Descripción del Proyecto

Muma Estudio es una tienda en línea especializada en creaciones textiles y digitales. La plataforma permite a los clientes explorar un catálogo de productos con variaciones de tamaño y color, y realizar consultas directamente por WhatsApp.

**Estado actual (V1):** Catálogo de productos + consultas por WhatsApp
**Próxima versión (V2):** Integración con Mercado Pago para compras online

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 14](https://nextjs.org/) con App Router
- **Lenguaje:** TypeScript
- **Base de datos:** [Supabase](https://supabase.com/) (PostgreSQL + Storage)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Deploy:** [Vercel](https://vercel.com/)

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- Node.js 20.x o superior
- npm (viene con Node.js)

## 🚀 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/RadikeCosa/muma-estudio.git
cd muma-estudio
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores reales.

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Instagram URL
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/mumaestudio

# Contact Email
NEXT_PUBLIC_CONTACT_EMAIL=contacto@mumaestudio.com
```

> **Nota:** Todas las variables que comienzan con `NEXT_PUBLIC_` son accesibles desde el lado del cliente.

## 📜 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera el build de producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter ESLint

## 📁 Estructura del Proyecto

```
muma-estudio/
├── app/                      # App Router de Next.js
│   ├── page.tsx             # Página principal
│   ├── layout.tsx           # Layout principal
│   └── globals.css          # Estilos globales
├── components/              # Componentes React
│   ├── layout/             # Componentes de layout
│   │   ├── Header.tsx      # Encabezado
│   │   ├── Footer.tsx      # Pie de página
│   │   └── MobileNav.tsx   # Navegación móvil
│   ├── productos/          # Componentes de productos
│   └── ui/                 # Componentes UI reutilizables
├── lib/                    # Utilidades y configuraciones
│   ├── constants/          # Constantes centralizadas
│   │   └── navigation.ts   # Links de navegación
│   ├── supabase/           # Cliente y queries de Supabase
│   └── types.ts            # Tipos TypeScript compartidos
├── public/                 # Archivos estáticos
├── .env.local.example      # Template de variables de entorno
└── README.md              # Este archivo
```

## 💻 Convenciones de Código

### TypeScript

- **Siempre tipos explícitos**, nunca `any`
- Preferir `interface` para objetos, `type` para unions
- Nombres de UI/datos en español, código en inglés

```typescript
// ✅ Bien
interface Product {
  nombre: string;  // Datos en español
  precio: number;
}

// ❌ Evitar
let data: any;
const products = [];  // Sin tipo explícito
```

### React

- **Server Components por defecto**
- Solo usar `'use client'` cuando sea necesario (hooks, eventos, browser APIs)
- Orden recomendado: imports → types → component → handlers → JSX

```typescript
// Server Component (por defecto)
export function ProductList() {
  const products = await getProducts();
  return ...;
}

// Client Component (solo cuando es necesario)
'use client';
export function ProductCard() {
  const [liked, setLiked] = useState(false);
  return ...;
}
```

### Naming Conventions

- **Componentes:** `ProductCard.tsx` (PascalCase)
- **Funciones/variables:** `fetchProducts`, `isLoading` (camelCase)
- **Constantes:** `API_ROUTES` (UPPER_SNAKE_CASE)
- **Booleans:** prefijos `is`, `has`, `should`

### Tailwind CSS

- Clases en múltiples líneas para legibilidad
- Mobile-first (sin prefijo → `sm` → `md` → `lg`)
- Usar `clsx` para clases condicionales

```tsx
// ✅ Bien
<div className="
  flex items-center gap-4
  p-4 rounded-lg
  bg-white hover:shadow-lg
  md:flex-row md:gap-6
">
```

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `style:` Cambios de estilo/formato
- `refactor:` Refactorización de código
- `docs:` Cambios en documentación
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

- `categorias` - Categorías de productos
- `productos` - Información de productos
- `variaciones` - Variaciones (tamaño/color) de productos
- `imagenes_producto` - Imágenes de productos
- `consultas` - Consultas de clientes

## 📱 Contacto y Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este es un proyecto privado de Muma Estudio.

---

**Muma Estudio** - Creaciones Textiles y Digitales
