chrome.storage.sync.get(['e', 't'], (settings) => {
  // load alternate theme
  if (settings.t !== 'd') {
    document.body.classList.add(settings.t);
  }

  // load error tracking unless opt-out
  if (!settings.e) {
    import('/e.js');
  }
});
