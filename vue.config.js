module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://xveejf.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}