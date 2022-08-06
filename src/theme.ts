/**
 * Theme Loader
 */

import type { UserStorageData } from './types';

performance.mark('Load Theme');

void chrome.storage.local.get('t').then((settings: UserStorageData) => {
  const sheet = new CSSStyleSheet();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  sheet.replaceSync(settings.t!);
  document.adoptedStyleSheets = [sheet];

  performance.measure('Load Theme', 'Load Theme');
});
