/* eslint-disable global-require */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const isBuilding = global.BUILDING;
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)

const config = {
  context: __dirname,
  entry: [
    //'bootstrap-loader',
    'bulma/bulma.sass',
    '@blueprintjs/core/src/blueprint.scss',
    '!!font-awesome-sass-loader!./font-awesome.config.js',
    'roboto-npm-webfont',
    './css/main.scss',
    './src/main.jsx',
  ],
  mode: isDebug ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: isBuilding ? '/webui/dist/' : '/dist/',
    filename: isDebug ? '[name].js?[hash]' : '[name].[hash].js',
    chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
    sourcePrefix: '  ',
  },
  devServer: {
    hot: true,
  },
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
      debug: isDebug,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(global.NODE_ENV),
      __DEV__: isDebug,
    }),
    new AssetsPlugin({
      path: path.resolve(__dirname, './public/dist'),
      filename: 'assets.json',
      prettyPrint: true,
    }),
    new ExtractTextPlugin({
      filename: 'styles.css',
      allChunks: true,
      ignoreOrder: true,
      disable: isDebug,
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
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
        exclude: ['/node_modules/', '/css/'],
        use: ExtractTextPlugin.extract({
          disable: isDebug,
          fallback: 'style-loader',
          use: [{
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
        }),
      },
      {
        test: /\.sass$/,
        exclude: '/node_modules/',
        use: ExtractTextPlugin.extract({
          disable: isDebug,
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
              sourceMap: isDebug,
              localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
              minimize: !isDebug,
            },
          },
          { loader: 'sass-loader' },
          ],
        }),
      },
      {
        test: /\.scss$/,
        exclude: '/node_modules/',
        use: ExtractTextPlugin.extract({
          disable: isDebug,
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
              sourceMap: isDebug,
              localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
              minimize: !isDebug,
            },
          },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader?includePaths[]=./node_modules/bootstrap-sass/assets/stylesheets' },
          ],
        }),
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'url-loader?limit=100000&mimetype=application/font-woff',
      },
      {
        test: /\.(svg|eot|ttf|wav|mp3)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
};

if (!isDebug) {
  config.plugins.push(new UglifyJsPlugin({
    uglifyOptions: {
      mangle: false,
      compress: { warnings: isVerbose },
    },
  }));
  config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

if (isDebug && useHMR) {
  config.entry.unshift('webpack-hot-middleware/client');
  config.plugins.push(new webpack.NamedModulesPlugin());
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
}

module.exports = config;
