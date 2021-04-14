module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://4vab2a.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}