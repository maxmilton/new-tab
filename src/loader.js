chrome.storage.sync.get(['e', 't'], (settings) => {
  // load alternate theme
  if (settings.t !== 'd') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${settings.t}.css`;
    document.head.appendChild(link);
  }

  // load error tracking unless opt-out
  if (!settings.e) {
    import('/e.js');
  }
});
