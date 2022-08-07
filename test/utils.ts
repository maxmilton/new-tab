// FIXME: This file doesn't get included in coverage reports even with `c8 --include=test/utils.ts`
//  ↳ https://github.com/bcoe/c8/issues/250

import { JSDOM } from 'jsdom';

// increase limit from 10
global.Error.stackTraceLimit = 100;

const mountedContainers = new Set<HTMLDivElement>();

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
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

const noop = () => {};

export function mocksSetup(): void {
  // @ts-expect-error - partial mock
  global.chrome = {
    bookmarks: {
      getTree: noop,
      search: noop,
    },
    history: {
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
        get: (_keys, callback) => {
          if (callback) {
            callback({});
          } else {
            return Promise.resolve({});
          }
        },
        set: noop,
      },
    },
    tabs: {
      create: noop,
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
      query: noop,
      remove: noop,
      update: noop,
    },
    topSites: {
      get: noop,
    },
    windows: {
      getCurrent: noop,
      update: noop,
    },
    // TODO: Remove type cast + update mocks once we update to manifest v3
  } as typeof window.chrome;

  global.DocumentFragment = window.DocumentFragment;
  global.CSSStyleSheet = window.CSSStyleSheet;
  // @ts-expect-error - replaceSync method will be added in TypeScript v4.8
  global.CSSStyleSheet.prototype.replaceSync ??= noop;

  // @ts-expect-error - just a simple mock
  global.fetch = () => Promise.resolve({
    json: () => Promise.resolve({}),
  });
}

export function mocksTeardown(): void {
  // @ts-expect-error - cleaning up
  // eslint-disable-next-line no-multi-assign
  global.chrome = global.DocumentFragment = global.CSSStyleSheet = global.fetch = undefined;
}
