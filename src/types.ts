import type { DEFAULT_SECTION_ORDER } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click?(event: MouseEvent): void;
  }
}

export type SectionOrderItem = (typeof DEFAULT_SECTION_ORDER)[number];

export interface UserStorageData {
  /** Theme data; raw CSS code. */
  t?: string;
  /** The user's selected theme name. */
  tn?: string;
  /** User sections order preference. */
  o?: SectionOrderItem[];
}

/** JSON object with theme name keys and raw CSS code values. */
export type ThemesData = Record<string, string>;
