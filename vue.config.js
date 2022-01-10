module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://nctb9c.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}