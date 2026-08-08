/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        panel: '#12121a',
        panel2: '#181822',
        line: '#242432',
        accent: '#ff3b3b',
        accent2: '#ffb800',
        live: '#ff2d2d',
        gold: '#ffd23f',
        silver: '#c9d2de',
        bronze: '#d98a4a'
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      keyframes: {
        pulseLive: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 }
        },
        countHighlight: {
          '0%': { backgroundColor: 'rgba(255,184,0,0.35)' },
          '100%': { backgroundColor: 'rgba(255,184,0,0)' }
        }
      },
      animation: {
        pulseLive: 'pulseLive 1.4s ease-in-out infinite',
        countHighlight: 'countHighlight 1.6s ease-out'
      }
    }
  },
  plugins: []
};
