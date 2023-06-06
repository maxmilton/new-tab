/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { append, create, h, type S1Node } from 'stage1';
import { Link, type LinkComponent, type LinkProps } from './Link';

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

type FolderPopupComponent = HTMLDivElement & {
  adjustPosition(): void;
};

const CLOSE_DELAY_MS = 600;
let emptyPopupView: S1Node | undefined;
let arrowView: S1Node | undefined;

const folderPopupView = create('div');
folderPopupView.className = 'sf';

const FolderPopup = (
  parent: HTMLElement,
  children: BookmarkTreeNode[],
  nested?: boolean | undefined,
): FolderPopupComponent => {
  const root = folderPopupView.cloneNode(true) as FolderPopupComponent;
  const parentRect = parent.getBoundingClientRect();
  let top: number;
  let left: number;

  if (nested) {
    // Show nested folder popup beside its parent
    top = parentRect.top;
    left = parentRect.right;
  } else {
    // Show top level folder popup bellow its parent
    top = parentRect.bottom;
    left = parentRect.left;
  }

  root.style.cssText = `top:${top}px;left:${left}px;max-height:${
    window.innerHeight - top
  }px`;

  if (children.length) {
    children.forEach((item) => append(BookmarkNode(item, true), root));
  } else {
    append((emptyPopupView ??= h('<div id=e>(empty)</div>')), root);
  }

  // Only after the component is mounted in the DOM do we have element size
  // information so final position adjustment is split into a separate step
  root.adjustPosition = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const width = root.offsetWidth;

    if (left + width > viewportWidth) {
      // Show top level aligned to the right edge of the viewport
      // Show nested show to the left of its parent
      root.style.left = nested
        ? parentRect.left - width + 'px'
        : viewportWidth - width + 'px';
    }
  };

  return root;
};

type FolderComponent = HTMLDivElement & {
  closePopup(this: void): void;
};

const folderView = create('div');
folderView.className = 'f';

export const Folder = (
  props: BookmarkTreeNode,
  nested?: boolean,
  children?: BookmarkTreeNode[],
): FolderComponent => {
  const root = folderView.cloneNode(true) as FolderComponent;
  let popup: FolderPopupComponent | null;
  let timer: NodeJS.Timeout;

  const clearTimer = () => clearTimeout(timer);

  const resetTimer = () => {
    clearTimer();
    timer = setTimeout(root.closePopup, CLOSE_DELAY_MS);
  };

  root.textContent = props.title;

  if (nested) {
    append(
      (arrowView ??= h(`
        <svg class=i>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      `)).cloneNode(true),
      root,
    );
  }

  root.closePopup = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  root.__mouseover = async () => {
    clearTimer();

    if (!popup) {
      // Immediately close any folder popups on the parent level
      root
        .parentNode!.querySelectorAll<FolderComponent>('.f')
        .forEach((folder) => folder.closePopup());

      popup = FolderPopup(
        root,
        children || (await chrome.bookmarks.getChildren(props.id)),
        nested,
      );

      popup.__mouseover = clearTimer;
      popup.__mouseout = resetTimer;

      append(popup, root);
      popup.adjustPosition();
    }
  };

  root.__mouseout = resetTimer;

  return root;
};

export const BookmarkNode = <T extends LinkProps | BookmarkTreeNode>(
  props: T,
  nested?: boolean,
): T extends { url: string } ? LinkComponent : FolderComponent =>
  // @ts-expect-error - FIXME:!
  props.url ? Link(props) : Folder(props, nested);
