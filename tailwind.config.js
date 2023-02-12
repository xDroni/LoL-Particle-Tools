module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        lg: '1070px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
