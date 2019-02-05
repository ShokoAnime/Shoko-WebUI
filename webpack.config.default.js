/* eslint-disable global-require */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const isBuilding = global.BUILDING;
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)

const config = {
  context: __dirname,
  entry: [
    'typeface-roboto',
    'bulma/bulma.sass',
    '@blueprintjs/core/src/blueprint.scss',
    './css/main.scss',
    isDebug ? './src/main-hmr.jsx' : './src/main.jsx',
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
    reasons: false,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
    optimizationBailout: isVerbose,
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
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
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
        exclude: [/node_modules/],
        use: [
          isDebug ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: true, importLoaders: 1 },
          },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/],
        use: [
          isDebug ? 'style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          isDebug ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: false, importLoaders: 1 },
          },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' },
        ],
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
  config.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: false,
          compress: {
            warnings: false, // Suppress uglification warnings
            collapse_vars: false,
          },
          output: {
            comments: false,
          },
          exclude: [/\.min\.js$/gi], // skip pre-minified libs
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        main: {
          name: 'main',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  };
} else {
  /* const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  config.plugins.push(new BundleAnalyzerPlugin()); */
}

if (isDebug && useHMR) {
  config.entry.unshift('webpack-hot-middleware/client');
  config.plugins.push(new webpack.NamedModulesPlugin());
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
}

module.exports = config;
