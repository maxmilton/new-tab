declare module '*.svelte' {
  interface IComponentOptions {
    data?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
    target?: Element;
  }
  class Component {
    constructor(options?: IComponentOptions);
  }
  export = Component;
}
