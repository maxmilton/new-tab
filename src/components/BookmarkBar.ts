import { BookmarkNode, Folder } from './BookmarkNode';

type BookmarkBarComponent = HTMLDivElement;

export function BookmarkBar(): BookmarkBarComponent {
  const root = document.createElement('div');
  root.className = 'bookmarks';

  chrome.bookmarks.getTree((tree) => {
    if (!tree[0] || !tree[0].children || !tree[0].children.length) return;

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
      // @ts-expect-error - FIXME
      root.appendChild(Folder({ children: overflow, end: true, title: '>>' }));
    }

    if (otherBookmarks.children?.length) {
      // @ts-expect-error - FIXME
      otherBookmarks.end = true;
      root.appendChild(Folder(otherBookmarks));
    }
  });

  return root;
}
