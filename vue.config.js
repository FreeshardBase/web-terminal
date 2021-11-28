module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://d7bprt.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
        "*": "localhost",
      }
      },
    }
  }
}