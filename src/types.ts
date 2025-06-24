import type { DEFAULT_SECTION_ORDER } from './utils.ts';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    __click?(event: MouseEvent): void | boolean | Promise<void>;
  }
}

/** JSON object with theme name keys and raw CSS code values. */
export type ThemesData = Record<string, string>;

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
  /** Settings sync enabled user preference. */
  s?: boolean;
}

export interface SyncStorageData {
  /** User settings data. */
  data?: Omit<UserStorageData, 't' | 's'>;
  /** Timestamp of the last sync.set operation. */
  ts?: number;
}
