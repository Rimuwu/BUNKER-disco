/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      full: '0px'
    },
    extend: {
      colors: {
        bgDark: '#0d0d1a',
        bgPanel: '#16162a',
        bgCard: '#1b1c36',
        bgHover: '#24264a',
        borderPrimary: '#3f416d',
        borderGold: '#ffc700',
        borderDanger: '#e02424',
        borderSuccess: '#059669',
        textMain: '#f3f4f6',
        textMuted: '#9ca3af',
        textGold: '#fcd34d',
        resFood: '#84cc16',
        resWater: '#06b6d4',
        resAir: '#e0f2fe',
        resMed: '#f43f5e',
        resMorale: '#fbbf24',
        resPower: '#f97316',
      },
      fontFamily: {
        pixelHeader: ['"Press Start 2P"', 'monospace'],
        pixelBody: ['"Silkscreen"', 'monospace'],
      },
      boxShadow: {
        pixel: '4px 4px 0px #000000',
        'pixel-lg': '6px 6px 0px #000000',
        'pixel-xl': '8px 8px 0px #000000',
        'pixel-gold': '4px 4px 0px #ffc700',
        'pixel-danger': '4px 4px 0px #e02424',
      }
    },
  },
  plugins: [],
}
