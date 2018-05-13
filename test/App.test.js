'use strict';

const chrome = require('sinon-chrome');
const App = require('../src/App.html');

// set up Chrome API mocks
global.chrome = chrome;

describe('App root component', () => {
  it('should render correctly', () => {
    const target = document.createElement('div');
    new App({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
