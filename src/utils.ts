import type { UserStorageData } from './types';

export const storage: UserStorageData = await chrome.storage.local.get();

// NOTE: When updating also update references that lookup items by index
export const DEFAULT_SECTION_ORDER = [
  'Open Tabs',
  'Bookmarks',
  'History',
  'Top Sites',
  'Recently Closed Tabs',
] as const;

// Simplified synthetic click event implementation of setupSyntheticEvent() from
// stage1, plus special handling for browser internal links (e.g. chrome://)
// https://github.com/maxmilton/stage1/blob/master/src/events.ts
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type, consistent-return
export const handleClick = (event: MouseEvent): void | false => {
  let node = event.target as
    | (Node & { __click?(event: MouseEvent): void })
    | null;
  // const link = node as HTMLAnchorElement;
  // const url = link.href;
  const url = (node as Node & { href?: string }).href;

  while (node) {
    if (node.__click) {
      return node.__click(event);
    }
    node = node.parentNode;
  }

  // Only apply special handling to non-http links
  if (url?.[0] !== 'h') {
    // if (link.target === '_blank' || event.ctrlKey) {
    if (event.ctrlKey) {
      // Open the location in a new tab
      void chrome.tabs.create({ url });
    } else {
      // Update the location in the current tab
      void chrome.tabs.update({ url });
    }

    // Prevent default behaviour; shorter than `event.preventDefault()`
    return false;
  }
};
