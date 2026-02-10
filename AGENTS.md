# AGENTS.md

This document provides guidelines for AI agents working on this Astro-based personal portfolio website.

## Project Overview

- **Framework**: Astro 5.x (static site)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.x with custom theme
- **Package Manager**: Bun
- **Features**: Dark mode, content collections (blog), SEO, animations, AI chat

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

### React Components (.tsx)

- **Indentation**: 2 spaces
- **Quote style**: Single quotes
- **Semicolons**: Required
- **Use functional components** with hooks
- **Client directives**: Add `client:only="react"` or `client:load` when using in Astro

```tsx
import { useState } from 'react';

export default function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Hero.astro`, `AskAI.tsx`)
- **Layouts**: PascalCase (e.g., `Layout.astro`)
- **Pages**: lowercase (e.g., `index.astro`, `[slug].astro`)
- **Types**: PascalCase with `.ts` extension (e.g., `experience.ts`)
- **Collections**: lowercase directory (e.g., `blog/`)
- **CSS classes**: lowercase with hyphens (e.g., `hero-section`)

### Imports

- Use relative paths with extensions (`.astro`, `.tsx`, `.ts`)
- Group imports: Astro/React core → third-party → local types → local components

```astro
---
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Experience } from '../types/experience';
import Hero from '../components/Hero.astro';
---
```

### Styling with Tailwind v4

- Use `neutral` color palette exclusively (defined in `global.css`)
- Support dark mode with `dark:` prefix
- Custom theme colors defined in `@theme` block in `global.css`
- Custom animations in `<style>` blocks for complex keyframes
- Container max-width: `max-w-4xl`

```html
<div class="text-neutral-700 dark:text-neutral-300 hover:scale-105 transition-transform">
```

### Dark Mode

- Toggle via `window.toggleTheme()` (defined in Layout)
- Class-based: `dark` class on `<html>`
- Always provide both light and dark variants
- Custom variant defined: `@custom-variant dark (&:where(.dark, .dark *));`

### Component Structure (Astro)

```astro
---
// 1. Imports (CSS → components)
// 2. Props interface
// 3. Props destructuring with defaults
// 4. Component logic
---

<!-- 5. Template with semantic HTML -->

<style>
  /* 6. Component-specific animations */
</style>
```

### Content Collections

- Define schema in `src/content.config.ts` (not in content/ folder)
- Use Zod for validation
- Access via `getCollection()` from `astro:content`

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});
```

### Error Handling

- TypeScript strict mode enabled (extends `astro/tsconfigs/strict`)
- Validate props with defaults
- Handle missing data gracefully with fallbacks
- Use try/catch for localStorage operations

### SEO

- Use `StructuredData` component for JSON-LD
- Meta tags defined in Layout.astro
- Canonical URLs via `Astro.site`
- Open Graph and Twitter card meta tags included

### Environment Variables

- Define schema in `astro.config.mjs` using `envField`
- Access via `import.meta.env.API_URL`
- Supports `client` and `server` contexts

### Testing

No test framework configured. Add tests in `tests/` directory if needed.

## Project Structure

```
src/
  components/      # Reusable components (PascalCase .astro/.tsx)
  layouts/         # Page layouts
  pages/           # Routes
  content/         # Blog posts (Markdown)
  types/           # TypeScript type definitions
  data/            # Static data files
  styles/          # Global CSS (Tailwind config)
public/            # Static assets
```

## Key Dependencies

- astro
- @astrojs/sitemap
- @astrojs/react
- @tailwindcss/vite
- tailwindcss v4
- framer-motion (animations)
- react-markdown (chat messages)

## Notes

- No ESLint or Prettier configured yet
- Uses Bun for fast installs
- Build outputs to `./dist/`
- Site URL configured in `astro.config.mjs`
