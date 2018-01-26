// to import marko components
declare module '*.marko' {
  // marko doesn't have any availiable types yet
  const Marko: any;
  export default Marko;
}

// defined the fields we need to access
declare module '*/package.json' {
  export let version: string;
  export let author: string;
}
declare module '*/manifest.json' {
  export let version: string;
}
