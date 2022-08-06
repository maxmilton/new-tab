import type { ThemesData, UserStorageData } from './types';

// On install or any subsequent update, preload the user's theme into storage
// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.runtime.onInstalled.addListener(async () => {
  const themes = fetch('themes.json').then((res) => res.json()) as Promise<ThemesData>;
  const settings = chrome.storage.local.get(null) as Promise<UserStorageData>;
  void chrome.storage.local.set({
    t: (await themes)[(await settings).tn || 'light'],
  });
});
