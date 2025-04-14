module.exports = {
  devServer: {
    proxy: {
      '^/core': {
        //target: 'https://c0p3x5.freeshard.cloud',
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {'^/core': ''}
      },
    },
    allowedHosts: [
      '.localhost',
    ],
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
