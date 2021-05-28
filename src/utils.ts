// DOM
export const create = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] => document.createElement(tagName);
export const append = <T extends Node>(node: T, parent: Node): T => parent.appendChild(node);

export const DEFAULT_ORDER = ['Open Tabs', 'Bookmarks', 'History', 'Top Sites'];

export function handleClick(event: MouseEvent): void {
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
}

const DEFAULT_DEBOUNCE_DELAY_MS = 260;

/**
 * Delay running a function until X ms have passed since its last call.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = DEFAULT_DEBOUNCE_DELAY_MS): T {
  let timer: NodeJS.Timeout;

  // @ts-expect-error - Transparent wraper will not change input function type
  return function (this: any, ...args) {
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unsafe-assignment
    const context = this;

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
