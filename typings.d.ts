/* eslint-disable @typescript-eslint/interface-name-prefix, @typescript-eslint/indent */

declare module '*.svelte' {
  interface IComponentOptions {
    props?: {
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

interface OffscreenCanvasRenderingContext2D
  extends CanvasState,
    CanvasTransform,
    CanvasCompositing,
    CanvasImageSmoothing,
    CanvasFillStrokeStyles,
    CanvasShadowStyles,
    CanvasFilters,
    CanvasRect,
    CanvasDrawPath,
    CanvasUserInterface,
    CanvasText,
    CanvasDrawImage,
    CanvasImageData,
    CanvasPathDrawingStyles,
    CanvasTextDrawingStyles,
    CanvasPath {
  readonly canvas: OffscreenCanvas;
}

declare var OffscreenCanvasRenderingContext2D: {
  prototype: OffscreenCanvasRenderingContext2D;
  new (): OffscreenCanvasRenderingContext2D;
};

interface OffscreenCanvas extends EventTarget {
  width: number;
  height: number;
  getContext(
    contextId: '2d',
    contextAttributes?: CanvasRenderingContext2DSettings,
  ): OffscreenCanvasRenderingContext2D | null;
}

declare var OffscreenCanvas: {
  prototype: OffscreenCanvas;
  new (width: number, height: number): OffscreenCanvas;
};
