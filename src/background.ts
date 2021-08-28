export {};

// When a user installs the extension for the first time open the settings UI
// which will load theme styles into localStorage
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});
