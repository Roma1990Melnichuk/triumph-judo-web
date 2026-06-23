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
        bg:       '#080808',
        surface:  '#12100F',
        surface2: '#1A120F',
        stroke:   '#34201A',
        primary:  '#E30613',
        orange:   '#FF6A00',
        amber:    '#FF9800',
        accent:   '#FFC400',
        gold:     '#FFD23F',
        success:  '#29D158',
        danger:   '#FF3B30',
        text1:    '#F5F5F5',
        text2:    '#CCCCCC',
        muted:    '#9A9692',
      },
      backgroundImage: {
        'brand':         'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)',
        'cta-gradient':  'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)',
        'tr-brand':      'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)',
        'surface-glow':  'linear-gradient(180deg,rgba(227,6,19,.18),rgba(255,106,0,.06))',
        'vignette':      'radial-gradient(circle at 70% 40%,rgba(255,80,0,.16),transparent 36%)',
        'tr-glass':      'linear-gradient(160deg,rgba(255,255,255,.04),rgba(255,255,255,.01))',
      },
      boxShadow: {
        'glow':     '0 0 34px rgba(227,6,19,.45)',
        'glow-og':  '0 0 46px rgba(255,106,0,.38)',
        'tr-card':  '0 18px 80px rgba(0,0,0,.55)',
      },
      fontFamily: {
        display: ['var(--font-unbounded)', 'Unbounded', 'sans-serif'],
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT:   '#34201A',
        stroke:    '#34201A',
      },
      borderRadius: {
        DEFAULT: '16px',
        sm:  '10px',
        md:  '16px',
        lg:  '24px',
        xl:  '32px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [],
}

export default config
