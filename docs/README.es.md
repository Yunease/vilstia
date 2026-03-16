# 樟庭徊路 🌙

Un blog personal de **Astro** basado en la plantilla **Fuwari**, modificado y ahora alberga los sueños, pensamientos y creaciones de <span style="color: #87CEFA; font-weight: 700;">琴泠</span>.

---

## Tabla de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Características Originales de Fuwari](#características-originales-de-fuwari)
- [Mis Modificaciones](#mis-modificaciones)
- [Stack Tecnológico](#stack-tecnológico)
- [Ejecución Local](#ejecución-local)
- [Estructura de Contenido](#estructura-de-contenido)
- [Licencia](#licencia)

---

## Acerca del Proyecto

Este es un sitio tipo jardín privado, actualmente en mantenimiento. Lo uso para almacenar cosas que no son adecuadas para publicar en plataformas públicas:

- Pensamientos incompletos pero sinceros
- Visión del mundo fragmentada
- Prototipos de juegos e historias
- Experimentos de código
- Y cosas que solo quiero decirme a mí mismo
- Diarios y trabajos personales

Puede entender esto como: **Blog + Pensamientos + Repositorio de Creaciones + Notas Privadas**

---

## Características Originales de Fuwari

Este proyecto está construido sobre la plantilla [saicaca/fuwari](https://github.com/saicaca/fuwari), que proporciona las siguientes funciones principales:

### Funciones Principales
- Construido sobre el marco de sitio estático **Astro**
- Sistema de estilos **Tailwind CSS**
- Animaciones suaves y transiciones de página (basado en Swup)
- Cambio de tema claro/oscuro
- Color de tema y Banner personalizables
- Diseño responsivo
- Búsqueda en el sitio (basado en Pagefind)
- Sintaxis extendida de Markdown
- Tabla de contenidos (TOC)
- Suscripción RSS

### Estructura de Página Original
- Inicio (lista de artículos)
- Página de archivo
- Página Acerca de
- Página de detalles del artículo

---

## Lo que he modificado:

### Nuevas Páginas y Tipos de Contenido

#### 1.叙梦协定 (`/dream`)
Una página dedicada a registrar sueños. Donde los sueños y la realidad se entrelazan,coleccionando esos mundos extraños que aparecen durante el sueño.

> Aquello que es fugaz, si no se cuida de preservarlo, se perderá para siempre.

#### 2. 心灵碎片 (`/rant`)
Un lugar para almacenar comentarios cortos, fragmentos emocionales y pensamientos inmediatos. Decir algo al azar, dependiendo del estado de ánimo. Esta sección no mostrará artículos con título, sino que mostrará el contenido completo ignorando la información del título, pero aún puedes acceder a la página del artículo a través de la URL correspondiente (los artículos con campo "mess" no aparecerán en la página de archivo)

#### 3. 回廊画架 (`gallery`)

Una sección para almacenar obras de pintura personales, usando un diseño similar a pixiv. El servidor de imágenes es `postimg`, requiere que el archivo md tenga un título e imagen, de lo contrario no se mostrará.

#### 4. 截光求影 (`photo`)

Un lugar para almacenar obras de fotografía personal, actualmente en desarrollo, estén atentos.

#### 5. Menú剪影

Se agregó un menú desplegable "剪影" en la barra de navegación, integrando el acceso a varias páginas especiales. En el futuro podrían agregarse nuevas secciones según el mantenimiento. El menú剪影 tiene adaptación para dispositivos móviles, se puede expandir con un clic.

### Extensión de Clasificación de Contenido

Se agregó el campo `mood` para registrar el estado de ánimo al crear cada artículo.

El campo `mood` corresponde a seis emociones, cada una con su color hexadecimal:

```
Emociones positivas:
平和  Rosa
振奋  Naranja
开心  Verde

Emociones negativas:
怨恨  Púrpura
烦躁  Rojo
消沉  Gris
```

Si desea agregar diferentes colores, consulte la sección de código correspondiente en .astro (ya he añadido las notas de comentario)

### Organización del Contenido

- **Artículos de Blog**: Artículos técnicos, contenido largo y organizado

- **Sueños (dream)**: Registrar sueños, clasificados por la etiqueta `dream`

- **Mensajes (message)**: Comentarios cortos, fragmentos emocionales, clasificados por la etiqueta `mess`. Los archivos md con campo `mess` no aparecerán en el archivo. Los mensajes tienen un campo `mood` con su color hexadecimal correspondiente, la tabla de colores correspondiente es:

  ```typescript
  焦躁: "#E06C75",
  消沉: "#7F8C8D",
  怨恨: "#C792EA",
  开心: "#3CB371",
  平和: "#FFB6C1",
  振奋: "#F4A460",
  ```

  Si se agrega un campo que no existe, se usará el color global de estilo de astro.

  > Se recomienda强烈 agregar nuevos colores hexadecimales.

- **Fotos (photo)**: Obras fotográficas, clasificadas por la etiqueta `photo`. Los archivos md con campo `photo` no aparecerán en el archivo
- **Galería (gallery)**: Obras de pintura, clasificadas por la etiqueta `gallery`. Los archivos md con campo `gallery` no aparecerán en el archivo

### Enlaces Sociales

Integración de enlaces sociales personales:
- Bilibili
- Bangumi (usando icono SVG personalizado, ya se ha implementado el uso de iconos SVG locales)
- Pixiv
- Steam
- GitHub

---

正在尝试开发友链板块

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Astro | Marco de sitio estático |
| Tailwind CSS | Sistema de estilos |
| Svelte | Componentes interactivos |
| Swup | Animaciones de transición de página |
| Pagefind | Búsqueda en el sitio |
| KaTeX | Renderizado de fórmulas matemáticas |
| Expressive Code | Mejora de bloques de código |
| Markdown / MDX | Escritura de contenido |

---

## Ejecución Local

```bash
# Instalar dependencias (se requiere pnpm >= 9)
pnpm install
# Iniciar servidor de desarrollo
pnpm dev
# Crear nuevo artículo
pnpm new-post <filename>
# Construir versión de producción
pnpm build
# Previsualizar resultado de construcción
pnpm preview
# Verificar código
pnpm check
# Formatear código
pnpm format
```

---

## Estructura de Contenido

```
src/
├── assets/           # Recursos estáticos
│   ├── images/       # Recursos de imágenes
│   └── svg/         # Iconos SVG personalizados
├── components/       # Componentes
│   ├── DreamPage.astro      # Componente de página de sueños (nuevo)
│   ├── RantPage.astro       # Componente de página de mensajes (nuevo)
│   └── widget/
│       └── SilhouetteDropdown.astro  # Menú desplegable剪影 (nuevo)
├── content/          # Archivos de contenido
│   ├── posts/        # Artículos
│   │   ├── dream/    # Directorio de artículos de sueños (nuevo)
│   │   └── message/  # Directorio de artículos de mensajes (nuevo)
│   └── spec/         # Contenido de páginas especiales
├── layouts/          # Diseños
├── pages/            # Rutas de páginas
│   ├── dream/[...page].astro  # Página de lista de sueños (nuevo)
│   └── rant/[...page].astro   # Página de lista de mensajes (nuevo)
├── styles/           # Archivos de estilos
├── utils/            # Funciones de utilidad
│   ├── dream-utils.ts    # Procesamiento de contenido de sueños (nuevo)
│   └── mess-utils.ts     # Procesamiento de contenido de mensajes (nuevo)
└── config.ts         # Configuración del sitio
```

### Frontmatter del Artículo

```yaml
---
title: Título del artículo
published: 2024-01-01
description: Descripción del artículo
image: ./cover.jpg
tags: [dream]      # dream: sueños, mess: mensajes
category: Categoría
draft: false
mood: 焦躁          # Estado de ánimo (campo nuevo), solo para sección de mensajes
lang: zh_CN
---
```

---

## Agradecimientos

- [Fuwari](https://github.com/saicaca/fuwari) - Excelente plantilla de blog
- [Astro](https://astro.build) - Potente marco de sitio estático
- Vilstia - Mi mejor amigo

---

## Licencia

El contenido de este proyecto está bajo la licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

La plantilla original de Fuwari utiliza MIT License, consulte [Fuwari License](https://github.com/saicaca/fuwari/blob/main/LICENSE) para más detalles.
