// FIXME: Submit a PR to stage0 to fix hElement extends from Node because it can
// return a Text as well as HTMLElement
//  ↳ Also include hElement > HNode + allow different base extends type
//  ↳ Also include ability to pass through HNode type as h<T> -- ACTUALLY no,
//    it's not so important since <node>.cloneNode() doesn't pass through the
//    node type :'(
//  ↳ Also include RefObj item as Node fix
declare module 'stage0' {
  declare class Ref {
    idx: number;

    ref: string | number;
    constructor(idx: number, ref: string | number);
  }
  interface RefObj<T extends Node> {
    [key: string]: T;
  }
  export interface HNode<T extends Node = Node> extends T {
    _refPaths?: Ref[];
    collect(node: Node): RefObj;
  }
  export function compile(node: Node): void;
  // export default function h<T extends Node>(
  //   strings: TemplateStringsArray,
  //   ...args: any[]
  // ): HNode<T>;
  export default function h(
    strings: TemplateStringsArray,
    ...args: any[]
  ): HNode;
}

// FIXME: Submit a PR to stage0 to fix named export + change "name" to "type"
// to be consistent with lib.dom.d.ts naming
declare module 'stage0/syntheticEvents' {
  export function setupSyntheticEvent(type: string): void;
}

// FIXME: Submit a PR to stage0 to fix createFn and noOp type flow through
//  ↳ Also submit with same change to `reconcile.d.ts` and `keyed.d.ts`
declare module 'stage0/reuseNodes' {
  export default function reuseNodes<T, N extends Node>(
    parent: HTMLElement,
    renderedValues: any[],
    data: any[],
    createFn: (...args: T) => N,
    noOp?: (node: N, ...args: T) => void,
    beforeNode?: Node,
    afterNode?: Node,
  ): void;
}
