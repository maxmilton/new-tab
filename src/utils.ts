import type { UserStorageData } from './types';

performance.mark('Load Storage');
export const storage: UserStorageData = await chrome.storage.local.get();
storage.backup = storage.backup ?? false;

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

// Simplified synthetic click event implementation of setupSyntheticEvent() from
// stage1, plus special handling for browser internal links (e.g. chrome://)
// https://github.com/maxmilton/stage1/blob/master/src/events.ts
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type, consistent-return
export const handleClick = (event: MouseEvent): false | void => {
  let node = event.target as
    | (Node & { __click?(event: MouseEvent): false | undefined })
    | null;
  const url = (node as Node & { href?: string }).href;

  while (node) {
    if (node.__click) {
      return node.__click(event);
    }
    node = node.parentNode;
  }

  if (url && url[0] !== 'h') {
    if (event.ctrlKey) {
      void chrome.tabs.create({ url });
    } else {
      void chrome.tabs.update({ url });
    }
    return false;
  }

  s.focus();

  if (storage.backup) {
    void chrome.storage.local.set(storage);
  }
};
