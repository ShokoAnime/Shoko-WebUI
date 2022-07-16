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
    "@storybook/addon-essentials",
  ],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: false,
            importLoaders: 1,
            url: {
              //Fix for random login image
              filter: url => !url.startsWith('/api/'),
            },
          },
        },
        'postcss-loader',
        'sass-loader'
      ],
      include: path.resolve(__dirname, '../'),
    });
    return config
  },
}
