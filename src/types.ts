import type { SECTION_DEFAULT_ORDER } from './utils';

export interface UserStorageData {
  /** User sections order preference. */
  o?: typeof SECTION_DEFAULT_ORDER;
  /** User theme choice. */
  t?: string;
}
