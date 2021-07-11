/**
 * Empty background script
 *
 * @fileoverview This file is intentionally empty; it's used to force the
 * extension to remain in memory for faster perceived new-tab page load (at the
 * cost of memory use + periodic garbage collection even when the new-tab page
 * is closed).
 *
 * Chrome will show the last visual state of the page while initially loading,
 * similar to how native page reload works. It prevents a tiny flash of blank
 * content when the extension assets are loading on a cold start.
 */

export {};
