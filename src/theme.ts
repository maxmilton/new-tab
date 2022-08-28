/**
 * Theme Loader
 */

import type { UserStorageData } from './types';

performance.mark('Load Theme');

chrome.storage.local.get('t', (settings: UserStorageData) => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(settings.t!);
  document.adoptedStyleSheets = [sheet];

  performance.measure('Load Theme', 'Load Theme');
});
