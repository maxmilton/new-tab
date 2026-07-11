// TODO: Rewrite folder position logic using:
// - https://developer.chrome.com/blog/anchor-positioning-api
// - https://web.dev/blog/popover-api

import { append, clone, create, h } from "stage1/fast";
import { chromeBookmarks } from "#utils.ts";
import { Link, type LinkComponent, type LinkProps } from "./Link.ts";

export type BookmarkTreeNode = Omit<chrome.bookmarks.BookmarkTreeNode, "syncing">;

type FolderPopupComponent = HTMLDivElement & {
  $$adjustPosition: () => void;
};

const CLOSE_DELAY_MS = 600;
let emptyPopup: HTMLDivElement | undefined;
let arrow: SVGElement | undefined;

const folderPopupView = create("div") as FolderPopupComponent;
folderPopupView.className = "sf";

const FolderPopup = (
  parent: HTMLElement,
  children: BookmarkTreeNode[],
  isNested?: boolean,
): FolderPopupComponent => {
  const root = clone(folderPopupView);
  const parentRect = parent.getBoundingClientRect();
  let top: number;
  let left: number;

  if (isNested) {
    // Show nested folder popup beside its parent
    top = parentRect.top; // oxlint-disable-line prefer-destructuring
    left = parentRect.right;
  } else {
    // Show top level folder popup bellow its parent
    top = parentRect.bottom;
    left = parentRect.left; // oxlint-disable-line prefer-destructuring
  }

  root.style.cssText = `top:${top}px;left:${left}px;max-height:${window.innerHeight - top}px`;

  if (children.length) {
    // oxlint-disable-next-line no-use-before-define
    children.forEach((item) => append(BookmarkNode(item, true), root));
  } else {
    append((emptyPopup ??= h<HTMLDivElement>("<div id=e>(empty)</div>")), root);
  }

  // Only after the component is mounted in the DOM do we have element size
  // information so final position adjustment is split into a separate step
  root.$$adjustPosition = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const width = root.offsetWidth;

    if (left + width > viewportWidth) {
      // Show top level aligned to the right edge of the viewport
      // Show nested show to the left of its parent
      root.style.left = (isNested ? parentRect.left : viewportWidth) - width + "px";
    }
  };

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

      popup = FolderPopup(
        root,
        children ?? (await chromeBookmarks.getChildren(props.id)),
        isNested,
      );

      popup.onmouseover = clearTimer;
      popup.onmouseout = resetTimer;

      append(popup, root);
      popup.$$adjustPosition();
    }
  };

  root.onmouseout = resetTimer;

  return root;
};

export const BookmarkNode = (
  props: LinkProps | Omit<BookmarkTreeNode, "url">,
  isNested?: boolean,
): LinkComponent | FolderComponent => ("url" in props ? Link(props) : Folder(props, isNested));
