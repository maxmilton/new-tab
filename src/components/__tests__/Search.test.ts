import Search from '../Search.svelte';

describe('Search component', () => {
  it('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new Search({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
