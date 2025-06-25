/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fad4b8',
          300: '#f7b98f',
          400: '#f49f67',
          500: '#f1844e',
          600: '#e76a35',
          700: '#c05529',
          800: '#994424',
          900: '#73331b',
        },
        secondary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bbe5cb',
          300: '#93d1a8',
          400: '#67b882',
          500: '#459e65',
          600: '#36804f',
          700: '#2c6641',
          800: '#255236',
          900: '#1f432c',
        },
        accent: {
          50: '#fffbf0',
          100: '#fef6e0',
          200: '#fceab8',
          300: '#f9dd8f',
          400: '#f6d067',
          500: '#f3c54e',
          600: '#e0a935',
          700: '#b88a29',
          800: '#906b24',
          900: '#68501b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};