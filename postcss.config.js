// https://github.com/michael-ciniawsky/postcss-load-config

'use strict'; // eslint-disable-line

// eslint-disable-next-line import/no-extraneous-dependencies
const minnaUiPostcssConfig = require('@minna-ui/postcss-config');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  plugins: [
    minnaUiPostcssConfig({ verbose: isDev }),
  ],
};
