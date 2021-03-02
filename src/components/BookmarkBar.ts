// FIXME: Only show amount of bookmarks which will fit including other bookmarks

import { BookmarkNode } from './BookmarkNode';

export function BookmarkBar() {
  const root = document.createElement('div');
  root.className = 'bookmarks';

  chrome.bookmarks.getTree((tree) => {
    const bookmarks = tree[0].children[0].children;
    const otherBookmarks = tree[0].children[1];

    // bookmarks?.forEach((item) => {
    //   root.appendChild(BookmarkNode(item));
    // });

    // FIXME: Temp
    const maxNodes = 10;

    bookmarks?.slice(0, maxNodes).forEach((item) => {
      root.appendChild(BookmarkNode(item));
    });

    const overflow = bookmarks?.slice(maxNodes);

    if (overflow?.length) {
      root.appendChild(
        BookmarkNode({ children: overflow, end: true, title: '>>' }),
      );
    }

    if (otherBookmarks.children?.length) {
      otherBookmarks.end = true;
      root.appendChild(BookmarkNode(otherBookmarks));
    }
  });

  return root;
}
