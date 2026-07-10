import type { ONCLICK } from "stage1/fast";

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // oxlint-disable-next-line typescript/no-invalid-void-type
    [ONCLICK]?: (event: Event) => false | void | Promise<void>;
  }
}
