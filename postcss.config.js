/* eslint-disable global-require */
const webpack = require('webpack');

module.exports = {
  plugins: [
    require('postcss-import')({ addDependencyTo: webpack }),
    require('postcss-url')(),
    require('postcss-cssnext')({
      browsers: ['last 2 versions', 'ie >= 9'],
      compress: true,
    }),
    require('cssnano')({ zindex: false }),
  ],
};
