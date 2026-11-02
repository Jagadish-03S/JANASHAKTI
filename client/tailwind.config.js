/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        janashakti: {
          navy: {
            DEFAULT: '#0F172A',
            50: '#F8FAFC',
            100: '#F1F5F9',
            800: '#1E293B',
            900: '#0F172A',
            950: '#020617',
          },
          blue: {
            DEFAULT: '#1D4ED8',
            light: '#3B82F6',
            electric: '#2563EB',
            hover: '#1E40AF',
          },
          teal: {
            DEFAULT: '#0D9488',
            light: '#14B8A6',
            dark: '#0F766E',
            bg: '#F0FDFA',
          },
          accent: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        command: '0 20px 25px -5px rgba(2, 6, 23, 0.15), 0 8px 10px -6px rgba(2, 6, 23, 0.1)',
      },
    },
  },
  plugins: [],
};

