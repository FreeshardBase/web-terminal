module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://jgqct8.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}