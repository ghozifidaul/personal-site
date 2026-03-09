# Personal Portfolio Site

A modern, fast, and accessible personal portfolio website built with Astro 5.x, TypeScript, and Tailwind CSS v4. Features a dark mode toggle, AI chat assistant, smooth animations, and a blog.

[Live Site](https://example.com)

![Preview](/public/ghozifidaul.png)

## Features

- **Astro 5.x** - Static site generation for blazing fast performance
- **TypeScript** - Strict mode enabled for type safety
- **Tailwind CSS v4** - Modern utility-first styling with custom neutral theme
- **Dark Mode** - Seamless light/dark theme toggle with system preference detection
- **AI Chat Assistant** - Interactive chat component powered by React and streaming responses
- **Framer Motion** - Smooth animations and transitions
- **Content Collections** - Type-safe blog posts with Zod validation
- **SEO Ready** - JSON-LD structured data, Open Graph, Twitter Cards
- **Responsive Design** - Mobile-first approach

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 5.x
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4.x
- **Animations:** Framer Motion
- **UI Components:** React 19 (for interactive components)
- **Content:** Markdown with Zod validation
- **Build:** Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd personal-site

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun dev
```

The site will be available at `http://localhost:4321`

### Building

```bash
# Build for production
bun build

# Preview the production build locally
bun preview
```

### Type Checking

```bash
# Run Astro type checker
bun astro check
```

## Project Structure

```
/
├── public/                 # Static assets (images, fonts, etc.)
│   ├── ghozifidaul.png    # Profile image
│   └── favicon.svg
├── src/
│   ├── components/        # Reusable components (.astro/.tsx)
│   │   ├── Hero.astro
│   │   ├── AskAI.tsx     # AI chat component
│   │   ├── ExperienceCard.astro
│   │   ├── CursorFollower.tsx
│   │   ├── ThemeToggle.astro
│   │   └── Navbar.astro
│   ├── layouts/           # Page layouts
│   │   └── Layout.astro   # Base layout with SEO
│   ├── pages/             # Site routes
│   │   ├── index.astro    # Homepage
│   │   └── blog/          # Blog section
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── content/           # Blog posts (Markdown)
│   │   └── blog/
│   ├── types/             # TypeScript definitions
│   │   ├── experience.ts
│   │   └── chat.ts
│   ├── data/              # Static data
│   │   └── experience.ts  # Work experience data
│   └── styles/
│       └── global.css     # Tailwind config + custom styles
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Customization

### Site Configuration

Update the site URL in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',
  // ...
});
```

### Personal Information

Edit your information in:

- `src/pages/index.astro` - Main content
- `src/data/experience.ts` - Work experience
- `src/layouts/Layout.astro` - Meta tags and SEO

### Styling

The site uses a custom neutral color palette. Modify colors in `src/styles/global.css`:

```css
@theme {
  --color-neutral-50: #fafafa;
  /* ... more colors ... */
}
```

### Adding Blog Posts

Create new Markdown files in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Brief description of the post"
date: 2025-02-10
tags: ["tag1", "tag2"]
---

Your content here...
```

### AI Chat Configuration

The AI chat component fetches from an API endpoint. Configure it in `src/components/AskAI.tsx`:

```typescript
const API_URL = 'https://your-api-endpoint.com/chat';
```

Or use the Astro environment variables defined in `astro.config.mjs`.

## Scripts

| Command | Action |
|---------|--------|
| `bun dev` | Start dev server at `localhost:4321` |
| `bun build` | Build production site to `./dist/` |
| `bun preview` | Preview production build locally |
| `bun astro check` | Type-check the project |
| `bun astro add <pkg>` | Add Astro integrations |

## Deployment

This site is built as a static site and can be deployed to any static hosting platform:

- [Cloudflare Pages](https://pages.cloudflare.com/)
- [GitHub Pages](https://pages.github.com/)

```bash
# Build for deployment
bun build

# The `./dist/` folder contains the built site
```

## License

MIT License - feel free to use this template for your own portfolio!

---

Built with Astro, Tailwind CSS, and ☕
