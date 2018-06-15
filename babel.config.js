// https://babeljs.io/docs/usage/api/#options

'use strict';

module.exports = {
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  env: {
    test: {
      presets: ['@minna-ui/jest-config/babel-preset.js'],
    },
  },
};
