'use strict';

const BookmarkGroup = require('../src/components/BookmarkGroup.html');

describe('BookmarkGroup root component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkGroup({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
