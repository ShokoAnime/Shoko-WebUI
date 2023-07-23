const defaultTheme = require('tailwindcss/defaultTheme')

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  plugins: [
      require('@headlessui/tailwindcss')({ prefix: 'ui' }),
      require('tailwindcss-text-fill-stroke'),
  ],
  content: [
    './src/**/*.tsx',
    './index.html',
  ],
  //Any class that is generated dynamically goes here
  safelist: [
    'bg-highlight-1',
    'bg-highlight-2',
    'bg-highlight-3',
    'bg-highlight-4',
    'bg-highlight-5',
    'text-highlight-4',
    'text-highlight-5',
  ],
  theme: {
    transitionDuration: {
      DEFAULT: '300ms',
    },
    extend: {
      fontFamily: {
        'sans': ['Sora', ...defaultTheme.fontFamily.sans],
      },
      fontWeight: {
        extralight: 100,
        light: 200,
        normal: 300,
        medium: 400,
        semibold: 500,
        bold: 600,
        extrabold: 700,
        black: 800
      },
      colors: {
        background: withOpacityValue('--color-background'),
        'background-nav': withOpacityValue('--color-background-nav'),
        'background-alt': withOpacityValue('--color-background-alt'),
        'background-border': withOpacityValue('--color-background-border'),
        'border-alt': withOpacityValue('--color-border-alt'),
        'highlight-1': withOpacityValue('--color-highlight-1'),
        'highlight-1-light': withOpacityValue('--color-highlight-1-light'),
        'highlight-1-dark': withOpacityValue('--color-highlight-1-dark'),
        'highlight-2': withOpacityValue('--color-highlight-2'),
        'highlight-2-light': withOpacityValue('--color-highlight-2-light'),
        'highlight-2-dark': withOpacityValue('--color-highlight-2-dark'),
        'highlight-3': withOpacityValue('--color-highlight-3'),
        'highlight-3-light': withOpacityValue('--color-highlight-3-light'),
        'highlight-3-dark': withOpacityValue('--color-highlight-3-dark'),
        'highlight-4': withOpacityValue('--color-highlight-4'),
        'highlight-4-light': withOpacityValue('--color-highlight-4-light'),
        'highlight-4-dark': withOpacityValue('--color-highlight-4-dark'),
        'highlight-5': withOpacityValue('--color-highlight-5'),
        'highlight-5-light': withOpacityValue('--color-highlight-5-light'),
        'highlight-5-dark': withOpacityValue('--color-highlight-5-dark'),
        'font-main': withOpacityValue('--color-font-main'),
        'font-alt': withOpacityValue('--color-font-alt'),
        'image-overlay': withOpacityValue('--color-image-overlay'),
        transparent: 'transparent',
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '25': '6.25rem',
        '62.5': '15.625rem',
      },
      width: {
        '400': '25rem',
      },
      opacity: {
        '65': '.65',
        '85': '.85',
      }
    },
  },
  variants: {
    margin: ['first'],
  },
}
