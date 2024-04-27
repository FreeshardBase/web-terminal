module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        target: 'https://8rgg8z.p.getportal.org',
        //target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        cookieDomainRewrite: {
          "*": "localhost",
        },
        //pathRewrite: {'^/core': ''}
      },
    }
  },
  chainWebpack: (config) => {
    // Add a rule to handle b-card as a module dependency
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) => {
        // Extend or modify the loader options
        options.transformAssetUrls = {
          // Add the tags and attributes you want to handle as module dependencies
          'b-card': ['img-src', 'img-srcset', 'source', 'src', 'srcset'],
          'b-card-img': ['img-src', 'img-srcset', 'source', 'src', 'srcset'],
          'usage-prompt-card': ['image'],
          // Add more as needed
        };
        return options;
      });
  }
}
