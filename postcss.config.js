function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

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
        colors: {
          primary: withOpacityValue('--color-primary'),
          secondary: withOpacityValue('--color-secondary'),
          background: withOpacityValue('--color-background'),
          'background-nav': withOpacityValue('--color-background-nav'),
          'background-alt': withOpacityValue('--color-background-alt'),
          'background-border': withOpacityValue('--color-background-border'),
          'highlight-1': withOpacityValue('--color-highlight-1'),
          'highlight-2': withOpacityValue('--color-highlight-2'),
          'highlight-3': withOpacityValue('--color-highlight-3'),
          'highlight-4': withOpacityValue('--color-highlight-4'),
          'highlight-5': withOpacityValue('--color-highlight-5'),
        },
        extend: {
          spacing: {
            '15': '3.75rem',
            '62.5':'15.625rem',
          },
        },
      },
    },
    autoprefixer: {},
  },
};
