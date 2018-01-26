'use strict';

const fs = require('fs');

const tmpDirExists = fs.existsSync('/tmp/');

module.exports = {
  cache: true,
  extends: '@wearegenki/stylelint-config',

  // use in-memory cache for better performance
  ...(tmpDirExists ? { cacheLocation: '/tmp/' } : {}),

  rules: {
    "selector-max-id": null, // fine for performance IF you know what you're doing
  },
};
