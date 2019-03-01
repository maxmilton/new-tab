declare module '*.svelte' {
  interface IComponentOptions {
    data?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
    target?: Element;
  }
  class Component {
    public constructor(options?: IComponentOptions);
  }
  export = Component;
}
