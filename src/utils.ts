import { ONCLICK } from 'stage1/fast';
import type { UserStorageData } from './types.ts';

export const chromeBookmarks = chrome.bookmarks;
export const chromeTabs = chrome.tabs;

performance.mark('Load Storage');
export const storage = await chrome.storage.local.get<UserStorageData>();

// NOTE: When updating also update references that lookup items by index
export const DEFAULT_SECTION_ORDER = [
  'Open Tabs',
  'Bookmarks',
  'History',
  'Top Sites',
  'Recently Closed Tabs',
] as const;

/** Search input element with id=s defined in `src/components/Search.ts`. */
declare const s: HTMLInputElement;

// Simplified synthetic click event implementation from stage1, plus special
// handling for browser internal links (e.g. chrome://)
// @see https://github.com/maxmilton/stage1/blob/master/src/events.ts
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type, consistent-return
export const handleClick = (event: MouseEvent): false | void => {
  let node = event.target as
    | (Node & { [ONCLICK]?(event: Event): false | undefined })
    | null;
  const url = (node as Node & { href?: string }).href;

  while (node) {
    if (node[ONCLICK]) {
      return node[ONCLICK](event);
    }
    node = node.parentNode;
  }

  // Only apply special handling to non-http links
  if (url && url[0] !== 'h') {
    if (event.ctrlKey) {
      // Open the location in a new tab
      void chromeTabs.create({ url });
    } else {
      // Update the location in the current tab
      void chromeTabs.update({ url });
    }

    // Prevent default behaviour; shorter than `event.preventDefault()`
    return false;
  }

  s.focus();
};
