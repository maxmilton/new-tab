'use strict';

const BookmarkGroup = require('../../src/components/BookmarkGroup.html');

describe('BookmarkGroup component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkGroup({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
