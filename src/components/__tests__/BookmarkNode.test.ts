import BookmarkNode from '../BookmarkNode';

const node = {};

describe('BookmarkNode component', () => {
  it('renders correctly', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    // new BookmarkNode({
    BookmarkNode({
      props: { node },
      target,
    });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
