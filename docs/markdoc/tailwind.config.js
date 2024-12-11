/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./template.html",
    "./styles.css",
    "./build.ts"
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            code: {
              color: '#93c5fd',
              '&::before': { content: '""' },
              '&::after': { content: '""' }
            }
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

