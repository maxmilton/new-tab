// FIXME: This file doesn't get included in coverage reports even with `c8 --include=test/utils.ts`
//  ↳ https://github.com/bcoe/c8/issues/250

import { JSDOM } from 'jsdom';

// increase limit from 10
global.Error.stackTraceLimit = 100;

const mountedContainers = new Set<HTMLDivElement>();

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
   *
   * @param el - An element to inspect. Default is the mounted container.
   */
  debug(el?: Element): void;
  unmount(): void;
}

export function render(component: Node): RenderResult {
  const container = document.createElement('div');

  container.appendChild(component);
  document.body.appendChild(container);

  mountedContainers.add(container);

  return {
    container,
    debug(el = container) {
      // eslint-disable-next-line no-console
      console.log('DEBUG:\n', el.innerHTML);
    },
    unmount() {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      container.removeChild(component);
    },
  };
}

export function cleanup(): void {
  if (!mountedContainers || mountedContainers.size === 0) {
    throw new Error(
      'No mounted components exist, did you forget to call render()?',
    );
  }

  mountedContainers.forEach((container) => {
    if (container.parentNode === document.body) {
      container.remove();
    }

    mountedContainers.delete(container);
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

type MockFn<T> = T & {
  calledTimes(): number;
};

const noop = () => {};

// TODO: See if there's anything worthwhile in https://github.com/therealparmesh/snoop/blob/master/src/index.js
// @ts-expect-error - FIXME:!
// eslint-disable-next-line @typescript-eslint/ban-types
export function mockFn<T extends Function>(imlp: T = noop): MockFn<T> {
  let callCount = 0;

  // @ts-expect-error - FIXME:!
  const fn: MockFn<T> = new Proxy(imlp, {
    apply(target, thisArg, args) {
      callCount += 1;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.apply(target, thisArg, args);
    },
  });

  fn.calledTimes = () => callCount;

  return fn;
}

export function mocksSetup(): void {
  const mockChrome: ChromeAPI = {
    bookmarks: {
      // @ts-expect-error - FIXME:!
      getTree: noop,
      // @ts-expect-error - FIXME:!
      search: noop,
    },
    history: {
      // @ts-expect-error - FIXME:!
      search: noop,
    },
    runtime: {
      openOptionsPage: noop,
    },
    sessions: {
      getRecentlyClosed: noop,
    },
    storage: {
      local: {
        // @ts-expect-error - FIXME:!
        get: (_keys, callback) => {
          callback({});
        },
        // @ts-expect-error - FIXME:!
        set: noop,
      },
    },
    tabs: {
      // @ts-expect-error - FIXME:!
      create: noop,
      // @ts-expect-error - FIXME:!
      getCurrent: noop,
      onMoved: {
        addListener: noop,
      },
      onRemoved: {
        addListener: noop,
      },
      onUpdated: {
        addListener: noop,
      },
      // @ts-expect-error - FIXME:!
      query: noop,
      // @ts-expect-error - FIXME:!
      remove: noop,
      // @ts-expect-error - FIXME:!
      update: noop,
    },
    topSites: {
      get: noop,
    },
    windows: {
      // @ts-expect-error - FIXME:!
      getCurrent: noop,
      // @ts-expect-error - FIXME:!
      update: noop,
    },
  };

  // @ts-expect-error - just a partial mock
  global.chrome = mockChrome;

  global.DocumentFragment = window.DocumentFragment;
  global.localStorage = window.localStorage;

  // @ts-expect-error - just a simple mock
  global.fetch = () => Promise.resolve({
    json: () => Promise.resolve({}),
  });
}

export function mocksTeardown(): void {
  // @ts-expect-error - cleaning up
  // eslint-disable-next-line no-multi-assign
  global.chrome = global.DocumentFragment = global.localStorage = global.fetch = undefined;
}
