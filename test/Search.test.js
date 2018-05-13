'use strict';

const Search = require('../src/components/Search.html');

describe('Search component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new Search({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
