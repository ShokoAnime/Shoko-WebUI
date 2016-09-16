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
const babelConfig = Object.assign({}, pkg.babel, {
  babelrc: false,
  cacheDirectory: useHMR,
});

const config = {
  context: __dirname,
  entry: [
    '!!style!css!bootstrap/dist/css/bootstrap.min.css',
    'font-awesome-webpack',
    '!!style!css!./css/bootstrap-reset.css',
    '!!style!css!./css/main.css',
    './main.jsx',
  ],
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: isBuilding ? '/webui/dist/' : '/dist/',
    filename: isDebug ? '[name].js?[hash]' : '[name].[hash].js',
    chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
    sourcePrefix: '  ',
  },
  debug: isDebug,
  devServer: {},
  devtool: isDebug ? 'source-map' : false,
  resolve: {
    extensions: ['', '.js', '.jsx'],
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
    new webpack.optimize.OccurrenceOrderPlugin(),
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
    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, './components'),
          path.resolve(__dirname, './core'),
          path.resolve(__dirname, './pages'),
          path.resolve(__dirname, './main.jsx'),
        ],
        loader: `babel-loader?${JSON.stringify(babelConfig)}`,
      },
      {
        test: /\.css/,
        loaders: [
          'style-loader',
          `css-loader?${JSON.stringify({
            sourceMap: isDebug,
            modules: true,
            localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
            minimize: !isDebug,
          })}`,
          'postcss-loader',
        ],
      },
      {
        test: /\.json$/,
        exclude: [
          path.resolve(__dirname, './routes.json'),
        ],
        loader: 'json-loader',
      },
      {
        test: /\.json$/,
        include: [
          path.resolve(__dirname, './routes.json'),
        ],
        loaders: [
          `babel-loader?${JSON.stringify(babelConfig)}`,
          path.resolve(__dirname, './utils/routes-loader.js'),
        ],
      },
      { // font-awesome fonts
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      { // font-awesome fonts
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader?limit=10000',
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
      },
    ],
  },
  postcss(bundler) {
    return [
      require('postcss-import')({ addDependencyTo: bundler }),
      require('postcss-custom-properties')(),
      require('postcss-custom-media')(),
      require('postcss-media-minmax')(),
      require('postcss-custom-selectors')(),
      require('postcss-calc')(),
      require('postcss-nesting')(),
      require('postcss-color-function')(),
      require('pleeease-filters')(),
      require('pixrem')(),
      require('postcss-selector-matches')(),
      require('postcss-selector-not')(),
      require('autoprefixer')(),
    ];
  },
};

if (!isDebug) {
  config.plugins.push(new webpack.optimize.DedupePlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: isVerbose } }));
  config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

if (isDebug && useHMR) {
  babelConfig.plugins.unshift('react-hot-loader/babel');
  config.entry.unshift('react-hot-loader/patch', 'webpack-hot-middleware/client');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NoErrorsPlugin());
}

module.exports = config;
