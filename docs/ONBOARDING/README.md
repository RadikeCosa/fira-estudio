# 📚 Onboarding - Guías para Nuevos Desarrolladores

Bienvenido al equipo de Fira Estudio. Esta carpeta tiene guías beginner-friendly para entender los tres pilares técnicos principales del proyecto.

**No necesitas experiencia previa en estos temas. Estos documentos explican como si fuera tu primer día.**

---

## 🗺️ Mapa de Onboarding

### 1️⃣ **Caching** - Almacenar datos para que sea rápido
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

### 2️⃣ **Metadata** - Información que ve Google y redes sociales
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

### 3️⃣ **Analytics** - Entender qué hacen tus usuarios
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

### Si acabas de empezar (Día 1-2)

```
1. Lee CACHING_BASICS.md (15 min)
   ↓
2. Lee METADATA_BASICS.md (10 min)
   ↓
3. Lee ANALYTICS_BASICS.md (8 min)
   ↓
4. Abre cada archivo .md en la carpeta docs/ para ver cómo se implementa
```

**Total:** ~33 minutos + exploración

### Si necesitas aprender específicamente

```
"¿Cómo cacheo un query?"
→ CACHING_BASICS.md

"¿Por qué mi página no aparece bien en Google?"
→ METADATA_BASICS.md

"¿Cómo sé si la gente está comprando?"
→ ANALYTICS_BASICS.md
```

---

## 📖 Documentación Avanzada

Estos documentos beginner apuntan a documentación más técnica:

| Concepto | Beginner | Avanzado |
|----------|----------|----------|
| Caching | CACHING_BASICS.md | [docs/CACHING_ARCHITECTURE.md](../CACHING_ARCHITECTURE.md) |
| Metadata | METADATA_BASICS.md | [docs/METADATA_STANDARD.md](../METADATA_STANDARD.md) |
| Analytics | ANALYTICS_BASICS.md | [.github/skills/analytics/SKILL.md](../../.github/skills/analytics/SKILL.md) |

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
