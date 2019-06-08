// TODO: Use native Svelte component types once they're available
interface ComponentOptions {
  props?: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  target?: Element;
}

declare module '*.svelte' {
  import { SvelteComponentDev } from 'svelte/internal';

  class Component extends SvelteComponentDev {
    public constructor(options?: ComponentOptions);
  }

  export = Component;
}
