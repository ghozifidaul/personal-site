// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ghozifidaul.com',
  integrations: [sitemap(), react()],
  vite: {
    plugins: [tailwindcss()]
  },
  env: {
    schema: {
      API_URL: envField.string({ context: "client", access: "public", default: "http://localhost:8787/chat" })
    }
  }
});
