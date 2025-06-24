// TODO: Rewrite the folder logic using the new anchor positioning API and/or popover APIs; https://developer.chrome.com/blog/anchor-positioning-api and https://web.dev/blog/popover-api

import { append, clone, create, h } from 'stage1/fast';
import { chromeBookmarks } from '../utils.ts';
import { Link, type LinkComponent, type LinkProps } from './Link.ts';

export type BookmarkTreeNode = Omit<
  chrome.bookmarks.BookmarkTreeNode,
  'syncing'
>;

type FolderPopupComponent = HTMLDivElement & {
  $$adjustPosition(): void;
};

const CLOSE_DELAY_MS = 600;
let emptyPopup: HTMLDivElement | undefined;
let arrow: SVGElement | undefined;

const folderPopupView = create('div') as FolderPopupComponent;
folderPopupView.className = 'sf';

const FolderPopup = (
  parent: HTMLElement,
  children: BookmarkTreeNode[],
  nested?: boolean,
): FolderPopupComponent => {
  const root = clone(folderPopupView);
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
    append((emptyPopup ??= h<HTMLDivElement>('<div id=e>(empty)</div>')), root);
  }

  // Only after the component is mounted in the DOM do we have element size
  // information so final position adjustment is split into a separate step
  root.$$adjustPosition = () => {
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
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  $$closePopup(this: void): void;
};

const folderView = create('div') as FolderComponent;
folderView.className = 'f';

export const Folder = (
  props: BookmarkTreeNode,
  nested?: boolean,
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

  if (nested) {
    append(
      clone(
        (arrow ??= h<SVGElement>(
          // TODO: Add comment with SVG source attribution link
          '<svg class=i><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        )),
      ),
      root,
    );
  }

  root.$$closePopup = () => {
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
        .forEach((folder) => folder.$$closePopup());

      popup = FolderPopup(
        root,
        children ?? (await chromeBookmarks.getChildren(props.id)),
        nested,
      );

      popup.__mouseover = clearTimer;
      popup.__mouseout = resetTimer;

      append(popup, root);
      popup.$$adjustPosition();
    }
  };

  root.__mouseout = resetTimer;

  return root;
};

// eslint-disable-next-line no-confusing-arrow
export const BookmarkNode = <T extends LinkProps | BookmarkTreeNode>(
  props: T,
  nested?: boolean,
): T extends { url: string } ? LinkComponent : FolderComponent =>
  // @ts-expect-error - FIXME: Handle type narrowing correctly
  props.url ? Link(props) : Folder(props, nested);
