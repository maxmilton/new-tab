import BookmarkNode from '../../src/components/BookmarkNode.svelte';

const _node = {};

describe('BookmarkNode component', () => {
  it.skip('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkNode({
      data: { _node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
