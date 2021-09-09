const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [{
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    index: path.join(__dirname, 'src', 'index.ts'),
    ReactRenderer: path.join(__dirname, 'src', 'reactRenderer.tsx'),
    SingleSpaRenderer: path.join(__dirname, 'src', 'singleSpaRenderer.ts'),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['__webpack_init_sharing__', '__webpack_share_scopes__']
          },
        },
      }),
    ],
  },
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  externals: {
    react: 'react',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname)],
        exclude: ['/node_modules/', '/dist/', '/lib/', '/tests/'],
      },
    ],
  },
  plugins: [
  ],
  output: {
    filename: '[name].js',
    library: {
      name: 'divsrc-sdk',
      type: 'umd',
    },
    clean: true,
    path: path.resolve(__dirname, `lib`),
  },
}];
