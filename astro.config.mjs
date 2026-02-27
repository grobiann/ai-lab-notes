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
      theme: 'one-light',
      transformers: [
        {
          // Shiki가 <pre style="background-color:..."> 인라인 배경을 주입하지 않도록 제거
          // 배경은 tailwind.config.mjs typography 설정에서 일괄 관리
          pre(node) {
            if (node.properties.style) {
              node.properties.style = String(node.properties.style)
                .replace(/background-color:[^;]+;?\s*/g, '')
                .trim() || undefined;
            }
          },
        },
      ],
    },
  },
});
