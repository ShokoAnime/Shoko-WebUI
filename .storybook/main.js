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
    "@storybook/preset-scss",
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
