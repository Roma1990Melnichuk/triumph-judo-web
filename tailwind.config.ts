import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#030303',
        surface: '#120605',
        surface2: '#1B0A08',
        surface3: '#2A1410',
        primary: '#D50000',
        'primary-dark': '#7A0000',
        orange: '#FF8A00',
        accent: '#FFD21A',
        success: '#63D728',
        error: '#FF3B30',
        info: '#4FC3F7',
        warning: '#FF8A00',
        text1: '#F7F5F2',
        text2: '#B7B0A8',
        text3: '#746E68',
      },
      backgroundImage: {
        'cta-gradient': 'linear-gradient(90deg, #E40000 0%, #FF260F 42%, #FF8A00 74%, #FFD21A 100%)',
        'hero-gradient': 'linear-gradient(135deg, #7A0000 0%, #D50000 60%, #FF8A00 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

export default config
