// FIXME: This file doesn't get included in coverage reports even with `c8 --include=test/utils.ts`
//  ↳ https://github.com/bcoe/c8/issues/250

import { JSDOM } from 'jsdom';

// increase limit from 10
global.Error.stackTraceLimit = 100;

const mountedContainers = new Set<HTMLDivElement>();

// export function sleep(ms: number): Promise<void> {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

function mockInnerText() {
  Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
    get(this: HTMLElement) {
      const el = this.cloneNode(true) as HTMLElement;
      el.querySelectorAll('script,style').forEach((s) => s.remove());
      return el.textContent;
    },
    set(value: string) {
      (this as HTMLElement).textContent = value;
    },
  });
}

export function setup(): void {
  if (global.window) {
    throw new Error(
      'JSDOM globals already exist, did you forget to run teardown()?',
    );
  }

  const dom = new JSDOM('<!DOCTYPE html>', {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'http://localhost/',
  });

  global.window = dom.window.document.defaultView!;
  global.document = global.window.document;

  // JSDOM doesn't support innerText yet -- https://github.com/jsdom/jsdom/issues/1245
  mockInnerText();
}

export function teardown(): void {
  if (!global.window) {
    throw new Error('No JSDOM globals exist, did you forget to run setup()?');
  }

  // https://github.com/jsdom/jsdom#closing-down-a-jsdom
  global.window.close();
  // @ts-expect-error - cleaning up
  // eslint-disable-next-line no-multi-assign
  global.window = global.document = undefined;
}

export interface RenderResult {
  /** A wrapper DIV which contains your mounted component. */
  container: HTMLDivElement;
  /**
   * A helper to print the HTML structure of the mounted container. The HTML is
   * prettified and may not accurately represent your actual HTML. It's intended
   * for debugging tests only and should not be used in any assertions.
   */
  debug(): void;
}

export function render(component: Node): RenderResult {
  const container = document.createElement('div');

  container.appendChild(component);
  document.body.appendChild(container);

  mountedContainers.add(container);

  return {
    container,
    debug() {
      // TODO: Prettify HTML
      console.log('DEBUG:');
      console.log(container.innerHTML);
    },
  };
}

export function cleanup(): void {
  mountedContainers.forEach((container) => {
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  });
}

/* eslint-disable @typescript-eslint/ban-types */
type DeepPartial<T> = T extends Function
  ? T
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;
/* eslint-enable @typescript-eslint/ban-types */
type ChromeAPI = DeepPartial<typeof window.chrome>;

export function mocksSetup(): void {
  const mockChrome: ChromeAPI = {
    bookmarks: {
      getTree() {},
      search() {},
    },
    history: {
      search() {},
    },
    runtime: {
      openOptionsPage() {},
    },
    storage: {
      local: {
        // @ts-expect-error - FIXME:
        get: (_keys, callback) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          callback({});
        },
        set: (_items) => {},
      },
    },
    tabs: {
      create() {},
      getCurrent() {},
      onMoved: {
        addListener() {},
      },
      onRemoved: {
        addListener() {},
      },
      onUpdated: {
        addListener() {},
      },
      // @ts-expect-error - FIXME:
      query() {},
      remove() {},
      update() {},
    },
    topSites: {
      get: () => {},
    },
    windows: {
      getCurrent() {},
      update() {},
    },
  };

  // @ts-expect-error - just a partial mock
  global.chrome = mockChrome;
}

export function mocksTeardown(): void {
  // @ts-expect-error - cleaning up
  global.chrome = undefined;
}
