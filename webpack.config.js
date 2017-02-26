var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './app.js',
  output: { path: path.join(__dirname, 'dist'), filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
  new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
		drop_console:true,
      }
    }),
  new webpack.NoEmitOnErrorsPlugin()
  ]
}