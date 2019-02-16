import Settings from '../src/Settings.svelte';

describe('Settings component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new Settings({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
