'use strict';

module.exports = {
  extends: '@minna-ui/stylelint-config',
  rules: {
    // fine for performance IF you know what you're doing
    'selector-max-id': null,

    /** Preset Overrides */

    // clean-css can't convert colours in CSS variables so we have to use HEX colours
    'color-no-hex': null,
  },
};
