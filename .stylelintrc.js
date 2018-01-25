'use strict';

module.exports = {
  cache: true,
  cacheLocation: '/tmp/', // use tmpfs for in-memory performance
  extends: '@wearegenki/ui-stylelint',
  rules: {
    "selector-max-id": null, // fine for performance IF you know what you're doing
  },
};
