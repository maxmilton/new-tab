/* eslint-disable no-underscore-dangle */

import BookmarkNode from '../BookmarkNode.svelte';

const _node = {};

describe('BookmarkNode component', () => {
  it.skip('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkNode({
      props: { _node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
