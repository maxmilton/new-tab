import type { UserStorageData } from './types';

// On install or any subsequent update load user's theme into localStorage
chrome.runtime.onInstalled.addListener(() => {
  void fetch('themes.json')
    .then((res) => res.json())
    .then((themesData: Record<string, string>) => {
      chrome.storage.local.get(null, (settings: UserStorageData) => {
        localStorage.t = themesData[settings.t || 'light'];
      });
    });
});
