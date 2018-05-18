// https://stylelint.io/user-guide/configuration/

'use strict';

module.exports = {
  extends: '@minna-ui/stylelint-config',
  rules: {
    // fine for performance IF you know what you're doing
    'selector-max-id': null,

    // clean-css can't convert colours in CSS var() so we need to use HEX colours
    'color-no-hex': null,
  },
};
