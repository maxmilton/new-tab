import type { UserStorageData } from './types';

export const storage: UserStorageData = await chrome.storage.local.get();

// NOTE: When updating also update references that get an item by index
export const DEFAULT_SECTION_ORDER = [
  'Open Tabs',
  'Bookmarks',
  'History',
  'Top Sites',
  'Recently Closed Tabs',
] as const;

export const handleClick = (event: MouseEvent): void => {
  const { target, ctrlKey } = event;
  const url = (target as HTMLAnchorElement).href;

  // Only apply special handling to non-http links
  if (url && !url.startsWith('h')) {
    event.preventDefault();

    if ((target as HTMLAnchorElement).target === '_blank' || ctrlKey) {
      // Open the location in a new tab
      void chrome.tabs.create({ url });
    } else {
      // Update the location in the current tab
      void chrome.tabs.update({ url });
    }
  }
};
