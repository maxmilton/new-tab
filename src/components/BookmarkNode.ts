/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { h } from 'stage1';
import { append, create } from '../utils';
import { Link, LinkComponent, LinkProps } from './Link';

type FolderPopupComponent = HTMLDivElement & {
  adjustPosition(): void;
};

const CLOSE_DELAY_MS = 600;
let emptyPopupView;
let arrowView;

const folderPopupView = create('div');
folderPopupView.className = 'sf';

function FolderPopup(
  parent: Element,
  children: chrome.bookmarks.BookmarkTreeNode[],
  topLevel: boolean,
): FolderPopupComponent {
  const root = folderPopupView.cloneNode(true) as FolderPopupComponent;
  const parentRect = parent.getBoundingClientRect();
  let top: number;
  let left: number;

  if (topLevel) {
    // Show top level folder popup bellow its parent
    top = parentRect.bottom;
    left = parentRect.left;
  } else {
    // Show nested folder popup beside its parent
    top = parentRect.top;
    left = parentRect.right;
  }

  root.style.cssText = `top:${top}px;left:${left}px;max-height:${
    window.innerHeight - top
  }px`;

  if (!children.length) {
    append((emptyPopupView ??= h`<div id=e>(empty)</div>`), root);
  } else {
    children.forEach((item) => {
      append(BookmarkNode(item), root);
    });
  }

  // Only after the component is mounted in the DOM do we have element size
  // information so final position adjustment is split into a separate step
  root.adjustPosition = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const width = root.offsetWidth;

    if (left + width > viewportWidth) {
      // Show top level aligned to the right edge of the viewport
      // Show nested show to the left of its parent
      root.style.left = topLevel
        ? viewportWidth - width + 'px'
        : parentRect.left - width + 'px';
    }
  };

  return root;
}

type FolderComponent = HTMLDivElement & {
  closePopup(this: void): void;
};

export interface FolderProps
  extends Omit<chrome.bookmarks.BookmarkTreeNode, 'id'> {
  end?: boolean;
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

  root.textContent = item.title;

  if (item.end) root.className += ' end';

  // parentId 0 = "other bookmarks", 1 = bookmarks bar
  if (+item.parentId! > 1) {
    append(
      (arrowView ??= h`
        <svg class=i>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      `).cloneNode(true),
      root,
    );
  }

  // TODO: Figure out how to make esbuild minify this name
  root.closePopup = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
  };

  root.__mouseover = () => {
    clearTimer();

    if (!popup) {
      const parent = root.parentNode as Element;

      // Immediately close any folder popups on the parent level
      parent
        .querySelectorAll<FolderComponent>('.f')
        .forEach((folder) => folder.closePopup());

      popup = FolderPopup(
        root,
        item.children!,
        // BookmarkBar (bookmarks top level) has attribute id="b"
        parent.id === 'b',
      );

      popup.__mouseover = clearTimer;
      popup.__mouseout = resetTimer;

      append(popup, root);
      popup.adjustPosition();
    }
  };

  root.__mouseout = resetTimer;

  return root;
}

export function BookmarkNode(
  item: FolderProps | LinkProps,
): FolderComponent | LinkComponent {
  // @ts-expect-error - FIXME:!
  return (item.children ? Folder : Link)(item);
}
