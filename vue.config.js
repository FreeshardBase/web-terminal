module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://p7cnzk.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}