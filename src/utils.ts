// NOTE: When updating also update references that get an item by index
export const SECTION_DEFAULT_ORDER = [
  'Open Tabs',
  'Bookmarks',
  'History',
  'Top Sites',
  'Recently Closed Tabs',
];

export const handleClick = (event: MouseEvent): void => {
  const { target, ctrlKey } = event;
  const url = (target as HTMLAnchorElement).href;

  // only apply special handling to non-http links
  if (url && !url.startsWith('h')) {
    event.preventDefault();

    if ((target as HTMLAnchorElement).target === '_blank' || ctrlKey) {
      // open the location in a new tab
      void chrome.tabs.create({ url });
    } else {
      // update the location in the current tab
      void chrome.tabs.update({ url });
    }
  }
};
