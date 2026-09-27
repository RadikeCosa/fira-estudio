# Auditoría base para el rediseño de Fira Estudio

**Fecha:** 27 de septiembre de 2026
**URL revisada:** https://fira-estudio-cyan.vercel.app/
**Tipo de entorno:** despliegue público de Vercel; no se pudo confirmar si corresponde a Preview o Production.
**Prioridad de producto:** fortalecer y unificar la imagen de marca.
**Contrato vigente:** catálogo de textiles con consultas manuales. No se propone compra online.

## 1. Referencia y método

### Código

- Repositorio y rama de auditoría: `docs/auditoria-redisenio-2026`.
- Commit base de `main`: `b57e65b3f548342650b4d36318035caa6cf8f162`.
- El árbol local de `main` estaba modificado al iniciar: `AGENTS.md` y `README.md`; además había contenido nuevo en `.agents/`, `docs/PRODUCT.md`, `docs/TECHNICAL_CONTEXT.md`, `docs/WORKFLOW.md` y `skills-lock.json`. Se revisó y se preservó porque actualiza el contrato del catálogo, el flujo de trabajo y el contexto técnico; no se consideró trivial ni se incorporó a esta rama.
- El código evaluado procede del commit base. Los documentos locales nuevos se usaron para confirmar el alcance del producto, no como sustituto de la fuente de código.

### Sitio y herramientas

- Inspección manual de home, catálogo, filtro por categoría, ficha de producto, contacto y sobre nosotros en Chromium del navegador de Codex.
- Capturas en viewport de escritorio de 1440 × 900 y móvil de 390 × 844, con temas claro y oscuro en las pantallas revisadas. Se hizo una comprobación manual de teclado para abrir y cerrar la navegación móvil con Escape.
- PageSpeed Insights / Lighthouse 13.5 sobre la home: tres mediciones móviles y tres de escritorio el 27 de septiembre de 2026, entre las 15:30 y las 15:33 GMT−3.
- La métrica de accesibilidad de Lighthouse detectó un atributo ARIA no permitido. Esto no reemplaza una auditoría completa con axe ni certifica conformidad WCAG 2.2 AA.
- El navegador disponible para inspección fue Chromium. WebKit/Safari no estuvo disponible en la sesión; sus resultados quedan **pendientes de confirmar**.
- PageSpeed muestra sesión de carga inicial, emulación Moto G Power y Slow 4G en móvil; en escritorio indica emulación desktop y throttling personalizado. La herramienta no mostró datos de campo ni confirmó caché fría, TTFB o bytes totales transferidos.
- Los archivos `/robots.txt` y `/sitemap.xml` no se pudieron abrir desde el navegador usado. Su comportamiento en el despliegue queda **pendiente de confirmar**; el código sí contiene sus generadores.

## 2. Hallazgos priorizados

| Prioridad | Tipo | Hallazgo y evidencia | Acción recomendada |
|---|---|---|---|
| **P1** | Falla operativa observada | En la ficha de Camino de Mesa Magnolia se lee “WhatsApp no está configurado. Podés consultar desde contacto”. Al seguir el enlace, Contacto informa “Por ahora no hay un canal de contacto disponible en el sitio”. Así, el recorrido principal termina sin una vía para hacer la consulta. La causa exacta de la configuración pública no se puede verificar desde el repositorio. | Confirmar fuera del repo qué canal público debe estar activo en el despliegue y comprobar que el enlace funcione. Si no hay canales disponibles, definir una alternativa de contacto antes de promover el sitio como vidriera activa. No copiar valores de contacto privados ni secretos al informe. |
| **P1** | Calidad de contenido | En la tarjeta publicada de Mantel Picnic aparece “Tusor %75 algodón y %25 poliéster”. La forma porcentual publicada parece un error editorial; el registro fuente procede del catálogo remoto y su valor correcto queda **pendiente de confirmar**. | Revisar el registro del producto y establecer una revisión de ortografía y formato para títulos, materiales y descripciones antes de publicar cambios de catálogo. |
| **P2** | SEO técnico | `buildMetadata` usa `/images/logo.png` como imagen Open Graph/Twitter por defecto, pero ese archivo no existe en `public/images/`. Las páginas que no proveen una imagen específica quedan con una referencia de imagen social rota. Los detalles de producto sí pasan su imagen principal. | Elegir una imagen social oficial que exista, verificar su respuesta pública y usarla como fallback. |
| **P2** | Accesibilidad | Lighthouse detectó “Elements use prohibited ARIA attributes” en el contenedor de redes sociales del footer: un `div` genérico lleva `aria-label="Redes sociales"` sin rol semántico. El puntaje de accesibilidad de Lighthouse fue 96 en los informes revisados. | Dar al contenedor una semántica adecuada o mover el nombre accesible a una región semántica y confirmar la solución con axe y lector de pantalla. |
| **P2** | Accesibilidad | La sección de colecciones expone dos encabezados H2 “Nuestras Colecciones”: uno oculto para nombrar la región y otro generado por `SectionHeader`. La repetición también aparece en el árbol accesible publicado. | Mantener un solo H2 y conectar la región con ese encabezado. |
| **P2** | SEO técnico | Las rutas filtradas usan `canonical` de `/productos` y reciben `noindex` cuando existe cualquier parámetro de búsqueda. En el sitio, `/productos?categoria=mantas` sí muestra el título y contenido de Mantas, pero el código evita que esa URL se indexe. Esto puede ser una decisión válida para prevenir duplicados, aunque limita el posicionamiento de colecciones como páginas de destino. | Definir si las categorías deben captar búsquedas orgánicas. Si sí, evaluar rutas indexables por categoría con canonical propio; si no, dejar documentada la política actual. No indexar indiscriminadamente todas las combinaciones de filtros. |
| **P2** | Estado de catálogo | El código tiene un estado vacío con el mensaje genérico “No hay productos disponibles”. Al abrir `/productos?page=999` en el despliegue se mostró el error genérico “Algo salió mal”, en lugar de una salida útil para una página fuera de rango. El origen de ese error queda **pendiente de confirmar**. | Separar resultados vacíos y páginas fuera de rango de errores de servidor; ofrecer una salida clara al catálogo o a una categoría válida. Revisar filtros sin resultados cuando haya una categoría que los produzca. |
| **P2** | Identidad verbal | El footer presenta “Creaciones Textiles y Digitales”, mientras el contrato vigente y la oferta publicada describen una marca de textiles artesanales. El cierre “y digitales” abre una categoría de negocio que la vidriera no desarrolla. | Confirmar el descriptor público de marca y unificarlo en footer, metadatos y demás puntos de contacto. |
| **P2** | Identidad verbal | La home mezcla “Explora” (tuteo) con “Explorá”, “Escribinos” y “Tenés” (voseo argentino). También alterna títulos en estilo de mayúsculas (“Textiles Artesanales Únicos”, “Ver Productos”) con encabezados de frase. | Definir una guía corta de voz y estilo: voseo argentino, capitalización de encabezados y nombres de categorías. Aplicarla a home, catálogo, producto, contacto y redes. |
| **P3** | Oportunidad de marca | En escritorio, la primera pantalla de la home presenta el wordmark, un descriptor y dos CTA sobre un fondo casi plano; la primera imagen textil aparece debajo del hero. El conjunto identifica el nombre, pero demora la evidencia visual del producto artesanal. | Probar una dirección de hero con fotografía propia de producto o taller, manteniendo el wordmark y un CTA principal. Validar legibilidad y carga en móvil antes de adoptarla. |
| **P3** | Navegación móvil | Los filtros del catálogo ocupan una fila horizontal. A 390 px se ven “Todos”, “Paños de Cocina” y parte de “Mantas”; las opciones restantes requieren desplazamiento horizontal. El desplazamiento funciona, aunque su continuidad depende de una barra fina y flechas laterales. | Diseñar una señal de desbordamiento más clara y fácil de usar con tacto; comprobar que el foco y el elemento seleccionado sigan visibles al cambiar de categoría. |

## 3. Evaluación por recorrido

### Home

- El wordmark combina Gloock para “fira” con Inter para “estudio” y se repite en header y footer. Es un rasgo reconocible que conviene conservar y tratar como una pieza de marca consistente.
- La jerarquía actual es clara: marca, descripción, CTA a productos, productos destacados, colecciones y CTA final. En escritorio el bloque inicial está muy centrado y reserva mucho espacio antes de mostrar un producto o una escena real.
- La descripción “Lindos. Útiles. Para usar cada día.” comunica una promesa concreta y propia del producto. Puede funcionar como base del tono.
- La sección de colecciones contiene el encabezado duplicado mencionado arriba. El subtítulo usa “Explora”, en contraste con el voseo del CTA final.

### Catálogo y filtros

- El catálogo publicado muestra ocho artículos en el primer resultado observado y marca productos destacados, precio de referencia y enlace a detalle. El filtro por Mantas actualiza el título, la descripción, la categoría seleccionada y los resultados.
- Las fichas de producto se presentan como consulta manual y el precio está identificado como referencia, en línea con el alcance vigente.
- La fila de filtros es horizontal en móvil y muestra solo una parte de las opciones inicialmente. Las descripciones de las colecciones y los datos visibles de las tarjetas merecen una pasada editorial; el valor `%75` es un ejemplo concreto.
- `ProductGrid` sí tiene un estado para lista vacía, pero el caso `page=999` observado cayó en el error general. Falta verificar el comportamiento con una categoría válida sin productos y con páginas que exceden el total.

### Detalle de producto

- La galería de Camino de Mesa Magnolia muestra cuatro imágenes, miniaturas y controles con nombre accesible. La foto de ambiente presenta bien el uso y la textura del producto.
- La lectura separa descripción, entrega, material, cuidados, referencia de precio, variante y disponibilidad. En móvil la galería aparece antes del título, una secuencia coherente para una pieza visual.
- El CTA conduce a consulta manual, pero el aviso de WhatsApp sin configurar y la página de contacto sin canales hacen que el flujo se interrumpa.
- El selector de variante y la ruta con contexto están presentes. Falta confirmar que la variante elegida se refleje de forma consistente al continuar hasta cada canal de contacto disponible.

### Contacto

- En la publicación revisada no se ofrece WhatsApp, email ni Instagram. La página conserva un enlace para regresar al catálogo, pero no permite cumplir la consulta que promete el producto.
- En móvil, el estado vacío queda en medio de un área extensa, con el footer visible en la misma pantalla. El mensaje informa el bloqueo, pero no da una alternativa de contacto.

### Sobre nosotros

- La fotografía del taller aporta evidencia propia del proceso y equilibra el catálogo con una historia de marca. En móvil mantiene proporción y queda antes del contenido narrativo.
- El texto incluye detalles específicos de confección y serigrafía, adecuados para diferenciar una producción artesanal. Algunas expresiones como “textiles premium”, “excelencia” y “calidad óptima” son más genéricas; priorizar detalles verificables de materiales y proceso ayudaría a sostener la promesa.
- La sección “Nuestros Valores” presenta cuatro bloques paralelos; conviene validar en el rediseño si todos agregan una prueba distintiva de marca.

## 4. Rendimiento, accesibilidad y SEO

### Rendimiento de laboratorio — home

PageSpeed no encontró datos de campo (“No Data”). Las cifras siguientes son pruebas de laboratorio independientes, no métricas reales de usuarios.

| Entorno | Lighthouse | FCP (mediana) | LCP (mediana) | TBT (mediana) | CLS (mediana) | Observación |
|---|---:|---:|---:|---:|---:|---|
| Móvil, Moto G Power, Slow 4G | 94 (rango 92–94) | 0,9 s | 3,0 s | 0 ms | 0 | LCP y Speed Index son los márgenes principales a revisar en móvil. |
| Escritorio, emulación desktop, throttling personalizado | 100 | 0,2 s | 0,6 s | 10 ms | 0 | Buen resultado de laboratorio; no sustituye datos de campo. |

Los informes señalaron oportunidades estimadas de entrega de imágenes de 35 KiB en móvil y 119 KiB en escritorio, 14 KiB de JavaScript heredado, 26 KiB de JavaScript no usado y entre 120 y 300 ms de solicitudes que bloquean renderizado. Una ejecución también detectó una tarea larga. Son estimaciones de ahorro y no bytes totales transferidos.

Informes repetibles:

- [PageSpeed móvil, medición 1](https://pagespeed.web.dev/analysis/https-fira-estudio-cyan-vercel-app/7mewmz7c4n?form_factor=mobile)
- [PageSpeed móvil, medición 2](https://pagespeed.web.dev/analysis/https-fira-estudio-cyan-vercel-app/a1zxlt94ye?form_factor=mobile)
- [PageSpeed móvil, medición 3](https://pagespeed.web.dev/analysis/https-fira-estudio-cyan-vercel-app/5yb0xpho11?form_factor=mobile)
- [PageSpeed escritorio, medición 1](https://pagespeed.web.dev/analysis/https-fira-estudio-cyan-vercel-app/7mewmz7c4n?form_factor=desktop)
- [PageSpeed escritorio, medición 2](https://pagespeed.web.dev/analysis/https-fira-estudio-cyan-vercel-app/a1zxlt94ye?form_factor=desktop)
- [PageSpeed escritorio, medición 3](https://pagespeed.web.dev/analysis/https-fira-estudio-cyan-vercel-app/5yb0xpho11?form_factor=desktop)

### Accesibilidad — WCAG 2.2 AA como referencia

- Lighthouse informó 96 en accesibilidad y encontró el `aria-label` no permitido del footer.
- La paleta declara pares de texto secundario de 4,74:1 en tema claro (`#737373` sobre `#ffffff`) y 8,52:1 en oscuro (`#baafa3` sobre `#171411`). Los anillos de foco configurados dan 17,40:1 en claro y 8,91:1 en oscuro sobre el fondo base. Estos cálculos cubren los tokens declarados, no cada combinación de overlay o contenido remoto.
- La hoja de estilos define foco visible para links y controles. La prueba manual de menú móvil confirmó que Escape lo cierra y devuelve el foco al botón.
- No se encontró un enlace de salto al contenido principal en `app/` o `components/`.
- Quedan pendientes el escaneo completo con axe, revisión con lector de pantalla, foco en todas las rutas, zoom/reflow y evaluación de todos los contrastes reales en estados interactivos.

### SEO

- La home y las páginas públicas usan el constructor central de metadata; el código establece title, description, canonical, Open Graph y tarjeta de Twitter. Las páginas de producto generan title y description dinámicos y usan su imagen principal.
- PageSpeed informó 100 en SEO para la home en escritorio y móvil. Es un chequeo automatizado de recomendaciones básicas, no una validación integral de indexación.
- El código genera datos estructurados `Product` para detalles. Hay helpers para `Organization` y `BreadcrumbList`, pero no se encontró una llamada que los inserte en una ruta pública. La ausencia de una entidad de organización no impide el catálogo; conviene decidirlo cuando se confirme identidad, logo y enlaces sociales oficiales.
- Las URLs filtradas se canonicalizan a `/productos` y se marcan noindex. La política debe alinearse con la estrategia de posicionamiento de categorías.
- El fallback Open Graph apunta a una imagen ausente. La salida publicada de canonical, OG, sitemap y robots no se pudo leer directamente; queda **pendiente de confirmar**.

## 5. Hoja de ruta para el rediseño

### Etapa 0 — Resolver el bloqueo de consulta

1. Confirmar un canal público vigente y comprobar el recorrido desde una ficha hasta el destino.
2. Corregir y revisar el material/tipografía del producto observado con el responsable del catálogo.
3. Tratar ambos puntos como condición previa para presentar la vidriera como lista para recibir consultas.

### Etapa 1 — Acordar una expresión de marca

1. Definir paleta y tipografía oficiales a partir del wordmark actual y las fotografías propias.
2. Acordar descriptor, voz en voseo argentino y reglas editoriales.
3. Definir cómo aparecen costura, estampado, textura y uso cotidiano en el hero, colecciones y fichas.

### Etapa 2 — Rediseñar el recorrido visual

1. Replantear la home para mostrar antes una escena o producto textil y sostener un CTA claro al catálogo.
2. Mejorar lectura móvil de categorías, jerarquía de tarjetas y estados de lista vacía/fuera de rango.
3. Unificar la ficha alrededor de fotografía, variantes, material, cuidados, precio de referencia y consulta manual.
4. Dar a contacto un estado funcional y coherente con los canales públicos configurados.

### Etapa 3 — Cerrar accesibilidad, SEO y velocidad

1. Corregir semántica ARIA y encabezados; añadir salto al contenido y revisar foco/zoom/reflow.
2. Sustituir el fallback social por una imagen existente y decidir el tratamiento SEO de categorías.
3. Optimizar entrega de imágenes/JS guiándose por nuevas mediciones móviles.
4. Repetir Lighthouse en rutas representativas y obtener datos de campo cuando haya tráfico suficiente. Confirmar TTFB, peso transferido, WebKit y estado de sitemap/robots.

## 6. Criterio para evaluar una marca más consistente

La siguiente revisión podrá comparar el antes y después con estas cuatro comprobaciones:

1. **Sistema visual:** logo, paleta y tipografía siguen reglas iguales en todas las rutas y temas.
2. **Producto visible:** la primera pantalla y los puntos de descubrimiento muestran textiles reales, su textura o su uso.
3. **Voz editorial:** encabezados, materiales, cuidados y CTA usan el mismo voseo y una capitalización acordada, sin errores visibles.
4. **Continuidad del recorrido:** una persona puede pasar de home a producto y llegar a un canal operativo sin encontrar mensajes contradictorios o bloqueos.

Un cambio de estilo se registrará como propuesta; solo se elevará a problema cuando contradiga el contrato del producto, rompa un flujo o no cumpla un criterio de accesibilidad o calidad verificable.
