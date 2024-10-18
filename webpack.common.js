const path = require("path");
const webpack = require('webpack')
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const WebpackInitPlugin = require('./WebpackInitPlugin')

module.exports = {
  entry: "/src/index.js",
  //  
  output: {
    filename: (pathData) => {
      return 'static/[name].[contenthash].js'
    },
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      //  Loading JavaScript files
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      //  Loading CSS files
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        use: ["css-loader", "postcss-loader"],
      },
      //  Loading image files
      {
        test: /\.(jpe?g|png|ico|svg)$/,
        include: path.resolve(__dirname, "src"),
        use: ["file-loader"],
      },
    ],
  },
  optimization: {
    moduleIds: 'deterministic',
     runtimeChunk: 'single',
     splitChunks: {
       cacheGroups: {
        //  Caching dependencies into seperate chunk to 
        //    reduce rebuild times
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        //  Splitting style sheets, to provide with initial shell
        style: {
          test: /\.(css|scss)$/,
          name: 'styles',
          chunks: 'all',
        },
       },
     },
  },
  plugins: [
    //  Custom plugin tapped into environment hook
    //    to copy the favicon into build folder
    //    , to create, or clean the build folder
    //    , or to run some custom js scripts
    new WebpackInitPlugin({
      scripts: ['./js_scripts/reactStartScripts.js']
    }),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
    }),
    new WebpackManifestPlugin({
      //  Modifying manifest to provide compatibility with
      //    'react-scripts' format.
      //  This makes the webpack config portable with
      //    projects using 'react-scripts', allowing the
      //    projects to safely migrate from 'react-scripts' to webpack
      fileName: 'asset-manifest.json',
      generate: (seed, files, entries) => {
        const output = {}
        files.map((file) => {
          output[file.name] = file.path.slice(5)
        })
        output.entrypoints = entries.main
        return output
      }
    }),
    //  Providing process.env as a global variable, 
    //    for the compilation step
    new webpack.DefinePlugin({ 
      process: { env: {} }
    }),
  ],
};