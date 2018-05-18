'use strict'; // eslint-disable-line

// initialise or update default settings and save to user account
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.storage.sync.get(null, (settings) => {
      const newSettings = {};

      // theme default
      if (settings.t === undefined) {
        newSettings.t = 'd'; // dark theme
      }

      // error detection default
      if (!settings.e === undefined) {
        newSettings.e = false; // not opt-out
      }

      chrome.storage.sync.set(newSettings);
    });
  }
});
