import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF8000',
          dark: '#cc6600',
        },
        surface: {
          DEFAULT: '#121414',
          dim: '#0c0f0f',
          bright: '#37393a',
          container: '#1e2020',
          high: '#282a2b',
          highest: '#333535',
        },
        'on-surface': '#e2e2e2',
        'on-surface-muted': '#dfc1af',
        outline: '#a68b7b',
      },
      fontFamily: {
        headline: ['Epilogue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'label': '0.05em',
      },
      borderRadius: {
        // Pas de border-radius — style brutalist
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        // Exception autorisée : cercles réseaux sociaux footer
        full: '9999px',
      },
    },
  },
  plugins: [],
}
export default config
