/**
 * Theme Loader
 */

import type { ThemesData } from './types';
import { storage } from './utils';

performance.mark('Load Theme');

// Use theme that was preloaded in sw.js
const sheet = new CSSStyleSheet();
sheet.replaceSync(storage.t!);
document.adoptedStyleSheets = [sheet];

performance.measure('Load Theme', 'Load Theme');

if (process.env.NODE_ENV === 'development') {
  requestIdleCallback(() => {
    void fetch('themes.json')
      .then((res) => res.json())
      .then((themes: ThemesData) => {
        const theme = themes[storage.tn ?? 'auto'];
        if (storage.t !== theme) {
          sheet.replaceSync(theme);
          void chrome.storage.local.set({ t: theme });
        }
      });
  });
}
