/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Add paths to all of your template files
    './src/**/**/*.jsx',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        'dark-navy': '#1A335E', 
        'light-card': '#FFFFFF', 

        // Primary Accent Color
        'primary-blue': '#2563EB', 
        'primary-blue-dark': '#1E40AF', 

        // Text Colors
        'text-dark': '#1F2937', 
        'text-muted': '#6B7280', 

        // Utility Colors for messages (optional, as standard Tailwind colors are used)
        'error': '#DC2626', // Red-700 equivalent
        'success': '#16A34A', // Green-700 equivalent
        'info': '#2563EB', // Primary-blue equivalent
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}