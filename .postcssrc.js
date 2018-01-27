/**
 * PostCSS configuration.
 * Handle custom syntax in CSS and Marko component styles.
 */

'use strict';

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: {
    '@wearegenki/postcss-config': {
      minimal: true,
    },
  },
};
