module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://c0p3x5.p.getportal.org',
        changeOrigin: true,
        cookieDomainRewrite: {
          "*": "localhost",
        },
        //pathRewrite: {'^/core': ''}
      },
    }
  }
}
