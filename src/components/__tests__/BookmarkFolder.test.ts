/* eslint-disable no-underscore-dangle */

import BookmarkFolder from '../BookmarkFolder.svelte';

const _node = {
  title: 'Test Bookmark',
};

describe('BookmarkFolder component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkFolder({
      props: { _node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
