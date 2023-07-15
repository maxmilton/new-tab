import { expect, spyOn, type Mock } from 'bun:test';

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
  debug(el?: Element): Promise<void>;
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
    async debug(el = container) {
      const { format } = await import('prettier');
      // eslint-disable-next-line no-console
      console.log(`DEBUG:\n${await format(el.innerHTML, { parser: 'html' })}`);
    },
    unmount() {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      container.removeChild(component);
    },
  };
}

export function cleanup(): void {
  if (mountedContainers.size === 0) {
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

const consoleMethods = Object.getOwnPropertyNames(
  window.console,
) as (keyof Console)[];

export function consoleSpy(): () => void {
  const spies: Mock<() => void>[] = [];

  for (const method of consoleMethods) {
    spies.push(spyOn(window.console, method));
  }

  return () => {
    for (const spy of spies) {
      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockRestore();
    }
  };
}
