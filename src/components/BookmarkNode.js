import LinkItem from './LinkItem.html';
import BookmarkFolder from './BookmarkFolder.html';

export default function BookmarkNode(context) {
  return new (context.data._node.children !== undefined
    ? BookmarkFolder
    : LinkItem)(context);
}
