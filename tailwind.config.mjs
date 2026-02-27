/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#fdf9f4',
          100: '#faf5ec',
          200: '#f5ead8',
          300: '#ecdcc0',
          400: '#dfc9a4',
          500: '#d4b896',
        },
        amber: {
          warm: '#c07a2f',
          light: '#e8a84e',
          pale:  '#fdf3e3',
        },
        ink: {
          DEFAULT: '#2c2416',
          light:   '#7a6a52',
          muted:   '#b0977a',
        },
      },
      fontFamily: {
        serif:  ['Georgia', 'Times New Roman', 'serif'],
        sans:   ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      typography: (theme) => ({
        warm: {
          css: {
            '--tw-prose-body':        theme('colors.ink.DEFAULT'),
            '--tw-prose-headings':    theme('colors.ink.DEFAULT'),
            '--tw-prose-links':       theme('colors.amber.warm'),
            '--tw-prose-bold':        theme('colors.ink.DEFAULT'),
            '--tw-prose-quotes':      theme('colors.ink.light'),
            '--tw-prose-quote-borders': theme('colors.cream.300'),
            '--tw-prose-code':        theme('colors.amber.warm'),
            '--tw-prose-pre-bg':      'rgba(0, 0, 0, 0.04)',
            '--tw-prose-th-borders':  theme('colors.cream.300'),
            '--tw-prose-td-borders':  theme('colors.cream.200'),
            pre: {
              border: `1px solid ${theme('colors.cream.500')}`,
              borderRadius: '0.5rem',
              lineHeight: '1.55',
              fontSize: '0.875rem',
              fontFamily: "'Consolas', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              borderRadius: '0',
              fontSize: 'inherit',
              fontFamily: 'inherit',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
