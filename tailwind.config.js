const defaultTheme = require('tailwindcss/defaultTheme')

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
    'text-panel-purple',
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
        'button-primary': 'var(--color-button-primary)',
        'button-primary-hover': 'var(--color-button-primary-hover)',
        'button-secondary': 'var(--color-button-secondary)',
        'button-secondary-hover': 'var(--color-button-secondary-hover)',
        'button-danger': 'var(--color-button-danger)',
        'button-danger-hover': 'var(--color-button-danger-hover)',
        'default-background': 'var(--color-default-background)',
        'default-background-alt': 'var(--color-default-background-alt)',
        'default-background-input': 'var(--color-default-background-input)',
        'default-border': 'var(--color-default-border)',
        'default-border-alt': 'var(--color-default-border-alt)',
        'default-text': 'var(--color-default-text)',
        'default-text-alt': 'var(--color-default-text-alt)',
        'default-primary': 'var(--color-default-primary)',
        'default-primary-hover': 'var(--color-default-primary-hover)',
        'default-important': 'var(--color-default-important)',
        'default-danger': 'var(--color-default-danger)',
        'default-warning': 'var(--color-default-warning)',
        'default-purple': 'var(--color-default-purple)',
        'header-background': 'var(--color-header-background)',
        'header-background-alt': 'var(--color-header-background-alt)',
        'header-border': 'var(--color-header-border)',
        'header-border-alt': 'var(--color-header-border-alt)',
        'header-text': 'var(--color-header-text)',
        'header-text-alt': 'var(--color-header-text-alt)',
        'header-primary': 'var(--color-header-primary)',
        'header-primary-hover': 'var(--color-header-primary-hover)',
        'header-important': 'var(--color-header-important)',
        'header-danger': 'var(--color-header-danger)',
        'header-warning': 'var(--color-header-warning)',
        'header-purple': 'var(--color-header-purple)',
        'logo-background': 'var(--color-logo-background)',
        'logo-primary': 'var(--color-logo-primary)',
        'overlay-background': 'var(--color-overlay-background)',
        'overlay-border': 'var(--color-overlay-border)',
        'overlay-count-episode': 'var(--color-overlay-count-episode)',
        'overlay-count-group': 'var(--color-overlay-count-group)',
        'overlay-icon': 'var(--color-overlay-icon)',
        'overlay-icon-hover': 'var(--color-overlay-icon-hover)',
        'panel-background': 'var(--color-panel-background)',
        'panel-background-alt': 'var(--color-panel-background-alt)',
        'panel-background-toolbar': 'var(--color-panel-background-toolbar)',
        'panel-background-transparent': 'var(--color-panel-background-transparent)',
        'panel-background-login': 'var(--color-panel-background-login)',
        'panel-border': 'var(--color-panel-border)',
        'panel-border-alt': 'var(--color-panel-border-alt)',
        'panel-text': 'var(--color-panel-text)',
        'panel-text-alt': 'var(--color-panel-text-alt)',
        'panel-primary': 'var(--color-panel-primary)',
        'panel-primary-hover': 'var(--color-panel-primary-hover)',
        'panel-important': 'var(--color-panel-important)',
        'panel-danger': 'var(--color-panel-danger)',
        'panel-warning': 'var(--color-panel-warning)',
        'panel-purple': 'var(--color-panel-purple)',
        'slider-background': 'var(--color-slider-background)',
        'slider-background-alt': 'var(--color-slider-background-alt)',
        'slider-thumb': 'var(--color-slider-thumb)',
        'slider-thumb-alt': 'var(--color-slider-thumb-alt)',
        'toast-background': 'var(--color-toast-background)',
        'toast-border': 'var(--color-toast-border)',
        'toast-text': 'var(--color-toast-text)',
        'toast-primary': 'var(--color-toast-primary)',
        'toast-primary-hover': 'var(--color-toast-primary-hover)',
        'toast-important': 'var(--color-toast-important)',
        'toast-danger': 'var(--color-toast-danger)',
        'toast-warning': 'var(--color-toast-warning)',
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
