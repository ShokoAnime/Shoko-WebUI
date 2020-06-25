module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    cssnano: { zindex: false },
    tailwindcss: {
      purge: {
        mode: 'all',
        content: [
          './src/**/*.tsx',
        ]
      }
    },
    autoprefixer: {},
  },
};
