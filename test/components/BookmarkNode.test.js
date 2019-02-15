'use strict';

const BookmarkNode = require('../../src/components/BookmarkNode.svelte');

const _node = {};

describe('BookmarkNode component', () => {
  it.skip('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkNode({
      target,
      data: { _node },
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
