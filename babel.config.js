module.exports = (api) => {
  const BABEL_ENV = api.env();
  const config = {
    presets: [
      '@babel/react',
      '@babel/typescript',
      ['@babel/env', { modules: false }],
    ],
    plugins: [],
  };

  if (BABEL_ENV === 'development') {
    config.plugins.unshift('react-refresh/babel');
  }

  return config;
};