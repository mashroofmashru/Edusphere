/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Full scale so every navy-* utility used in the app resolves.
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
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
        display: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
