/**
 * Theme Loader
 */

import type { UserStorageData } from './types';

performance.mark('Load Theme');

// Get theme that was preloaded in sw.js
chrome.storage.local.get('t', (settings: UserStorageData) => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(settings.t!);
  document.adoptedStyleSheets = [sheet];

  performance.measure('Load Theme', 'Load Theme');
});
