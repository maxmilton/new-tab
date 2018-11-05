import LinkItem from './LinkItem.html';
import BookmarkFolder from './BookmarkFolder.html';

export default function BookmarkNode(context) {
  /* eslint-disable-next-line no-underscore-dangle */
  return new (context.data._node.children !== undefined
    ? BookmarkFolder
    : LinkItem)(context);
}
