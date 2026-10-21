import { append, create, h } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };
import { chromeBookmarks } from "#/utils.ts";
import { BookmarkNode, type BookmarkTreeNode, Folder } from "./BookmarkNode.ts";

type BookmarkBarComponent = HTMLDivElement;

export const BookmarkBar = (): BookmarkBarComponent => {
  const root = create("div");
  root.id = "b";

  // oxlint-disable-next-line @typescript-eslint/no-misused-promises
  chromeBookmarks.getChildren("0", async (roots) => {
    const getChildren = (isBar = false) =>
      Promise.all(
        roots.flatMap((node) =>
          (node.folderType === "bookmarks-bar") === isBar
            ? chromeBookmarks.getChildren(node.id)
            : [],
        ),
      ).then((children) => children.flat());
    const bookmarks = await getChildren(true);
    const len = bookmarks.length;

    // Since we can't determine an element's width before it's included in the
    // DOM, we have to insert BookmarkNodes individually until no more can fit.
    // Any leftover items are then placed in an overflow folder.
    // oxlint-disable-next-line no-multi-assign
    const resize = (window.onresize = () => {
      performance.mark("BookmarkBar");

      // Remove all child nodes
      root.textContent = "";

      // Max width is root minus overflow folder width (68 == 24px SVG + 2 * 9px
      // SVG padding + 2 * 13px bookmark item padding)
      const maxWidth = root.clientWidth - 68;
      const otherBookmarksFolder = append(
        Folder({ title: "Other Bookmarks" } as BookmarkTreeNode, false, getChildren),
        root,
      );
      // NOTE: The elements we're measuring don't have a border or margin so
      // we can use clientWidth instead of offsetWidth for better performance.
      let width = otherBookmarksFolder.clientWidth;
      let index = 0;
      let node: ReturnType<typeof BookmarkNode>;

      // Add one bookmark at a time until we overflow the max width
      for (; index < len; index++) {
        node = append(BookmarkNode(bookmarks[index]), root);
        width += node.clientWidth;

        if (width >= maxWidth) {
          // Remove the node which overflowed
          node.remove();

          const overflowBookmarksFolder = append(
            // oxlint-disable-next-line no-loop-func
            Folder({} as BookmarkTreeNode, false, () => bookmarks.slice(index)),
            root,
          );
          overflowBookmarksFolder.className = "f end";

          append(
            h<SVGElement>(
              // https://github.com/feathericons/feather/blob/master/icons/corner-right-down.svg
              compile(/* html */ `
                <svg id=io>
                  <path d="M4 4h7a4 4 0 014 4v12m-5-5 5 5 5-5"/>
                </svg>
              `).html,
            ),
            overflowBookmarksFolder,
          );
          break;
        }
      }

      // The "Other Bookmarks" folder was added first so overflow calculation
      // is correct but now move it to its proper position at the end
      append(otherBookmarksFolder, root).className = "f end";

      performance.measure("BookmarkBar", "BookmarkBar");
    });

    // HACK: Workaround for race condition. This script is loaded asynchronously,
    // which yields the best performance, but it means this code may execute
    // before the CSS has loaded. Styles are needed to calculate the bookmark
    // item widths, so wait until the CSS is ready.
    const waitForStylesThenResize = () =>
      document.styleSheets.length
        ? resize()
        : // oxlint-disable-next-line unicorn/explicit-timer-delay
          setTimeout(waitForStylesThenResize);

    waitForStylesThenResize();
  });

  return root;
};
