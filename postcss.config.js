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
      variants: {
        margin: ['first'],
      },
    },
    autoprefixer: {},
  },
};
