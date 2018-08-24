chrome.storage.sync.get(['t'], (settings) => {
  // load alternate theme
  if (settings.t) {
    document.body.className = settings.t;
  }
});
