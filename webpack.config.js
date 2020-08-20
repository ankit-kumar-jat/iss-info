const path = require('path');
module.exports = {
  entry: './js_src/index.js',
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'bundle.js'
  },
  "mode": "production"
};
