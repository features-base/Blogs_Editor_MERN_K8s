const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const config = {
  ...common,
  mode: 'production',
  devtool: 'source-map',
}

cssLoader = config.module.rules.find(rule => {
  return (rule.test.toString().indexOf('css') !== -1)
})

cssLoader.use = [
  //  Will replace with custom plugin
  //    to avoid 3rd party dependencies
  MiniCssExtractPlugin.loader,
  ...cssLoader.use
]

config.optimization.minimizer = [
  //  will replace with custom css minifier plugin
  //    to avoid 3rd party dependencies
  new CssMinimizerPlugin(),
]

config.plugins.push(
  new MiniCssExtractPlugin({
    filename: 'static/[name].[contenthash].css'
  })
)

module.exports = config