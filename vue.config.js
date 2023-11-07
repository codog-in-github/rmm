const { defineConfig } = require('@vue/cli-service');
const UnoCSS = require('@unocss/webpack').default

module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: 'dist',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
      }
    }
  },
  chainWebpack: config => {
    config.plugin('uno').use(UnoCSS)
  }
});
