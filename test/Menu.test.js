'use strict';

const Menu = require('../src/components/Menu.html');

describe('Menu root component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new Menu({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
