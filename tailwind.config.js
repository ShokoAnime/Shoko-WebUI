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
        'button-primary': withOpacityValue('--color-button-primary'),
        'button-primary-hover': withOpacityValue('--color-button-primary-hover'),
        'button-secondary': withOpacityValue('--color-button-secondary'),
        'button-secondary-hover': withOpacityValue('--color-button-secondary-hover'),
        'button-danger': withOpacityValue('--color-button-danger'),
        'button-danger-hover': withOpacityValue('--color-button-danger-hover'),
        'default-background': withOpacityValue('--color-default-background'),
        'default-background-alt': withOpacityValue('--color-default-background-alt'),
        'default-background-input': withOpacityValue('--color-default-background-input'),
        'default-border': withOpacityValue('--color-default-border'),
        'default-border-alt': withOpacityValue('--color-default-border-alt'),
        'default-text': withOpacityValue('--color-default-text'),
        'default-text-alt': withOpacityValue('--color-default-text-alt'),
        'default-primary': withOpacityValue('--color-default-primary'),
        'default-primary-hover': withOpacityValue('--color-default-primary-hover'),
        'default-important': withOpacityValue('--color-default-important'),
        'default-danger': withOpacityValue('--color-default-danger'),
        'default-warning': withOpacityValue('--color-default-warning'),
        'default-purple': withOpacityValue('--color-default-purple'),
        'header-background': withOpacityValue('--color-header-background'),
        'header-background-alt': withOpacityValue('--color-header-background-alt'),
        'header-border': withOpacityValue('--color-header-border'),
        'header-border-alt': withOpacityValue('--color-header-border-alt'),
        'header-text': withOpacityValue('--color-header-text'),
        'header-text-alt': withOpacityValue('--color-header-text-alt'),
        'header-primary': withOpacityValue('--color-header-primary'),
        'header-primary-hover': withOpacityValue('--color-header-primary-hover'),
        'header-important': withOpacityValue('--color-header-important'),
        'header-danger': withOpacityValue('--color-header-danger'),
        'header-warning': withOpacityValue('--color-header-warning'),
        'header-purple': withOpacityValue('--color-header-purple'),
        'logo-background': withOpacityValue('--color-logo-background'),
        'logo-highlight': withOpacityValue('--color-logo-highlight'),
        'overlay-background': withOpacityValue('--color-overlay-background'),
        'overlay-border': withOpacityValue('--color-overlay-border'),
        'overlay-count-episode': withOpacityValue('--color-overlay-count-episode'),
        'overlay-count-group': withOpacityValue('--color-overlay-count-group'),
        'overlay-icon': withOpacityValue('--color-overlay-icon'),
        'overlay-icon-hover': withOpacityValue('--color-overlay-icon-hover'),
        'panel-background': withOpacityValue('--color-panel-background'),
        'panel-background-alt': withOpacityValue('--color-panel-background-alt'),
        'panel-background-alt-2': withOpacityValue('--color-panel-background-alt-2'),
        'panel-border': withOpacityValue('--color-panel-border'),
        'panel-border-alt': withOpacityValue('--color-panel-border-alt'),
        'panel-text': withOpacityValue('--color-panel-text'),
        'panel-text-alt': withOpacityValue('--color-panel-text-alt'),
        'panel-primary': withOpacityValue('--color-panel-primary'),
        'panel-primary-hover': withOpacityValue('--color-panel-primary-hover'),
        'panel-important': withOpacityValue('--color-panel-important'),
        'panel-danger': withOpacityValue('--color-panel-danger'),
        'panel-warning': withOpacityValue('--color-panel-warning'),
        'panel-purple': withOpacityValue('--color-panel-purple'),
        'slider-background': withOpacityValue('--color-slider-background'),
        'slider-background-alt': withOpacityValue('--color-slider-background-alt'),
        'slider-thumb': withOpacityValue('--color-slider-thumb'),
        'slider-thumb-alt': withOpacityValue('--color-slider-thumb-alt'),
        'toast-background': withOpacityValue('--color-toast-background'),
        'toast-border': withOpacityValue('--color-toast-border'),
        'toast-text': withOpacityValue('--color-toast-text'),
        'toast-primary': withOpacityValue('--color-toast-primary'),
        'toast-primary-hover': withOpacityValue('--color-toast-primary-hover'),
        'toast-important': withOpacityValue('--color-toast-important'),
        'toast-danger': withOpacityValue('--color-toast-danger'),
        'toast-warning': withOpacityValue('--color-toast-warning'),
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
