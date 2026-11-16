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
        navy: {
          950: '#0a101d',
          900: '#101D35', // Primary Deep Navy
          800: '#182b4d',
          700: '#233d6b',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563EB', // Secondary Royal Blue
          700: '#1d4ed8',
        },
        surface: {
          light: '#F8FAFC',
          card: '#FFFFFF',
          darkBg: '#0b1120',
          darkCard: '#151e32',
          darkBorder: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['"Manrope"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        manrope: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium': '0 4px 20px -2px rgba(16, 29, 53, 0.08), 0 2px 6px -1px rgba(16, 29, 53, 0.04)',
        'card': '0 10px 30px -5px rgba(16, 29, 53, 0.05)',
      }
    },
  },
  plugins: [],
}

