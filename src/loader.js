chrome.storage.sync.get(null, (settings) => {
  // load alternate theme
  if (settings.t) {
    document.body.className = settings.t;
  }
});
