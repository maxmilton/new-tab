/// <reference lib="webworker" />

import type { ThemesData, UserStorageData } from './types';

// On install or subsequent update, preload the user's chosen theme into storage
// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.runtime.onInstalled.addListener(async () => {
  const [themes, settings] = await Promise.all([
    fetch('themes.json').then((res) => res.json() as Promise<ThemesData>),
    chrome.storage.local.get<UserStorageData>(),
  ]);

  // TODO: Remove once most users have updated.
  // Migrate users on old rich-dark theme (removed in v0.23.0)
  if (settings.tn === 'rich-dark') {
    await chrome.storage.local.set({
      tn: (settings.tn = 'dark'),
    });
  }

  // Preload theme and default settings
  void chrome.storage.local.set({
    t: themes[settings.tn ?? 'auto'],
  });

  // Include backup setting during installation or update
  if (settings.backup) {
    void chrome.storage.local.set({
      backup: settings.backup,
    });
  }

  // TODO: Open settings page on install?
  // if (details.reason === ('install' as chrome.runtime.OnInstalledReason.INSTALL)) {
  //   void chrome.tabs.create({
  //     url: chrome.runtime.getURL('settings.html'),
  //   });
  // }
});
