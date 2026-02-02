## 🗺️ Mapa de Onboarding - Día 1 a Día 3

### Día 1: Conceptos Fundamentales (45 minutos)

#### 1️⃣ **Estructura del Proyecto** - Dónde viven las cosas

- **Archivo:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Para:** Entender la organización del código desde cero
- **Tiempo:** 15-20 minutos
- **Includes:**
  - Qué es app/ y lib
  - Directorio completo explicado
  - Dónde poner cada tipo de archivo
  - Server vs Client Components
  - Errores comunes
  - Convenciones de nombres

**¿Cuándo leer?** PRIMERO. Es tu primer doc para entender cómo está organizado todo.

---

#### 2️⃣ **Datos y Consultas** - Cómo obtener información

- **Archivo:** [DATA_AND_QUERIES.md](DATA_AND_QUERIES.md)
- **Para:** Trabajar con Supabase y escribir queries
- **Tiempo:** 20-25 minutos
- **Includes:**
  - Qué es Supabase (con analogía)
  - Tablas principales (categorias, productos, variaciones)
  - El patrón de 3 capas (internal → cached → fresh)
  - Repository pattern (por qué lo usamos)
  - Cómo crear un nuevo query paso a paso
  - Error handling
  - 5 errores comunes

**¿Cuándo leer?** Después de PROJECT_STRUCTURE. Es fundamental para trabajar con datos.

---

### Día 1-2: Temas Específicos (33 minutos)

#### 3️⃣ **Caching** - Almacenar datos para que sea rápido

- **Archivo:** [CACHING_BASICS.md](CACHING_BASICS.md)
- **Para:** Si no entiendes qué es "cache" o cómo Next.js lo maneja
- **Tiempo:** 10-15 minutos
- **Includes:**
  - Qué es cache (con analogías)
  - Request cache vs Full route cache
  - Cómo invalidar cache
  - Checklist para crear queries

**¿Cuándo leer?** Cuando necesites escribir un nuevo query o entender por qué `npm run dev` no cachea.

---

#### 4️⃣ **Metadata** - Información que ve Google y redes sociales

- **Archivo:** [METADATA_BASICS.md](METADATA_BASICS.md)
- **Para:** Si no sabes qué es metadata o SEO
- **Tiempo:** 10 minutos
- **Includes:**
  - Qué es metadata (con ejemplos reales)
  - 4 tipos: Basic, Open Graph, Twitter, JSON-LD
  - Cómo usar `buildMetadata()` en pages
  - Ejemplos completos (producto, categoría)
  - Cómo verificar que funciona

**¿Cuándo leer?** Cuando crees una nueva página o cuando compartes un link en redes y se ve feo.

---

#### 5️⃣ **Analytics** - Entender qué hacen tus usuarios

- **Archivo:** [ANALYTICS_BASICS.md](ANALYTICS_BASICS.md)
- **Para:** Si no sabes qué es Google Analytics o GA4
- **Tiempo:** 8 minutos
- **Includes:**
  - Qué es analytics (analogía tienda física)
  - 7 eventos que rastreamos (add_to_cart, view_cart, remove_from_cart, etc.)
  - Cómo funcionan los tracking helpers
  - Cómo verificar en Real-time dashboard
  - Cómo leer el dashboard de GA4

**¿Cuándo leer?** Cuando agregues un nuevo componente con interacción o cuando necesites entender por qué ciertos eventos no se registran.

---

## 🔄 Flujo Recomendado

### Opción 1: Ordenado por Relevancia (RECOMENDADO - Días 1-2)

```
DÍA 1:
1. PROJECT_STRUCTURE.md (20 min) - Entender dónde viven las cosas
2. DATA_AND_QUERIES.md (25 min) - Aprender a obtener datos

DÍA 2:
3. CACHING_BASICS.md (15 min) - Optimizar velocidad
4. METADATA_BASICS.md (10 min) - SEO y redes sociales
5. ANALYTICS_BASICS.md (8 min) - Entender usuarios

Total: ~78 minutos
```

Después: Abre código real (app/, lib/) y experimenta.

---

### Opción 2: Solo lo Esencial (Si tienes prisa)

```
"Necesito empezar AHORA"
↓
1. PROJECT_STRUCTURE.md (20 min)
2. DATA_AND_QUERIES.md (25 min)

Eso es suficiente para empezar. Lees los otros cuando los necesites.
```

---

### Opción 3: Por Necesidad Específica

```
"¿Cómo creo una nueva página?"
→ PROJECT_STRUCTURE.md

"¿Cómo obtengo datos de la BD?"
→ DATA_AND_QUERIES.md

"¿Cómo cacheo un query?"
→ CACHING_BASICS.md

"¿Por qué mi página no aparece bien en Google?"
→ METADATA_BASICS.md

"¿Cómo sé si la gente está comprando?"
→ ANALYTICS_BASICS.md
```

```

---

## 📖 Documentación Avanzada

Después de leer los basics, puedes profundizar:

| Tema | Beginner | Avanzado |
|------|----------|----------|
| **Estructura** | PROJECT_STRUCTURE.md | - |
| **Datos** | DATA_AND_QUERIES.md | [docs/CACHING_ARCHITECTURE.md](../CACHING_ARCHITECTURE.md) |
| **Caching** | CACHING_BASICS.md | [docs/CACHING_ARCHITECTURE.md](../CACHING_ARCHITECTURE.md) |
| **Metadata/SEO** | METADATA_BASICS.md | [docs/METADATA_STANDARD.md](../METADATA_STANDARD.md) |
| **Analytics** | ANALYTICS_BASICS.md | [.github/skills/analytics/SKILL.md](../../.github/skills/analytics/SKILL.md) |
| **Errores** | (cubierto en DATA_AND_QUERIES) | [docs/error-boundaries.md](../error-boundaries.md) |
| **Design System** | (cubierto en PROJECT_STRUCTURE) | [docs/STYLE_MANAGEMENT.md](../STYLE_MANAGEMENT.md) |

---

## 🎯 Preguntas Frecuentes

### "¿Puedo leer solo uno?"

Sí. Si solo necesitas entender caching, lee CACHING_BASICS.md. Pero los tres temas se usan juntos constantemente.

### "¿Cuánto tiempo toma?"

- CACHING_BASICS.md: 10-15 minutos
- METADATA_BASICS.md: 10 minutos
- ANALYTICS_BASICS.md: 8 minutos

Total beginner path: ~30 minutos

### "¿Necesito código?"

No para leer estos. Pero después de leer, vas a entender el código existente mucho mejor.

### "¿Si no entiendo algo?"

- Esos documentos tienen analogías y ejemplos visuales
- Si algo no queda claro, pregunta
- Estos docs están en español porque somos team de Argentina

### "¿Cuándo necesito leer los docs avanzados?"

Después de leer el beginner:
- Si necesitas entender **por qué** algo está diseñado de cierta forma
- Si necesitas **troubleshoot** problemas complejos
- Si necesitas implementar **features nuevas**

---

## ✅ Checklist: Ya Estoy Listo para Codear

Después de leer los 3 documentos, deberías poder:

- [ ] Explicar qué es cache sin mirar notas
- [ ] Saber cuándo cachear un query y cuándo no
- [ ] Usar `buildMetadata()` en una página
- [ ] Agregar `trackAddToCart()` en un componente
- [ ] Verificar que GA4 registre eventos en production
- [ ] Entender por qué `npm run dev` no cachea
- [ ] Compartir un link en WhatsApp y que se vea bien

---

## 🚀 Próximos Pasos

1. **Abre CACHING_BASICS.md** ← Empieza aquí
2. Después lee METADATA_BASICS.md
3. Después lee ANALYTICS_BASICS.md
4. Abre la documentación avanzada si necesitas más detalles
5. ¡Comienza a codear!

---

## 👥 Para el Tech Lead

Si agregás un nuevo miembro al equipo:

1. Mándalo a esta carpeta
2. Pídele que lea los 3 .md en orden
3. En ~30 minutos va a entender los pilares principales
4. Después, pair programming con tasks del proyecto

---

**Última actualización:** 29/01/2026
**Lenguaje:** Español 🇦🇷
**Para:** Nuevos desarrolladores, sin experiencia requerida
```
