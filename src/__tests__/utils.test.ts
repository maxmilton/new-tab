/** @jest-environment node */

// TODO: Actually implement unit tests

import * as common from '../utils';

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
