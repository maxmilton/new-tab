// https://github.com/michael-ciniawsky/postcss-load-config

'use strict';

const minnaUiPostcssConfig = require('@minna-ui/postcss-config');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  plugins: [
    minnaUiPostcssConfig({ verbose: isDev }),
  ],
};
