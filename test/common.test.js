'use strict';

const common = require('../src/common.js');

describe('Helper debounce function', () => {
  it('function exists', () => {
    expect.assertions(1);
    expect(common.debounce).toBeDefined();
  });
});

describe('Helper handleLinkClick function', () => {
  it('function exists', () => {
    expect.assertions(1);
    expect(common.handleLinkClick).toBeDefined();
  });
});
