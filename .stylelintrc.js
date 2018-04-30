'use strict';

module.exports = {
  extends: '@wearegenki/stylelint-config',
  rules: {
    // fine for performance IF you know what you're doing
    'selector-max-id': null,

    // workaround for svelte forcing scoped CSS
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global']}],
  },
};
