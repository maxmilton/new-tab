// when updating also update references that get an item by index
export const SECTION_DEFAULT_ORDER = [
  'Open Tabs',
  'Bookmarks',
  'History',
  'Top Sites',
  'Recently Closed Tabs',
];

// DOM
export const createFragment = (): DocumentFragment => new DocumentFragment();
export const create = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] => document.createElement(tagName);
export const append = <T extends Node>(node: T, parent: Node): T => parent.appendChild(node);

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
