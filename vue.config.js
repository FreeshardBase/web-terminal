module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://fc7z6q.p.getportal.org',
        changeOrigin: true
      },
    }
  }
}