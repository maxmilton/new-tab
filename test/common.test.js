'use strict';

const helpers = require('../src/helpers.js');

describe('Helper debounce function', () => {
  it('function exists', () => {
    expect.assertions(1);
    expect(helpers.debounce).toBeDefined();
  });
});

describe('Helper handleLinkClick function', () => {
  it('function exists', () => {
    expect.assertions(1);
    expect(helpers.handleLinkClick).toBeDefined();
  });
});
