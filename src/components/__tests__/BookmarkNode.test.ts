/* eslint-disable no-underscore-dangle */

import BookmarkNode from '../BookmarkNode';

const node = {};

describe('BookmarkNode component', () => {
  it.skip('renders correctly', () => {
    const target = document.createElement('div');
    new BookmarkNode({
      props: { node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
