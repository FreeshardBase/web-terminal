module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://yqs579.p.getportal.org',
        changeOrigin: true
      },
    }
  }
}