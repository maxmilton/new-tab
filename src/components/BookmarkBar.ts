import { append, create, h } from 'stage1';
import { BookmarkNode, Folder, type BookmarkTreeNode } from './BookmarkNode';

declare global {
  interface HTMLElement {
    /**
     * BookmarkBar synthetic `mouseenter` event handler. Note the property is
     * named `__mouseover` but it actually works like `mouseenter`.
     */
    __mouseover(event: MouseEvent): void;
    /**
     * BookmarkBar synthetic `mouseleave` event handler. Note the property is
     * named `__mouseout` but it actually works like `mouseleave`.
     */
    __mouseout(event: MouseEvent): void;
  }
}

type BookmarkBarComponent = HTMLDivElement;

export const BookmarkBar = (): BookmarkBarComponent => {
  const root = create('div');
  root.id = 'b';

  void chrome.bookmarks.getChildren('1').then((bookmarks) => {
    const len = bookmarks.length;

    // Since we can't determine an element's width before it's included in the
    // DOM, we have to insert BookmarkNodes individually until no more can fit.
    // Any leftover items are then placed in an overflow folder.
    const resize = () => {
      performance.mark('BookmarkBar');

      // Remove all child nodes
      root.textContent = '';

      // Max width is root minus overflow folder width (68 == 24px svg + 2 * 9px
      // svg padding + 2 * 13px bookmark item padding)
      const maxWidth = root.clientWidth - 68;
      const otherBookmarksFolder = append(
        Folder({ id: '2', title: 'Other Bookmarks' }),
        root,
      );
      // NOTE: The elements we're measuring don't have a border or margin so
      // we can use clientWidth instead of offsetWidth for better performance.
      let currentWidth = otherBookmarksFolder.clientWidth;
      let index = 0;

      for (; index < len; index++) {
        const node = append(BookmarkNode(bookmarks[index]), root);
        currentWidth += node.clientWidth;

        if (currentWidth >= maxWidth) {
          // Remove the node which overflowed
          node.remove();
          break;
        }
      }

      if (index < len) {
        const overflowBookmarksFolder = append(
          Folder({} as BookmarkTreeNode, false, bookmarks.slice(index)),
          root,
        );
        overflowBookmarksFolder.className += ' end';

        append(
          // https://github.com/feathericons/feather/blob/master/icons/corner-right-down.svg
          h(`
              <svg id=io>
                <polyline points="10 15 15 20 20 15"/>
                <path d="M4 4h7a4 4 0 0 1 4 4v12"/>
              </svg>
            `),
          overflowBookmarksFolder,
        );
      }

      // The "Other Bookmarks" folder was added first so overflow calculation
      // is correct but now move it to its proper position at the end
      append(otherBookmarksFolder, root);
      otherBookmarksFolder.className += ' end';

      performance.measure('BookmarkBar', 'BookmarkBar');
    };

    // HACK: Workaround for race condition. This script is loaded asynchronously,
    // which yeilds the best performance, but it means this code may execute
    // before the CSS has loaded. Styles are needed to calculate the bookmark
    // item widths, so wait until the CSS is ready.
    const waitForStylesThenResize = () => {
      if (document.styleSheets.length) {
        resize();
      } else {
        setTimeout(waitForStylesThenResize);
      }
    };

    waitForStylesThenResize();

    window.onresize = resize;
  });

  // Synthetic `mouseenter` and `mouseleave` event handler
  // XXX: Similar to stage1 synthetic event logic but does not stop propagating
  // once an event handler is called + extra relatedTarget checks
  // https://github.com/maxmilton/stage1/blob/08cb3c08cb3e5513c181f768ae92c488cfe2a17a/src/events.ts#L3
  // eslint-disable-next-line no-multi-assign
  root.onmouseover = root.onmouseout = (event) => {
    const eventKey = ('__' + event.type) as '__mouseover' | '__mouseout';
    // null when mouse moves from/to outside the viewport
    const related = event.relatedTarget as Node | null;
    let node = event.target as
      | (Node & {
          __mouseover?(event2: MouseEvent): void;
          __mouseout?(event2: MouseEvent): void;
        })
      | null;

    while (node) {
      if (node[eventKey] && (!related || !node.contains(related))) {
        node[eventKey]!(event);
      }
      node = node.parentNode;
    }
  };

  return root;
};
