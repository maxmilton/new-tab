import Settings from '../Settings.svelte';

describe('Settings component', () => {
  it('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new Settings({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
