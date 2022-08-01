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
  ],
  theme: {
    extend: {
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
        'font-main': withOpacityValue('--color-font-main'),
        'font-alternative': withOpacityValue('--color-font-alternative'),
        transparent: 'transparent',
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