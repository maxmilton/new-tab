import type { DEFAULT_SECTION_ORDER } from './utils';

export interface UserStorageData {
  /** User theme preference. */
  t?: string;
  /** User sections order preference. */
  o?: typeof DEFAULT_SECTION_ORDER;
}

/** JSON object with theme name keys and CSS styles values. */
export type ThemesData = Record<string, string>;
