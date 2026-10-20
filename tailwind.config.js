/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gamma: {
          bg: '#0B0C10',
          card: '#13141C',
          cardHover: '#181A24',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          accent: '#8B5CF6',
          accentGlow: 'rgba(139, 92, 246, 0.25)',
          coral: '#F43F5E',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          emerald: '#10B981',
        },
        brand: {
          50: '#fbf7f4',
          100: '#f5ede6',
          200: '#ebd9cb',
          300: '#dcbea8',
          400: '#ca9b80',
          500: '#DA7756', // Claude terracotta
          600: '#C46545',
          700: '#994833',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'gamma-card': '0 20px 70px -15px rgba(0, 0, 0, 0.6), 0 0 40px -10px rgba(139, 92, 246, 0.08)',
        'gamma-glow': '0 0 50px -10px rgba(139, 92, 246, 0.35)',
        'gamma-pill': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 20px 0 rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
