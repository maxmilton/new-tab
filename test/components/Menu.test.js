'use strict';

const Menu = require('../../src/components/Menu.html');

describe('Menu component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new Menu({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });

  it('opens the settings page', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new Menu({ target });
    const link = target.querySelector('#o');
    const spy = jest.spyOn(chrome.runtime, 'openOptionsPage', 'get');
    link.click();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
