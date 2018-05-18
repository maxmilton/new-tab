// https://github.com/michael-ciniawsky/postcss-load-config

'use strict';

const atImport = require('postcss-import');
const nested = require('postcss-nested');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    atImport,
    nested,
    autoprefixer,
  ],
};
