/* eslint-disable global-require */
const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const Version = require('./public/version.json');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const isBuilding = global.BUILDING;
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)

const config = {
  context: __dirname,
  entry: [
    '@fontsource/roboto/latin.css',
    '@fontsource/exo-2/latin.css',
    '@fontsource/mulish/latin.css',
    './css/main.scss',
    isDebug ? './src/main-hmr.tsx' : './src/main.tsx',
  ],
  mode: isDebug ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: isBuilding ? '/webui/dist/' : '/dist/',
    filename: isDebug ? '[name].js?[contenthash]' : '[name].[contenthash].js',
    chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
    sourceMapFilename: 'sourcemaps/[file].map[query]',
    sourcePrefix: '  ',
  },
  devServer: {
    hot: true,
  },
  devtool: isDebug || process.env.SENTRY_AUTH_TOKEN ? 'source-map' : false,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
    new ReactRefreshPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: isDebug,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDebug ? 'development' : 'production'),
      __DEV__: isDebug,
      'process.env.SENTRY_AUTH_TOKEN': JSON.stringify(process.env.SENTRY_AUTH_TOKEN),
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
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, './src')],
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'source-map-loader',
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
        type: 'asset/resource',
      },
      {
        test: /\.(svg|eot|ttf|wav|mp3)$/,
        type: 'asset/resource',
      },
    ],
  },
};

if (!isDebug) {
  config.optimization = {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: {
            collapse_vars: false,
          },
          warnings: false, // Suppress uglification warnings
          output: {
            comments: false,
          },
          sourceMap: true,
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
  if (process.env.SENTRY_AUTH_TOKEN) {
    config.plugins.push(sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'shoko-anime',
      project: 'shoko-webui',
      release: isDebug ? 'dev' : Version.package,
      include: './public/dist',
      urlPrefix: '~/webui/dist/',
      ignore: [],
    }));
  }
} else {
  /* const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  config.plugins.push(new BundleAnalyzerPlugin()); */
}

if (isDebug && useHMR) {
  config.watchOptions = {
    ignored: /public/, // because sass-loader causes rebuild loop otherwise
  };
  config.entry.unshift('webpack-hot-middleware/client');
  config.entry.unshift('@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.optimization = {
    ...config.optimization,
    emitOnErrors: false,
    moduleIds: 'named',
  };
}

module.exports = config;
