// window vars for error tracking
declare interface Window {
  q: Array<ErrorEvent>;
  p: (event: ErrorEvent | PromiseRejectionEvent) => void;
}

// fields we need to access
declare module '*/package.json' {
  export let version: string;
  export let homepage: string;
}
