module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    cssnano: { zindex: false },
    tailwindcss: {
      purge: [
        './src/**/*.tsx',
      ],
      variants: {
        margin: ['responsive', 'first'],
        opacity: ['disabled'],
        cursor: ['disabled'],
      }
    },
    autoprefixer: {},
  },
};
