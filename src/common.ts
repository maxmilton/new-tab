/** @type {Array<string>} */
export const DEFAULT_ORDER = ['Open Tabs', 'Bookmarks', 'History', 'Top Sites'];

/**
 * Delay running a function until X ms have passed since its last call.
 *
 * @see https://github.com/developit/decko/blob/master/src/decko.js
 */
export function debounce(fn: Function, delay = 260): Function {
  /* eslint-disable @typescript-eslint/no-explicit-any, func-names */
  let args: any;
  let context: any;
  let timer: NodeJS.Timeout | null;

  /* prettier-ignore */
  return function (...params: any[]) {
    args = params;
    // @ts-ignore
    context = this;

    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        // eslint-disable-next-line no-multi-assign
        args = context = timer = null;
      }, delay);
    }
  };
  /* eslint-enable */
}

/**
 * Handle link click to get around restriction for internal Chrome links
 * in an extension.
 */
export function handleLinkClick(event: MouseEvent): void {
  const { target, ctrlKey } = event;
  const url = (target as HTMLAnchorElement).href;

  // only apply special handling to non-http links
  if (url && url.charAt(0) !== 'h') {
    event.preventDefault();

    if ((target as HTMLAnchorElement).target === '_blank' || ctrlKey) {
      // open the location in a new tab
      chrome.tabs.create({ url });
    } else {
      // update the location in the current tab
      chrome.tabs.update({ url });
    }
  } else if ((target as HTMLAnchorElement).id === 'o') {
    // handle open settings from Menu.html component
    chrome.runtime.openOptionsPage();
  }
}
