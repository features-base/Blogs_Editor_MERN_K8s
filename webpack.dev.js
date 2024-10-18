const common = require('./webpack.common.js');

const config = {
  ...common, 
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      publicPath: "./dist",
    },
    hot: true,
    open: true,
    port: 3000,
    historyApiFallback: true,
  },
};

cssLoader = config.module.rules.find(rule => {
  return (rule.test.toString().indexOf('css') !== -1)
})

cssLoader.use = [
  'style-loader',
  ...cssLoader.use
]

module.exports = config