/* eslint-disable @typescript-eslint/no-var-requires, strict */

'use strict';

const { join } = require('path');

const dist = join(__dirname, 'dist');

module.exports = {
  launch: {
    args: [
      `--disable-extensions-except=${dist}`,
      `--load-extension=${dist}`,
      // required to run chromium in docker
      // '-–no-sandbox',
      // '–-disable-setuid-sandbox',
    ],
    dumpio: true,
    // extensions are only supported in headfull mode
    // https://github.com/GoogleChrome/puppeteer/issues/659
    headless: false,

    // slowMo: 1000,
  },
};
