module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://lbdlja.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}