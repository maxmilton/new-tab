/**
 * Theme Loader
 */

import { storage } from './utils';

performance.mark('Load Theme');

// Get theme that was preloaded in sw.js
const sheet = new CSSStyleSheet();
sheet.replaceSync(storage.t!);
document.adoptedStyleSheets = [sheet];

performance.measure('Load Theme', 'Load Theme');
