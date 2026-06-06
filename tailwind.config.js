/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#1e3a8a',
        }
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite alternate',
        'slide-up':     'slideUp 0.5s ease-out both',
        'fade-in':      'fadeIn 0.4s ease-out both',
        'scale-in':     'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'heartbeat':    'heartbeat 1.2s ease-in-out infinite',
        'breathe':      'breathe 3s ease-in-out infinite',
        'slide-right':  'slideRight 0.5s ease-out both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          from: { boxShadow: '0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)' },
          to:   { boxShadow: '0 0 35px rgba(59,130,246,0.6), 0 0 70px rgba(59,130,246,0.3)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.85)' },
          to:   { opacity: 1, transform: 'scale(1)' },
        },
        heartbeat: {
          '0%,100%': { transform: 'scale(1)' },
          '14%':     { transform: 'scale(1.18)' },
          '28%':     { transform: 'scale(1)' },
          '42%':     { transform: 'scale(1.12)' },
          '70%':     { transform: 'scale(1)' },
        },
        breathe: {
          '0%,100%': { transform: 'scaleX(1) scaleY(1)' },
          '50%':     { transform: 'scaleX(1.1) scaleY(1.07)' },
        },
        slideRight: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        }
      }
    }
  },
  plugins: [],
}
