# AGENTS.md

This document provides guidelines for AI agents working on this Astro-based personal portfolio website.

## Project Overview

- **Framework**: Astro 5.x (static site)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.x with custom theme
- **Package Manager**: Bun
- **Features**: Dark mode, content collections (blog), SEO, animations

## Build Commands

```bash
# Development
bun dev                    # Start dev server at localhost:4321

# Build
bun build                  # Build production site to ./dist/
bun preview                # Preview build locally

# Astro CLI
bun astro check            # Type-check the project
bun astro add <pkg>        # Add Astro integrations
```

## Code Style Guidelines

### TypeScript / Astro Components

- **Indentation**: Tabs (not spaces)
- **Quote style**: Single quotes
- **Semicolons**: Required
- **Props**: Define interface at top, destructure with defaults

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Default',
  description = 'Default description',
} = Astro.props;
---
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Hero.astro`, `ThemeToggle.astro`)
- **Layouts**: PascalCase (e.g., `Layout.astro`)
- **Pages**: lowercase (e.g., `index.astro`, `[slug].astro`)
- **Collections**: lowercase (e.g., `blog/`)
- **CSS classes**: lowercase with hyphens (e.g., `hero-section`)

### Imports

- Use relative paths with `.astro` extension
- Group imports: Astro core → third-party → local

```astro
---
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';
import Hero from '../components/Hero.astro';
---
```

### Styling with Tailwind

- Use `neutral` color palette exclusively
- Support dark mode with `dark:` prefix
- Custom animations in `<style>` blocks
- Container max-width: `max-w-4xl`

```html
<div class="text-neutral-700 dark:text-neutral-300 hover:scale-105 transition-transform">
```

### Dark Mode

- Toggle via `window.toggleTheme()` (defined in Layout)
- Class-based: `dark` class on `<html>`
- Always provide both light and dark variants

### Component Structure

```astro
---
// 1. Imports
// 2. Props interface
// 3. Props destructuring
// 4. Component logic
---

<!-- 5. Template with semantic HTML -->

<style>
  /* 6. Component-specific animations */
</style>
```

### Content Collections

- Define schema in `src/content.config.ts`
- Use Zod for validation
- Access via `getCollection()`

### Error Handling

- Use TypeScript strict mode
- Validate props with defaults
- Handle missing data gracefully with fallbacks

### SEO

- Use `StructuredData` component for JSON-LD
- Include meta tags in Layout
- Canonical URLs via `Astro.site`

### Testing

Currently no test framework configured. Add tests in `tests/` directory if needed.

## Project Structure

```
src/
  components/      # Reusable components (PascalCase)
  layouts/         # Page layouts
  pages/           # Routes
  content/         # Blog posts (Markdown)
  styles/          # Global CSS
public/            # Static assets
```

## Key Dependencies

- astro
- @astrojs/sitemap
- @tailwindcss/vite
- tailwindcss
- framer-motion (for animations)

## Notes

- No ESLint or Prettier configured yet
- Uses Bun for fast installs
- Build outputs to `./dist/`
- Site URL configured in `astro.config.mjs`
