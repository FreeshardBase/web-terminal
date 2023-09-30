module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        // target: 'https://c0p3x5.p.getportal.org',
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        cookieDomainRewrite: {
          "*": "localhost",
        },
        pathRewrite: {'^/core': ''}
      },
    }
  }
}
