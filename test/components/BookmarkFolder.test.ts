import BookmarkFolder from '../../src/components/BookmarkFolder.svelte';

const _node = {};

describe('BookmarkFolder component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkFolder({
      data: { _node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
