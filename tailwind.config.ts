import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          warm: '#c07a2f',
          light: '#e8a84e',
          pale: '#fdf3e3',
        },
        ink: {
          DEFAULT: '#2c2416',
          light: '#7a6a52',
          muted: '#b0977a',
        },
        cream: {
          100: '#faf5ec',
          200: '#f5ead8',
          300: '#ecdcc0',
          500: '#d4b896',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      typography: {
        warm: {
          css: {
            '--tw-prose-body': '#2c2416',
            '--tw-prose-headings': '#1a1208',
            '--tw-prose-links': '#c07a2f',
            '--tw-prose-bold': '#2c2416',
            '--tw-prose-counters': '#7a6a52',
            '--tw-prose-bullets': '#b0977a',
            '--tw-prose-hr': '#e8ddd0',
            '--tw-prose-quotes': '#2c2416',
            '--tw-prose-quote-borders': '#c07a2f',
            '--tw-prose-captions': '#7a6a52',
            '--tw-prose-code': '#2c2416',
            '--tw-prose-pre-code': '#2c2416',
            '--tw-prose-pre-bg': '#faf5ec',
            '--tw-prose-th-borders': '#d4b896',
            '--tw-prose-td-borders': '#e8ddd0',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
