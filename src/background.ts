import type { UserStorageData } from './types';

// On first install or subsequent updates load user's theme into localStorage
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    void fetch('themes.json')
      .then((res) => res.json())
      .then((themesData: Record<string, string>) => {
        chrome.storage.local.get(null, (settings: UserStorageData) => {
          localStorage.t = themesData[settings.t || 'light'];
        });
      });
  }
});
