const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://welovepalop.com',
      changeOrigin: true,
      secure: false,
    })
  );
};