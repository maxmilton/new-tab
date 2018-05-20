'use strict';

const BookmarkItem = require('../src/components/BookmarkItem.html');

const __node = {};

describe('BookmarkItem component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkItem({
      target,
      data: {
        __node,
      },
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
