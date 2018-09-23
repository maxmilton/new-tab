'use strict';

const BookmarkFolder = require('../../src/components/BookmarkFolder.html');

const _node = {};

describe('BookmarkFolder component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkFolder({
      target,
      data: { _node },
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
