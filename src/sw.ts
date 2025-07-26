/// <reference lib="webworker" />

import type { SyncStorageData, ThemesData, UserStorageData } from "./types.ts";

// declare const self: WorkerGlobalScope & typeof globalThis;

// On install or subsequent update, preload the user's chosen theme into storage
// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.runtime.onInstalled.addListener(async () => {
  // TODO: Remove once most users have updated.
  // Migrate users to new storage schema (tn -> n) (v0.24.0)
  const oldSettings = await chrome.storage.local.get<{ tn?: string }>("tn");
  if (oldSettings.tn) {
    await chrome.storage.local.set({ n: oldSettings.tn });
    await chrome.storage.local.remove("tn");
  }

  const [themes, settings] = await Promise.all([
    fetch("themes.json").then((res) => res.json() as Promise<ThemesData>),
    chrome.storage.local.get<UserStorageData>("n"),
  ]);

  // TODO: Remove once most users have updated.
  // Migrate users on old rich-dark theme (removed in v0.23.0)
  if (settings.n === "rich-dark") {
    await chrome.storage.local.set({
      n: (settings.n = "dark"),
    });
  }

  // Preload theme and default settings
  void chrome.storage.local.set({
    t: themes[settings.n ?? "auto"],
  });

  // TODO: Open settings page on install?
  // if (details.reason === ('install' as chrome.runtime.OnInstalledReason.INSTALL)) {
  //   void chrome.tabs.create({
  //     url: chrome.runtime.getURL('settings.html'),
  //   });
  // }
});

/* ********************************** */
// Experimental sync settings feature //
/* ********************************** */

// On profile startup, pull remote user settings; local <- sync
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get<UserStorageData>(["s", "n"], (settings) => {
    // Only when sync is enabled
    if (!settings.s) return;

    chrome.storage.sync.get<SyncStorageData>((remote) => {
      if (remote.data) {
        if (remote.data.n === settings.n) {
          void chrome.storage.local.set(remote.data);
        } else {
          void fetch("themes.json")
            .then((res) => res.json() as Promise<ThemesData>)
            .then((themes) => {
              void chrome.storage.local.set({
                t: themes[settings.n ?? "auto"],
                ...remote.data,
              });
            });
        }
      }
    });
  });
});
