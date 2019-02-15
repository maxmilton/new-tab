'use strict';

const Settings = require('../src/Settings.svelte');

describe('Settings component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new Settings({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
