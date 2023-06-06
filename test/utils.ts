// FIXME: This file doesn't get included in coverage reports even with `c8 --include=test/utils.ts`
//  ↳ https://github.com/bcoe/c8/issues/250

import { spyOn } from 'nanospy';
import { suite, type Context, type Test } from 'uvu';
import type * as _assert from 'uvu/assert';

// https://github.com/lukeed/uvu/issues/43#issuecomment-740817223
export function describe<T = Context>(
  name: string,
  fn: (test: Test<T>) => void,
): void {
  const test = suite<T>(name);
  fn(test);
  test.run();
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

const mountedContainers = new Set<HTMLDivElement>();

export function render(component: Node): RenderResult {
  const container = document.createElement('div');

  container.appendChild(component);
  document.body.appendChild(container);

  mountedContainers.add(container);

  return {
    container,
    debug(el = container) {
      /* prettier-ignore */ // eslint-disable-next-line
      console.log('DEBUG:\n' + require('prettier').format(el.innerHTML, { parser: 'html' }));
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

export function consoleSpy(): (assert: typeof _assert) => void {
  const errorSpy = spyOn(window.console, 'error');
  const warnSpy = spyOn(window.console, 'warn');
  const infoSpy = spyOn(window.console, 'info');
  const logSpy = spyOn(window.console, 'log');
  const debugSpy = spyOn(window.console, 'debug');
  const traceSpy = spyOn(window.console, 'trace');

  return (assert) => {
    assert.is(errorSpy.callCount, 0, 'calls to console.error');
    assert.is(warnSpy.callCount, 0, 'calls to console.warn');
    assert.is(infoSpy.callCount, 0, 'calls to console.info');
    assert.is(logSpy.callCount, 0, 'calls to console.log');
    assert.is(debugSpy.callCount, 0, 'calls to console.debug');
    assert.is(traceSpy.callCount, 0, 'calls to console.trace');
    errorSpy.restore();
    warnSpy.restore();
    infoSpy.restore();
    logSpy.restore();
    debugSpy.restore();
    traceSpy.restore();
  };
}
