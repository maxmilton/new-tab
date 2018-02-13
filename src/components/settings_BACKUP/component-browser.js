module.exports = {
  onCreate() {
    this.theme = 'd';
    this.trackErrors = true;

    // check for existing settings
    chrome.storage.sync.get(['t', 'e'], (settings) => {
      // theme - fall back to default d (dark)
      this.theme = settings.t || 'd';

      // error tracking opt-out
      this.trackErrors = !settings.e;
    });
  },

  setTheme() {
    chrome.storage.sync.set({ t: this.state.theme });
  },

  setOptOut() {
    chrome.storage.sync.set({ e: !this.state.trackErrors });
  },
};
