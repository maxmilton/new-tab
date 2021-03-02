export const DEFAULT_ORDER = ['Open Tabs', 'Bookmarks', 'History', 'Top Sites'];

export function handleClick(event: MouseEvent): void {
  const { target, ctrlKey } = event;
  const url = (target as HTMLAnchorElement).href;

  // only apply special handling to non-http links
  if (url && !url.startsWith('h')) {
    event.preventDefault();

    if ((target as HTMLAnchorElement).target === '_blank' || ctrlKey) {
      // open the location in a new tab
      chrome.tabs.create({ url });
    } else {
      // update the location in the current tab
      chrome.tabs.update({ url });
    }
  }
}

const DEFAULT_DEBOUNCE_DELAY_MS = 260;

/**
 * Delay running a function until X ms have passed since its last call.
 */
export function debounce<T extends Function>(
  fn: T,
  delay = DEFAULT_DEBOUNCE_DELAY_MS,
): T {
  let timer: NodeJS.Timeout;

  // @ts-expect-error
  return function (...args) {
    const context = this;

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
