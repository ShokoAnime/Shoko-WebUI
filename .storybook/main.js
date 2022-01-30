const path = require('path');

module.exports = {
  core: {
    builder: "webpack5",
  },
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    {
      name: '@storybook/preset-scss',
      options: {
        cssLoaderOptions: {
          url: false,
        },
      },
    },
    {
      name: '@storybook/addon-postcss',
      options: {
        cssLoaderOptions: {
          importLoaders: 1,
          modules: true,
        },
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
        rule: {
          exclude: [/node_modules/],
        }
      },
    },
  ],
}
