const { defineConfig } = require('@vue/cli-service');
const UnoCSS = require('@unocss/webpack').default
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir:  process.env.OUTPUT_DIR ?? 'dist',
  devServer: {
    proxy: {
      '/api': {
        target: process.env.PROXY,
      }
    },
    client: {
      overlay: false
    }
  },
  chainWebpack: config => {
    config.plugin('UnoCSS').use(UnoCSS)
    config.plugin('CleanWebpackPlugin').use(CleanWebpackPlugin, [{
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!*.php',
        '!.htaccess',
        '!robots.txt'
      ]
    }])
  }
});
