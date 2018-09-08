'use strict';

const BookmarkItem = require('../../src/components/BookmarkItem.html');

const _node = {};

describe('BookmarkItem component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkItem({
      target,
      data: {
        _node,
      },
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
