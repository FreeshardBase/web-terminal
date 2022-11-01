module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        cookieDomainRewrite: {
          "*": "localhost",
        },
        pathRewrite: {'^/core': ''}
      },
    }
  }
}
