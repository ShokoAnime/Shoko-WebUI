/* eslint-disable global-require */
const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const childProcess = require('child_process');
const pkg = require('./package.json');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const isBuilding = global.BUILDING;
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)

const config = {
  context: __dirname,
  entry: [
    '!!style-loader!css-loader!roboto-npm-webfont/style.css',
    '!!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css',
    '!!style-loader!css-loader!./css/bootstrap-reset.css',
    '!!style-loader!css-loader!./css/main.css',
    './src/main.jsx',
  ],
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: isBuilding ? '/webui/dist/' : '/dist/',
    filename: isDebug ? '[name].js?[hash]' : '[name].[hash].js',
    chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
    sourcePrefix: '  ',
  },
  resolveLoader: {
    alias: {
      'routes-loader': path.join(__dirname, './utils/routes-loader'),
    },
  },
  devServer: {},
  devtool: isDebug ? 'source-map' : false,
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(global.NODE_ENV),
      __DEV__: isDebug,
      __VERSION__: isDebug ? childProcess.execSync("git log --pretty=format:'%h' -n 1").toString()
        : JSON.stringify(pkg.version),
    }),
    new AssetsPlugin({
      path: path.resolve(__dirname, './public/dist'),
      filename: 'assets.json',
      prettyPrint: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, './src'),
        ],
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              sourceMap: isDebug,
              localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
              minimize: !isDebug,
            },
          },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /routes\.json$/,
        include: [
          path.resolve(__dirname, './src/routes.json'),
        ],
        use: [
          'babel-loader',
          'routes-loader',
        ],
      },
      {
        test: /\.(woff|woff2|svg|eot|ttf|wav|mp3)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
};

if (!isDebug) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    mangle: false,
    compress: { warnings: isVerbose },
  }));
  config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

if (isDebug && useHMR) {
  config.entry.unshift('react-hot-loader/patch', 'webpack-hot-middleware/client');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
}

module.exports = config;
