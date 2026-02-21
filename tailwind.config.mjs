import { theme, siteConfig } from './src/config/theme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fonts,
      typography: (theme) => ({
        cyber: {
          css: {
            '--tw-prose-body': '#c9d1d9',
            '--tw-prose-headings': '#f0f6fc',
            '--tw-prose-links': '#58a6ff',
            '--tw-prose-code': '#00ff9d',
            '--tw-prose-pre-bg': '#161b22',
            '--tw-prose-pre-code': '#c9d1d9',
            'code::before': { content: '""' },
            'code::after': { content: '""' }
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
