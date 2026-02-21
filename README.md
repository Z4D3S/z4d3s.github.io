# CyberBlue - Blog de Ciberseguridad Blue Team

![CyberBlue](https://img.shields.io/badge/CyberBlue-Blue%20Team-brightgreen)
![Astro](https://img.shields.io/badge/Astro-4.x-ff5f03)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-0ea5e9)

Blog técnico de ciberseguridad especializado en **Blue Team**: detección, respuesta a incidentes y defensa. Enfoque 100% educativo y defensivo.

## Características

- **Multiidioma**: Español, Inglés, Português
- **MDX**: Posts con código resaltado e imágenes
- **SEO**: Sitemap, meta tags, Schema.org
- **RSS**: Feed RSS automático
- **Búsqueda**: Buscador integrado con Pagefind
- **Tags y Categorías**: Organización de contenido
- **Dark/Light Mode**: Tema adaptativo
- **Diseño Cyber**: Estética minimalista dark

## Quick Start

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/cyberblue-blog.git
cd cyberblue-blog

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── content/
│   └── blog/      # Posts MDX (es/, en/)
├── i18n/          # Traducciones UI
├── layouts/       # Layouts base
├── pages/         # Páginas routing
├── styles/        # CSS global
└── utils/         # Utilidades
```

## Contenido

### Crear un Post

Crea un archivo `.md` en `src/content/blog/{idioma}/`:

```markdown
---
title: "Título del Post"
description: "Descripción breve"
pubDate: 2024-01-15
heroImage: "/images/portada.jpg"
tags: ["tag1", "tag2"]
category: "defense"
author: "Tu Nombre"
---

Tu contenido aquí...
```

### Categorías

- `threat-intel` - Inteligencia de amenazas
- `defense` - Defensa y detección
- `sandbox` - Laboratorios educativos
- `tools` - Herramientas
- `tutorials` - Tutoriales

### Tags

Los tags son libres. Ejemplos: `yara`, `siem`, `log-analysis`, `detection`

## Sandbox Educativo

La sección `/sandbox` contiene laboratorios Docker para practicar:

- Análisis de logs
- Detección de IOC
- Reglas de detección (YARA, Sigma)
- Respuesta a incidentes
- Análisis de malware
- Hardening

### Docker

```bash
docker-compose -f docker/sandbox/docker-compose.yml up -d
```

## Configuración

### Variables de Entorno

Crea `.env`:

```env
PUBLIC_SITE_URL=https://cyberblue.blog
PUBLIC_DEFAULT_LOCALE=es
```

### Astro Config

Edita `astro.config.mjs` para personalizar:

- URL del sitio
- Idiomas soportados
- Integraciones

## Seguridad

### Checklist Producción

- [ ] HTTPS con HSTS
- [ ] Headers de seguridad (CSP, X-Frame-Options)
- [ ] Rate limiting
- [ ] Backup automático
- [ ] Sitemap.xml actualizado

### Aviso Legal

El contenido de este blog es **estrictamente educativo**. Los laboratorios de detección y mitigación están diseñados para aprender a defender sistemas, nunca para atacar.

> "La ciberseguridad defensiva protege lo que importa."

## Tech Stack

- [Astro](https://astro.build) - SSG framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [MDX](https://mdxjs.com) - Markdown + JSX
- [Shiki](https://shiki.matsu.io) - Syntax highlighting

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT License - Ver [LICENSE](LICENSE)

---

<div align="center">

**CyberBlue** - Aprende a defender, no a atacar.

</div>
