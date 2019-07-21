import BookmarkGroup from '../BookmarkGroup.svelte';

describe('BookmarkGroup component', () => {
  it('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new BookmarkGroup({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
