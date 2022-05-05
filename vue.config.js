module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://qjr9yq.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}