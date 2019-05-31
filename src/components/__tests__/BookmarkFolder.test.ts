/* eslint-disable no-underscore-dangle */

import BookmarkFolder from '../BookmarkFolder.svelte';

const node = {
  title: 'Test Bookmark',
};

describe('BookmarkFolder component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkFolder({
      props: { node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
