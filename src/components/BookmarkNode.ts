/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { h } from 'stage1';
import { append, create } from '../utils';
import { Link, LinkComponent, LinkProps } from './Link';

type FolderPopupComponent = HTMLDivElement;

const CLOSE_DELAY_MS = 600;
let emptyPopupView;

const folderPopupView = create('div');
folderPopupView.className = 'sf';

function FolderPopup(
  parent: Element,
  children: chrome.bookmarks.BookmarkTreeNode[],
  topLevel: boolean,
): FolderPopupComponent {
  const root = folderPopupView.cloneNode(true) as FolderPopupComponent;

  const parentPos = parent.getBoundingClientRect();

  if (!topLevel) {
    // show nested folder popup beside its parent
    root.style.top = parentPos.top + 'px';
    root.style.left = parentPos.right + 'px';
  } else {
    // show top level folder popup bellow its parent
    // root.style.top = parentPos.bottom + 'px';
    // root.style.left = parentPos.left + 'px';

    root.style.top = parentPos.bottom + 'px';

    // show from the right if folder would overflow right
    // FIXME: instead of 200 get the folder width
    if (parentPos.left + 200 > window.innerWidth) {
      // FIXME:
      // root.style.right = parentPos.right + 'px';
      root.style.right = '0px';
    } else {
      root.style.left = parentPos.left + 'px';
    }
  }

  if (!children.length) {
    append((emptyPopupView ??= h`<div class=empty>(empty)</div>`), root);
  } else {
    children.forEach((item) => {
      append(BookmarkNode(item), root);
    });
  }

  return root;
}

type FolderComponent = HTMLDivElement & {
  closePopup(this: void): void;
};

export interface FolderProps
  extends Omit<chrome.bookmarks.BookmarkTreeNode, 'id'> {
  children?: chrome.bookmarks.BookmarkTreeNode[];
  end?: boolean;
  level?: number;
}

const folderView = create('div');
folderView.className = 'f';

export function Folder(item: FolderProps): FolderComponent {
  const root = folderView.cloneNode(true) as FolderComponent;
  let popup: FolderPopupComponent | null;
  let timer: NodeJS.Timeout;

  const clearTimer = () => clearTimeout(timer);

  const resetTimer = () => {
    clearTimer();
    timer = setTimeout(root.closePopup, CLOSE_DELAY_MS);
  };

  if (item.end) root.className += ' end';
  root.textContent = item.title;

  root.closePopup = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
  };

  root.onmouseenter = () => {
    clearTimer();

    if (!popup) {
      const parent = root.parentNode as Element;

      // immediately close any folder popups on the parent level
      parent
        .querySelectorAll<FolderComponent>('.f')
        .forEach((folder) => folder.closePopup());

      popup = FolderPopup(root, item.children!, parent.id === 'b');

      popup.onmouseenter = clearTimer;
      popup.onmouseleave = resetTimer;

      append(popup, root);
    }
  };

  root.onmouseleave = resetTimer;

  return root;
}

export function BookmarkNode(
  item: FolderProps | LinkProps,
): FolderComponent | LinkComponent {
  // @ts-expect-error - FIXME:!
  return (item.children ? Folder : Link)(item);
}
