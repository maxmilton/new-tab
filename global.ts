// TODO: Use native Svelte component types once they're available
// @ts-ignore - It's OK for this to not be a module (`--isolatedModules`)
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
