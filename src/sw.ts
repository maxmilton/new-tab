/// <reference lib="webworker" />

import type { ThemesData, UserStorageData } from './types';

// On install or subsequent update, preload the user's chosen theme into storage
// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.runtime.onInstalled.addListener(async () => {
  const themes = fetch('themes.json').then(
    (res) => res.json() as Promise<ThemesData>,
  );
  const settings: Promise<UserStorageData> = chrome.storage.local.get();

  // TODO: Remove once most users have updated.
  // Migrate users on old rich-dark theme (removed in v0.23.0)
  if ((await settings).tn === 'rich-dark') {
    void chrome.storage.local.set({
      t: (await themes).dark,
      tn: 'dark',
    });
    return;
  }

  void chrome.storage.local.set({
    t: (await themes)[(await settings).tn ?? 'dark'],
  });
});
