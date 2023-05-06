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
      require('@tailwindcss/line-clamp'),
      require('@headlessui/tailwindcss')({ prefix: 'ui' }),
      require('tailwindcss-text-fill-stroke'),
  ],
  content: [
    './src/**/*.tsx',
    './public/**/*.html',
  ],
  //Any class that is generated dynamically goes here
  safelist: [
    'bg-highlight-1',
    'bg-highlight-2',
    'bg-highlight-3',
    'bg-highlight-4',
    'bg-highlight-5',
    'text-highlight-4',
  ],
  theme: {
    transitionDuration: {
      DEFAULT: '300ms',
    },
    extend: {
      fontFamily: {
        'sans': ['Sora', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: withOpacityValue('--color-background'),
        'background-nav': withOpacityValue('--color-background-nav'),
        'background-alt': withOpacityValue('--color-background-alt'),
        'background-border': withOpacityValue('--color-background-border'),
        'highlight-1': withOpacityValue('--color-highlight-1'),
        'highlight-2': withOpacityValue('--color-highlight-2'),
        'highlight-3': withOpacityValue('--color-highlight-3'),
        'highlight-4': withOpacityValue('--color-highlight-4'),
        'highlight-5': withOpacityValue('--color-highlight-5'),
        'font-main': withOpacityValue('--color-font-main'),
        'font-alt': withOpacityValue('--color-font-alt'),
        'image-overlay': withOpacityValue('--color-image-overlay'),
        transparent: 'transparent',
      },
      backgroundImage: {
        'general-settings': 'linear-gradient(180deg, rgb(var(--color-image-overlay)/0.9) 0%, rgb(var(--color-background)) 100%), url(/images/DemonSlayer.jpg)',
        'import-settings': 'linear-gradient(180deg, rgb(var(--color-image-overlay)/0.9) 0%, rgb(var(--color-background)) 100%), url(/images/OnePunchMan.jpg)',
        'anidb-settings': 'linear-gradient(180deg, rgb(var(--color-image-overlay)/0.9) 0%, rgb(var(--color-background)) 100%), url(/images/Bleach.jpg)',
        'metadata-sites-settings': 'linear-gradient(180deg, rgb(var(--color-image-overlay)/0.9) 0%, rgb(var(--color-background)) 100%), url(/images/DBZ.jpg)',
        'management-settings': 'linear-gradient(180deg, rgb(var(--color-image-overlay)/0.9) 0%, rgb(var(--color-background)) 100%), url(/images/OnePiece.jpg)',
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '25': '6.25rem',
        '62.5': '15.625rem',
        '125': '31.25rem',
      },
      width: {
        '400': '25rem',
      },
      opacity: {
        '85': '.85',
      }
    },
  },
  variants: {
    margin: ['first'],
  },
}
