import Search from '../../src/components/Search.svelte';

describe('Search component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new Search({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
