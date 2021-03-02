// FIXME: Calculate if the folder will be outside the viewport and render in a better place

// FIXME: Hide subfolder imidiately if another is openned to prevent overlap

// FIXME: Continue to show subfolder when moving mouse back onto parent

// FIXME: max-height (for scroll) needs to be dynamic depending on where the folder opens from

import { Link, LinkProps } from './Link';

const CLOSE_DELAY_MS = 400;
let openFolders = 0;

interface SubFolderProps {
  children: chrome.bookmarks.BookmarkTreeNode[];
  level: number;
  parent: Node;
}

const subFolderView = document.createElement('div');
subFolderView.className = 'subfolder';

function SubFolder({ children, level, parent }: SubFolderProps, scope) {
  const root = subFolderView.cloneNode(true) as HTMLDivElement;

  const parentPos = parent.getBoundingClientRect();

  if (level > 0) {
    // nested subfolders show beside their parent
    root.style.top = parentPos.top + 'px';
    root.style.left = parentPos.right + 'px';
  } else {
    // top level subfolders show bellow their parent
    // root.style.top = parentPos.bottom + 'px';
    // root.style.left = parentPos.left + 'px';

    root.style.top = parentPos.bottom + 'px';

    // show from the right if folder would overflow right
    // FIXME: instead of 200 get the folder width
    if (parentPos.left + 200 > window.innerWidth) {
      // FIXME:
      // root.style.right = parentPos.right + 'px';
      root.style.right = '0px';
      console.log('@@ root', root);
    } else {
      root.style.left = parentPos.left + 'px';
    }
  }

  children.forEach((item) => {
    item.level = level + 1;
    root.appendChild(BookmarkNode(item));
  });

  root.onmouseenter = scope.clearTimer;
  root.onmouseleave = scope.resetTimer;

  return root;
}

interface FolderProps extends chrome.bookmarks.BookmarkTreeNode {
  children: chrome.bookmarks.BookmarkTreeNode[];
  end?: boolean;
  level?: number;
}

const folderView = document.createElement('div');
folderView.className = 'item';

function Folder(item: FolderProps) {
  const root = folderView.cloneNode(true) as HTMLDivElement;

  // TODO: Keep? Implement "Other Bookmarks"
  if (item.end) root.className = root.className + ' right';
  root.textContent = item.title;

  let subfolder: Element;
  let timer: NodeJS.Timeout;

  const scope = {
    clearTimer() {
      if (timer) clearTimeout(timer);
    },
    resetTimer() {
      scope.clearTimer();

      timer = setTimeout(() => {
        if (subfolder) {
          subfolder.remove();
          subfolder = null;

          if (!item.level || item.level === 0) {
            openFolders -= 1;
          }
        }
      }, CLOSE_DELAY_MS);
    },
  };

  root.onmouseenter = () => {
    scope.clearTimer();

    if (!subfolder) {
      subfolder = SubFolder(
        {
          children: item.children,
          level: item.level || 0,
          parent: root,
        },
        scope,
      );
      root.appendChild(subfolder);
    }
  };

  root.onmouseleave = scope.resetTimer;

  return root;
}

// FIXME: Shouldn't it be | and not & union?
export function BookmarkNode(item: FolderProps | LinkProps) {
  return (item.children ? Folder : Link)(item);
}
