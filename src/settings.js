'use strict';

const elTheme = document.getElementById('theme');
const elOptOut = document.getElementById('opt-out');

// check existing settings
chrome.storage.sync.get(['t', 'e'], (settings) => {
  // theme - fall back to default d (dark)
  const theme = settings.t || 'd';
  elTheme.value = theme;

  // error tracking opt-out
  const isOptOut = settings.e;
  elOptOut.checked = !isOptOut;
});

// set up handlers for changes
elTheme.addEventListener('change', (event) => {
  const value = event.target.value;
  // FIXME: Reloading is buggy; it's a problem with Chrome not the extension
  // chrome.storage.sync.set({ t: value }, () => {
  //   // reload the extension for the theme to take effect
  //   chrome.runtime.reload();
  // });
  chrome.storage.sync.set({ t: value });
});
elOptOut.addEventListener('change', (event) => {
  const value = event.target.checked;
  chrome.storage.sync.set({ e: !value });
});
