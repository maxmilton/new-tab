import { h } from 'stage1';
import { append, create } from '../utils';
import { BookmarkNode, Folder, FolderProps } from './BookmarkNode';

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

export function BookmarkBar(): BookmarkBarComponent {
  const root = create('div');
  root.id = 'b';

  chrome.bookmarks.getTree((tree) => {
    const [{ children: bookmarks }, otherBookmarks] = tree[0].children!;
    const len = bookmarks!.length;

    // Add BookmarkNodes one at a time until they can't fit in the bookmark
    // bar and then create a folder with the overflowing items
    const resize = () => {
      // Remove all child nodes
      root.textContent = '';

      let otherBookmarksFolder;
      // NOTE: None of the elements we're measuring have a border or margin so
      // we can use clientWidth instead of offsetWidth for better performance
      let currentWidth = 0;

      if (otherBookmarks.children!.length) {
        (otherBookmarks as FolderProps).end = true;
        otherBookmarksFolder = append(Folder(otherBookmarks), root);
        currentWidth = otherBookmarksFolder.clientWidth;
      }

      if (len) {
        // minus overflow folder width (66 == 24px svg + 2*8px padding + 2*13px padding)
        const maxWidth = root.clientWidth - 66;
        let index = 0;

        for (; index < len; index++) {
          const item = bookmarks![index];
          const node = append(BookmarkNode(item), root);
          currentWidth += node.clientWidth;

          if (currentWidth >= maxWidth) {
            // There's no way to know an element's width before adding it to the
            // DOM so now we need to remove the added node which overflowed
            node.remove();
            break;
          }
        }

        if (index < len) {
          const overflowBookmarksFolder = append(
            Folder({
              children: bookmarks!.slice(index),
              end: true,
              title: '',
            }),
            root,
          );

          append(
            // https://github.com/feathericons/feather/blob/master/icons/corner-right-down.svg
            h`
              <svg viewBox="0 0 24 24" class=io>
                <polyline points="10 15 15 20 20 15" />
                <path d="M4 4h7a4 4 0 0 1 4 4v12" />
              </svg>
            `,
            overflowBookmarksFolder,
          );
        }

        // The "other bookmarks" folder was added first so overflow calculation
        // is correct but now move it to its proper position at the end
        if (otherBookmarksFolder) {
          append(otherBookmarksFolder, root);
        }
      }
    };

    resize();

    window.onresize = resize;
  });

  // Synthetic `mouseenter` and `mouseleave` event handler
  // XXX: Similar to stage1 synthetic event logic but does not stop propagating
  // once an event handler is called + extra relatedTarget checks
  // https://github.com/maxmilton/stage1/blob/495ccf98af62fc1a1360bbf23de1ab2712eb586c/src/events.ts#L3
  // eslint-disable-next-line no-multi-assign
  root.onmouseover = root.onmouseout = (event) => {
    const eventKey = '__' + event.type;
    // null when mouse moves from/to outside the viewport
    const related = event.relatedTarget as Node | null;
    let node = event.target as Node | null;

    while (node) {
      // @ts-expect-error - string indexing dom is unavoidable
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const eventHandler = node[eventKey];

      if (eventHandler && (!related || !node.contains(related))) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        eventHandler(event);
      }
      node = node.parentNode;
    }
  };

  return root;
}
