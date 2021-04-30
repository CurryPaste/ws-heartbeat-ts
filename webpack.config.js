// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const config = {
  entry: {
    index: './lib/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: "umd" // 解决__WEBPACK_IMPORTED_MODULE_5___default.a is not a constructor 错误
  },

  module: {
    rules:[
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
              loader: 'ts-loader'
          }
        ]
      },
    ]
  },
  mode: 'production'
};
module.exports = config;
