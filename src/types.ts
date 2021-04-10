import type { DEFAULT_ORDER } from './utils';

export interface UserStorageData {
  /** User sections order preference. */
  o?: typeof DEFAULT_ORDER;
  /** User theme choice. */
  t?: string;
}
