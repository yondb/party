import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // SURFACE
        bg: '#FAFAF9',
        surface: '#FFFFFF',
        'surface-2': '#F4F4F5',
        'surface-3': '#E9E9EB',

        // ASH (alias do zinc + nasze tokeny)
        ash: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },

        // HONEY (akcent)
        honey: {
          50: '#FEF9C3',
          100: '#FEF08A',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5B800',
          600: '#D4A017',
          700: '#B7860B',
          900: '#713F12',
        },

        graphite: {
          DEFAULT: '#0F0F11',
          soft: '#1C1C1F',
        },

        success: {
          DEFAULT: '#16A34A',
          soft: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#EA580C',
          soft: '#FFEDD5',
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2',
        },

        // KATEGORIE
        cat: {
          running: '#F97316',
          cycling: '#14B8A6',
          basketball: '#EA580C',
          coffee: '#92400E',
          gym: '#7C3AED',
          tennis: '#84CC16',
          volleyball: '#0EA5E9',
          football: '#2563EB',
          playground: '#EC4899',
          dog_walk: '#D97706',
          park: '#059669',
          hiking: '#16A34A',
        },
      },

      fontFamily: {
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        'display-2xl': ['3.5rem', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-xl': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-md': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-md': ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.5', fontWeight: '400' }],
        body: ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.45', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.06em', fontWeight: '600' }],
      },

      borderRadius: {
        xs: '6px',
        sm: '10px',
        DEFAULT: '14px',
        md: '14px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
      },

      boxShadow: {
        xs: '0 1px 2px 0 rgba(24, 24, 27, 0.04)',
        sm: '0 2px 6px -1px rgba(24, 24, 27, 0.06), 0 1px 2px 0 rgba(24, 24, 27, 0.04)',
        md: '0 8px 24px -8px rgba(24, 24, 27, 0.10), 0 2px 6px -2px rgba(24, 24, 27, 0.05)',
        lg: '0 20px 48px -16px rgba(24, 24, 27, 0.14), 0 4px 12px -4px rgba(24, 24, 27, 0.06)',
        honey: '0 8px 28px -8px rgba(245, 184, 0, 0.45), 0 2px 6px -1px rgba(245, 184, 0, 0.20)',
      },

      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },

      animation: {
        shimmer: 'shimmer 1.4s infinite',
        float: 'float 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slide-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
