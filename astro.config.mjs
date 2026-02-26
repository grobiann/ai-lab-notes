import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://grobiann.github.io',
  base: '/ai-lab-notes',
  outDir: 'docs',
  integrations: [tailwind(), mdx()],
  markdown: {
    shikiConfig: {
      theme: 'light-plus',
    },
  },
});
