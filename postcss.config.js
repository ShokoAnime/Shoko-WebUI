module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    cssnano: { zindex: false },
    tailwindcss: {
      content: [
        './src/**/*.tsx',
      ],
      theme: {
        extend: {
          spacing: {
            '15': '3.75rem',
            '65.5':'15.625rem',
          },
          colors: {
            'shoko-blue-background-alt': '#1B1F2E',
            'shoko-highlight-2': '#06C270',
          },
        },
      },
    },
    autoprefixer: {},
  },
};
