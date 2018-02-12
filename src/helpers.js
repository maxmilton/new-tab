/**
 * Open the location in a new tab.
 * @param {string} url The new URL.
 */
function __openNewTab(url) {
  chrome.tabs.create({ url });
}

/**
 * Update the location in the current tab.
 * @param {string} url The new URL.
 */
function __updateTabLocation(url) {
  chrome.tabs.update({ url });
}

/**
 * Handle menu item click.
 * Special case for internal links in an extention.
 * @param {MouseEvent} event the click event
 */
function cL(event) {
  const { target, ctrlKey } = event;
  const url = target.href;

  if (url.charAt(0) !== 'h') {
    if (target.target === '_blank' || ctrlKey) {
      __openNewTab(url);
    } else {
      __updateTabLocation(url);
    }

    event.preventDefault();
  }
}

module.exports = {
  cL,
};
