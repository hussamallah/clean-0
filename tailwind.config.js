/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F5F2',
        surface: '#FFFFFF',
        'surface-muted': '#EEF1F4',
        ink: {
          DEFAULT: '#1A1C1E',
          muted: '#5C6570',
          soft: '#8A929C',
        },
        brand: {
          DEFAULT: '#C48A2A',
          soft: '#E8C57A',
          deep: '#8B5E14',
        },
        line: '#E2E6EB',
        ocean: {
          O: '#C48A2A',
          C: '#3B82F6',
          E: '#8B5CF6',
          A: '#10B981',
          N: '#EF4444',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        surface: '1rem',
        panel: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26, 28, 30, 0.04), 0 8px 24px rgba(26, 28, 30, 0.06)',
        lift: '0 4px 16px rgba(26, 28, 30, 0.08)',
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.7s ease-out both',
      },
    },
  },
  plugins: [],
};
