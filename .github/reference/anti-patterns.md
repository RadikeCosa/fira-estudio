---
title: "Anti-Patterns Reference"
description: "Common mistakes to avoid in Fira Estudio development"
version: "1.0"
lastUpdated: "2026-02-02"
---

# Anti-Patterns Reference

Complete guide of what NOT to do in this project. These are common mistakes that lead to bugs, poor performance, or maintenance issues.

---

## 🚫 Critical Anti-Patterns

**Never do these:**

1. ❌ Never use `any` type
2. ❌ Cannot order nested relations in Supabase (sort in JavaScript)
3. ❌ Don't use `disponible` column (use `activo`)
4. ❌ Don't use Client Component unnecessarily
5. ❌ Don't hardcode text or styles (use centralized content/tokens)

---

## 📝 TypeScript Anti-Patterns

### Never Use 'any' Type

**❌ INCORRECT:**

```typescript
const data: any = await fetch();
const response: any = await getProductos();
let value: any;

function processData(data: any) {
  return data.map((item: any) => item.name);
}
```

**✅ CORRECT:**

```typescript
interface ProductoResponse {
  id: string;
  nombre: string;
  precio: number;
}

const data: ProductoResponse[] = await getProductos();

function processData(data: ProductoResponse[]): string[] {
  return data.map((item) => item.nombre);
}
```

### Don't Skip Return Types

**❌ INCORRECT:**

```typescript
function getUser() {
  return user; // Implicit any return type
}

async function fetchProducts() {
  const response = await fetch("/api/productos");
  return response.json(); // Returns unknown
}
```

**✅ CORRECT:**

```typescript
function getUser(): User | null {
  return user;
}

async function fetchProducts(): Promise<Producto[]> {
  const response = await fetch("/api/productos");
  return response.json();
}
```

### Don't Use Implicit Types

**❌ INCORRECT:**

```typescript
let value = getData(); // Type is inferred, but unclear
const items = response.data; // Could be any type
```

**✅ CORRECT:**

```typescript
const value: string = getData();
const items: Producto[] = response.data;

// Or use explicit typing on function
function getData(): string {
  return "value";
}
```

---

## 🗄️ Supabase Anti-Patterns

### Cannot Order Nested Relations

**❌ INCORRECT:**

```typescript
// This doesn't work in Supabase!
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)")
  .order("variaciones(precio)"); // ❌ Cannot order nested relations
```

**✅ CORRECT:**

```typescript
// Sort in JavaScript after fetching
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)");

// Sort variaciones for each product
data.forEach((producto) => {
  producto.variaciones.sort((a, b) => a.precio - b.precio);
});

// Or in a more functional way
const productosOrdenados = data.map((producto) => ({
  ...producto,
  variaciones: [...producto.variaciones].sort((a, b) => a.precio - b.precio),
}));
```

### Wrong Column Name

**❌ INCORRECT:**

```typescript
// Column 'disponible' doesn't exist in schema
const { data } = await supabase
  .from("productos")
  .select("*")
  .eq("disponible", true); // ❌ Wrong column name
```

**✅ CORRECT:**

```typescript
// Use 'activo' column
const { data } = await supabase
  .from("productos")
  .select("*")
  .eq("activo", true); // ✅ Correct column name
```

### Don't Ignore Errors

**❌ INCORRECT:**

```typescript
const { data } = await supabase.from("productos").select("*");
return data; // What if there's an error?
```

**✅ CORRECT:**

```typescript
const { data, error } = await supabase.from("productos").select("*");

if (error) {
  console.error("Database error:", error);
  throw error;
}

return data ?? [];
```

### Don't Forget .single() for Single Results

**❌ INCORRECT:**

```typescript
// Returns array, even though slug is unique
const { data } = await supabase
  .from("productos")
  .select("*")
  .eq("slug", slug);

const producto = data[0]; // Accessing array when expecting single
```

**✅ CORRECT:**

```typescript
// Use .single() for single result queries
const { data, error } = await supabase
  .from("productos")
  .select("*")
  .eq("slug", slug)
  .single();

if (error) {
  if (error.code === "PGRST116") {
    return notFound();
  }
  throw error;
}

return data;
```

---

## ⚛️ Component Anti-Patterns

### Don't Use Client Component Unnecessarily

**❌ INCORRECT:**

```typescript
'use client';

export default async function ProductosPage() {
  const productos = await getProductos(); // This can be Server Component!
  return <ProductGrid productos={productos} />;
}
```

**✅ CORRECT:**

```typescript
// No 'use client' - Server Component by default
export default async function ProductosPage() {
  const productos = await getProductos();
  return <ProductGrid productos={productos} />;
}

// Only use Client Component when needed
'use client';
export function ProductGrid({ productos }: { productos: Producto[] }) {
  const [filtro, setFiltro] = useState('');
  // Client-side interactivity
}
```

### Don't Forget Loading States

**❌ INCORRECT:**

```typescript
export default async function Page() {
  const data = await getProductos(); // No loading state!
  return <List data={data} />;
}
```

**✅ CORRECT:**

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ProductosSkeleton />}>
      <ProductosContent />
    </Suspense>
  );
}

async function ProductosContent() {
  const data = await getProductos();
  return <List data={data} />;
}
```

### Don't Hardcode Text

**❌ INCORRECT:**

```typescript
export function HeroSection() {
  return (
    <section>
      <h1>Fira Estudio</h1>
      <p>Textiles artesanales para tu hogar</p>
      <button>Ver Productos</button>
    </section>
  );
}
```

**✅ CORRECT:**

```typescript
import { HOME_CONTENT } from "@/lib/content/home";

export function HeroSection() {
  const { title, subtitle, cta } = HOME_CONTENT.hero;

  return (
    <section>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button>{cta.primary}</button>
    </section>
  );
}
```

### Don't Mix Concerns

**❌ INCORRECT:**

```typescript
export function ProductCard({ producto }: { producto: Producto }) {
  // 200+ lines mixing UI, business logic, and data fetching
  const [expanded, setExpanded] = useState(false);
  const [variacion, setVariacion] = useState(null);
  const [stock, setStock] = useState(0);

  useEffect(() => {
    fetchStock();
  }, [variacion]);

  const handleWhatsApp = () => {
    // WhatsApp logic inline
  };

  const calculatePrice = () => {
    // Price calculation inline
  };

  return (
    <div>
      {/* 150+ lines of JSX */}
    </div>
  );
}
```

**✅ CORRECT:**

```typescript
// Split into smaller, focused components
export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <article>
      <ProductImage producto={producto} />
      <ProductInfo producto={producto} />
      <ProductActions producto={producto} />
    </article>
  );
}
```

---

## 🎨 Styling Anti-Patterns

### Don't Use Inline Styles

**❌ INCORRECT:**

```typescript
<div style={{ color: 'red', padding: '20px', marginTop: '10px' }}>
  Content
</div>
```

**✅ CORRECT:**

```typescript
<div className="text-red-500 p-5 mt-2.5">
  Content
</div>
```

### Don't Hardcode Breakpoints

**❌ INCORRECT:**

```typescript
// Don't use CSS media queries directly
const styles = `
  @media (min-width: 768px) {
    .container {
      flex-direction: row;
    }
  }
`;
```

**✅ CORRECT:**

```typescript
// Use Tailwind breakpoint prefixes
<div className="flex flex-col md:flex-row">
```

### Don't Duplicate Style Strings

**❌ INCORRECT:**

```typescript
export function HeroSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      {/* Content */}
    </section>
  );
}

export function AboutSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      {/* Content */}
    </section>
  );
}
```

**✅ CORRECT:**

```typescript
import { SPACING } from "@/lib/design/tokens";

export function HeroSection() {
  return (
    <section className={SPACING.sectionPadding.md}>
      {/* Content */}
    </section>
  );
}

export function AboutSection() {
  return (
    <section className={SPACING.sectionPadding.md}>
      {/* Content */}
    </section>
  );
}
```

### Don't Mix Tailwind with CSS Modules

**❌ INCORRECT:**

```typescript
import styles from './Component.module.css';

export function Component() {
  return (
    <div className={`${styles.container} flex gap-4`}>
      {/* Mixing CSS modules with Tailwind */}
    </div>
  );
}
```

**✅ CORRECT:**

```typescript
// Use only Tailwind for consistency
export function Component() {
  return (
    <div className="container mx-auto flex gap-4">
      {/* Pure Tailwind */}
    </div>
  );
}
```

---

## 🔧 Import Anti-Patterns

### Don't Use Relative Imports

**❌ INCORRECT:**

```typescript
import { getProductos } from "../../../lib/supabase/queries";
import { HOME_CONTENT } from "../../lib/content/home";
import { Button } from "../components/ui/Button";
```

**✅ CORRECT:**

```typescript
import { getProductos } from "@/lib/supabase/queries";
import { HOME_CONTENT } from "@/lib/content/home";
import { Button } from "@/components/ui/Button";
```

### Don't Import Everything

**❌ INCORRECT:**

```typescript
import * as utils from "@/lib/utils";
import * as constants from "@/lib/constants";

const price = utils.formatPrice(100);
const url = constants.WHATSAPP.getUrl("message");
```

**✅ CORRECT:**

```typescript
import { formatPrice } from "@/lib/utils";
import { WHATSAPP } from "@/lib/constants";

const price = formatPrice(100);
const url = WHATSAPP.getUrl("message");
```

---

## 🧪 Testing Anti-Patterns

### Don't Test Implementation Details

**❌ INCORRECT:**

```typescript
test("useState is called with null", () => {
  const spy = jest.spyOn(React, "useState");
  render(<Component />);
  expect(spy).toHaveBeenCalledWith(null);
});
```

**✅ CORRECT:**

```typescript
test("displays initial state correctly", () => {
  render(<Component />);
  expect(screen.getByText("No selection")).toBeInTheDocument();
});
```

### Don't Mock What You Don't Own

**❌ INCORRECT:**

```typescript
// Don't mock React itself
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));
```

**✅ CORRECT:**

```typescript
// Mock your own modules
jest.mock("@/lib/supabase/queries", () => ({
  getProductos: jest.fn(),
}));
```

---

## 🔗 Related Documentation

- **Main Instructions**: `.github/instructions/copilot-instructions.instructions.md`
- **Component Patterns**: `.github/reference/component-patterns.md`
- **Business Logic**: `.github/reference/business-logic.md`
- **Testing Patterns**: `.github/skills/testing/SKILL.md`
