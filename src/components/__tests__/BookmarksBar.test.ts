import BookmarksBar from '../BookmarksBar.svelte';

describe('BookmarksBar component', () => {
  it('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new BookmarksBar({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
