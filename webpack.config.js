var webpack = require('webpack');

var JS_DIST_PATH = '/dist/js/';

module.exports = {
  entry: './src/client/entry',
  output: {
    libraryTarget: "var",
    path: __dirname + JS_DIST_PATH,
    filename: 'app-bundle.js'
  },
  target: 'web',
  plugins: [
    new webpack.ProvidePlugin({
      riot: 'riot',
      _: 'lodash',
      moment: 'moment',
      RiotControl: 'riotcontrol'
    })
  ],
  module: {
    preLoaders: [
      { test: /\.jade\.tag$/, exclude: /node_modules/, loader: 'riotjs-loader',
        query: { type: 'es6', template: 'jade' } },
      { test: /\.tag$/, exclude: /node_modules/, loader: 'riotjs-loader',
        query: { type: 'es6'} }
    ],
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: "style!css", exclude: /node_modules/ },
      { test: /\.less$/, loader: "style!css!less", exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
      { test: /\.(ttf|woff|woff2|svg|eot)(\?[^?]*)?$/, loader: 'file!url', exclude: /node_modules/ },
      { test: /\.csv$/, loader: 'dsv-loader' } 
    ]
  },
  devServer: {
    contentBase: __dirname,
    publicPath: JS_DIST_PATH
  }
};
