import BookmarkFolder from '../BookmarkFolder.svelte';

const node = {
  title: 'Test Bookmark',
};

describe('BookmarkFolder component', () => {
  it('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new BookmarkFolder({
      props: { node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
