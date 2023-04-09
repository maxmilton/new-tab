import type { DEFAULT_SECTION_ORDER } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click?(event: MouseEvent): void;
  }
}

export interface UserStorageData {
  /** Theme data; raw CSS code. */
  t?: string;
  /** The user's selected theme name. */
  tn?: string;
  /** User sections order preference. */
  o?: typeof DEFAULT_SECTION_ORDER;
}

/** JSON object with theme name keys and raw CSS code values. */
export type ThemesData = Record<string, string>;
