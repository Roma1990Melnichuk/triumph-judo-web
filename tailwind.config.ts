import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // keep old names for backward compat while we migrate
        bg:       '#050505',
        surface:  '#0B0B0B',
        surface2: '#120B08',
        surface3: 'rgba(255,255,255,0.10)',
        primary:  '#D50000',
        orange:   '#FF3D00',
        amber:    '#FF9800',
        accent:   '#FFCC00',
        success:  '#19C45A',
        error:    '#FF3B30',
        text1:    '#FFFFFF',
        text2:    '#CCCCCC',
        text3:    '#A7A7A7',
        muted:    '#A7A7A7',
      },
      backgroundImage: {
        'cta-gradient':   'linear-gradient(90deg, #D50000 0%, #FF3D00 42%, #FF9800 78%, #FFCC00 100%)',
        'tr-brand':       'linear-gradient(90deg, #D50000 0%, #FF3D00 42%, #FF9800 78%, #FFCC00 100%)',
        'hero-gradient':  'linear-gradient(135deg, #7A0000 0%, #D50000 60%, #FF9800 100%)',
        'tr-glass':       'linear-gradient(160deg, rgba(255,255,255,.048), rgba(255,255,255,.014))',
        'tr-surface-glow':'radial-gradient(circle at 72% 42%, rgba(255,61,0,.18), transparent 36%), linear-gradient(180deg, #0B0B0B, #050505)',
      },
      boxShadow: {
        'glow':      '0 0 38px rgba(255,61,0,.35)',
        'glow-lg':   '0 0 64px rgba(255,61,0,.50)',
        'tr-card':   '0 16px 40px rgba(0,0,0,.55)',
      },
      fontFamily: {
        display: ['var(--font-unbounded)', 'Unbounded', 'sans-serif'],
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.10)',
        'tr-line': 'rgba(255,255,255,0.10)',
      },
      borderRadius: {
        lg:   '12px',
        xl:   '16px',
        '2xl':'18px',
        '3xl':'24px',
      },
    },
  },
  plugins: [],
}

export default config
