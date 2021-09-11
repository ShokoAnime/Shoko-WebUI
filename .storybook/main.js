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
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ],
      include: path.resolve(__dirname, '../'),
    });
    return config
  },
}
