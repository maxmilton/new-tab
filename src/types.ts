import type { DEFAULT_SECTION_ORDER } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    __click?(event: MouseEvent): void | boolean | Promise<void>;
  }
}

export type SectionOrderItem = (typeof DEFAULT_SECTION_ORDER)[number];

export interface UserStorageData {
  /** Theme data; raw CSS code. */
  t?: string;
  /** The user's selected theme name. */
  tn?: string;
  /** Hide bookmarks bar user preference; `true` means hidden. */
  b?: boolean;
  /** Sections order user preference. */
  o?: SectionOrderItem[];
}

/** JSON object with theme name keys and raw CSS code values. */
export type ThemesData = Record<string, string>;
