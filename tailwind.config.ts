import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* Dark-first background */
        'bg-deep':     '#0A0A0F',
        'bg-surface':  '#12121A',
        'bg-elevated': '#1A1A26',
        /* Accent palette */
        'accent-coral':  '#FF6B6B',
        'accent-purple': '#C850C0',
        'accent-indigo': '#4158D0',
        'accent-gold':   '#FFD93D',
        /* Semantic text */
        'text-primary':   '#F0F0F5',
        'text-secondary': '#8888AA',
        'text-muted':     '#44445A',
        /* Social */
        kakao: '#FEE500',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #C850C0 70%, #4158D0 100%)',
        'gradient-sunset':  'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #C850C0 100%)',
      },
      borderRadius: {
        sm:   '12px',
        md:   '20px',
        lg:   '32px',
        full: '9999px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glow-coral':  '0 0 40px rgba(255,107,107,0.25), 0 0 80px rgba(255,107,107,0.1)',
        'glow-purple': '0 0 40px rgba(200,80,192,0.25), 0 0 80px rgba(200,80,192,0.1)',
        'card':        '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
      },
      animation: {
        shimmer:  'shimmer 3s infinite linear',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
