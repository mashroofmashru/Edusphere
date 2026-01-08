/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        'dark-navy': '#1A335E',
        'light-card': '#FFFFFF',
        'primary-blue': '#2563EB',
        'primary-blue-dark': '#1E40AF',
        'text-dark': '#1F2937',
        'text-muted': '#6B7280',
        'error': '#DC2626',
        'success': '#16A34A',
        'info': '#2563EB',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}