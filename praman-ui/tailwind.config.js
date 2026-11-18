/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          subtle: '#F4EFEA',
          border: '#E5E0D8',
          text: '#1C1917',
          muted: '#78716C',
        },
        obsidian: {
          DEFAULT: '#0D1117',
          card: '#161B22',
          border: '#30363D',
          text: '#C9D1D9',
          muted: '#8B949E',
          accent: '#58A6FF',
          success: '#3FB950',
          warning: '#D29922',
          danger: '#F85149',
          purple: '#BC8CFF',
        },
        brand: {
          tally: '#E05A47',
          gstn: '#2563EB',
          bank: '#059669',
          razorpay: '#0C2340',
          emi: '#DC2626',
          ifsc: '#7C3AED',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Spectral', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 2px rgba(28, 25, 23, 0.05)',
        'paper-md': '0 4px 12px rgba(28, 25, 23, 0.08)',
        'paper-lg': '0 10px 25px rgba(28, 25, 23, 0.10)',
        'terminal-glow': '0 0 20px rgba(88, 166, 255, 0.15)',
      }
    },
  },
  plugins: [],
}
