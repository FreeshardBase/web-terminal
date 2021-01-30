module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://ey9cqr.p.getportal.org',
        changeOrigin: true
      },
    }
  }
}