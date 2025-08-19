import { ONCLICK } from "stage1/fast";

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    [ONCLICK]?: (event: Event) => false | void | Promise<void>;
  }
}
