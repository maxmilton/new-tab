import { append, clone, create, h } from "stage1/fast";
import { chromeBookmarks } from "#utils.ts";
import { Link, type LinkComponent, type LinkProps } from "./Link.ts";

export type BookmarkTreeNode = Omit<chrome.bookmarks.BookmarkTreeNode, "syncing">;

type FolderPopupComponent = HTMLDivElement;

const CLOSE_DELAY_MS = 600;
let emptyPopup: HTMLDivElement | undefined;
let arrow: SVGElement | undefined;

const folderPopupView = create("div");
folderPopupView.className = "p";

const FolderPopup = (children: BookmarkTreeNode[]): FolderPopupComponent => {
  const root = clone(folderPopupView);

  if (children.length) {
    // oxlint-disable-next-line no-use-before-define
    children.forEach((item) => append(BookmarkNode(item, true), root));
  } else {
    append((emptyPopup ??= h<HTMLDivElement>("<div id=e>(empty)</div>")), root);
  }

  return root;
};

type FolderComponent = HTMLDivElement & {
  $$closePopup: () => void;
};

const folderView = create("div") as FolderComponent;
folderView.className = "f";

export const Folder = (
  props: BookmarkTreeNode,
  isNested?: boolean,
  children?: BookmarkTreeNode[],
): FolderComponent => {
  const root = clone(folderView);
  let popup: FolderPopupComponent | null;
  let timer: number | Timer;

  const clearTimer = () => clearTimeout(timer);

  const resetTimer = () => {
    clearTimer();
    timer = setTimeout(root.$$closePopup, CLOSE_DELAY_MS);
  };

  root.textContent = props.title;

  if (isNested) {
    append(
      // https://github.com/tailwindlabs/heroicons/blob/master/optimized/24/outline/arrow-right.svg
      clone((arrow ??= h<SVGElement>('<svg class=i><path d="M5 12h14M12 5l7 7-7 7"/></svg>'))),
      root,
    );
  }

  root.$$closePopup = () => {
    if (!popup) return;
    popup.remove();
    popup = null;
  };

  root.onmouseover = async () => {
    clearTimer();

    if (!popup) {
      // Immediately close any folder popups on the parent level
      root
        .parentNode!.querySelectorAll<FolderComponent>(".f")
        .forEach((folder) => folder.$$closePopup());

      popup = FolderPopup(children ?? (await chromeBookmarks.getChildren(props.id)));

      popup.onmouseover = clearTimer;
      popup.onmouseout = resetTimer;

      append(popup, root);
    }
  };

  root.onmouseout = resetTimer;

  return root;
};

export const BookmarkNode = (
  props: LinkProps | Omit<BookmarkTreeNode, "url">,
  isNested?: boolean,
): LinkComponent | FolderComponent => ("url" in props ? Link(props) : Folder(props, isNested));
