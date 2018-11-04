/** @type {Array<string>} */
export const DEFAULT_ORDER = [
  'Open Tabs',
  'Bookmarks',
  'History',
  'Top Sites',
];

/**
 * Delay running a function until X ms have passed since its last call.
 * @see https://github.com/developit/decko/blob/master/src/decko.js
 * @param {Function} fn The function to debounce.
 * @param {number=} delay How long to wait for more function calls before executing
 * the function in milliseconds.
 * @returns {Function}
 */
export function debounce(fn, delay = 260) {
  let args;
  let context;
  let timer;

  return function (...params) { // eslint-disable-line func-names
    args = params;
    context = this;

    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        args = context = timer = null; // eslint-disable-line no-multi-assign
      }, delay);
    }
  };
}

/**
 * Handle link click to get around restriction for internal Chrome links
 * in an extension.
 * @param {MouseEvent} event the click event
 */
export function handleLinkClick(event) {
  const { target, ctrlKey } = event;
  const url = target.href;

  // only apply special handling to non-http links
  if (url && url.charAt(0) !== 'h') {
    event.preventDefault();

    if (target.target === '_blank' || ctrlKey) {
      // open the location in a new tab
      chrome.tabs.create({ url });
    } else {
      // update the location in the current tab
      chrome.tabs.update({ url });
    }
  }
}

/**
 * Shorten a string to a specified length.
 * @param {string} text Text to shorten.
 * @param {number} max Maximum length of text.
 * @returns {string} The shortened text.
 */
export function shorten(text, max) {
  if (max === undefined) {
    return text;
  }

  return text.length > max
    ? `${text.slice(0, max)}…`
    : text;
}
