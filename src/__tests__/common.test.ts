import * as common from '../common';

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
