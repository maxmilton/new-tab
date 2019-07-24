import BookmarkNode from '../BookmarkNode';

const node = {};

describe('BookmarkNode component', () => {
  it.skip('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    new BookmarkNode({
      props: { node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
