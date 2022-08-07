/**
 * Theme Loader
 */

import type { UserStorageData } from './types';

performance.mark('Load Theme');

chrome.storage.local.get('t', (settings: UserStorageData) => {
  const sheet = new CSSStyleSheet();
  // @ts-expect-error - replaceSync method will be added in TypeScript v4.8
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  sheet.replaceSync(settings.t!);
  // @ts-expect-error - adoptedStyleSheets method will be added in TypeScript v4.8
  document.adoptedStyleSheets = [sheet];

  performance.measure('Load Theme', 'Load Theme');
});
