'use strict';

const App = require('../src/App.html');

describe('App root component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new App({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
