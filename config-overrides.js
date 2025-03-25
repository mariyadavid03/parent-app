const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  addWebpackResolve({
    fallback: {
      querystring: require.resolve('querystring-es3') // Polyfill for querystring
    }
  })
);
