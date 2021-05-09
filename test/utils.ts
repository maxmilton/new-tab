// FIXME: This file doesn't get included in coverage reports even with `c8 --include=test/utils.ts`
//  ↳ https://github.com/bcoe/c8/issues/250

import { JSDOM } from 'jsdom';

const mountedContainers = new Set<{ container: HTMLDivElement }>();

function innerText(el: HTMLElement) {
  // eslint-disable-next-line no-param-reassign
  el = el.cloneNode(true) as HTMLElement;
  el.querySelectorAll('script,style').forEach((s) => s.remove());
  return el.textContent;
}

function mockInnerText() {
  Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
    get() {
      return innerText(this);
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
  // @ts-expect-error - Cleaning up
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

  mountedContainers.add({ container });

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
  mountedContainers.forEach(({ container }) => {
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  });
}
