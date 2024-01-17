import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { Test } from '../TestComponent';
import * as utilsExports from './utils';
import { cleanup, performanceSpy, render } from './utils';

describe('exports', () => {
  const exports = ['cleanup', 'performanceSpy', 'render'];

  test.each(exports)('has "%s" named export', (exportName) => {
    expect(utilsExports).toHaveProperty(exportName);
  });

  test('does not have a default export', () => {
    expect(utilsExports).not.toHaveProperty('default');
  });

  test('does not export anything else', () => {
    expect(Object.keys(utilsExports)).toHaveLength(exports.length);
  });
});

describe('render (no call)', () => {
  test('is a function', () => {
    expect(render).toBeInstanceOf(Function);
  });

  test('takes a single argument', () => {
    expect(render).toHaveLength(1);
  });
});

describe('render', () => {
  afterEach(cleanup);

  test('returns a container element', () => {
    const rendered = render(document.createElement('div'));
    expect(rendered).toHaveProperty('container');
    expect(rendered.container).toBeInstanceOf(window.Element);
  });

  test('mounts supplied element in container', () => {
    const el = document.createElement('span');
    const rendered = render(el);
    expect(rendered.container.firstChild).toBe(el);
  });

  test('mounts container div to document body', () => {
    expect(document.body.firstChild).toBeNull();
    const rendered = render(document.createElement('div'));
    expect(document.body.firstChild).toBe(rendered.container);
    expect(document.body.firstChild).toBeInstanceOf(window.HTMLDivElement);
  });

  test('mounts containers when other DOM elements exist on document body', () => {
    document.body.append(document.createElement('span'));
    document.body.append(document.createElement('span'));
    render(document.createElement('a'));
    render(document.createElement('a'));
    document.body.append(document.createElement('span'));
    expect(document.body.childNodes).toHaveLength(5);
    expect(document.body.innerHTML).toBe(
      '<span></span><span></span><div><a></a></div><div><a></a></div><span></span>',
    );
    document.body.textContent = '';
  });

  test('renders Test component correctly', () => {
    const rendered = render(Test({ text: 'abc' }));
    expect(rendered.container.innerHTML).toBe('<div id="test">abc</div>');
  });

  describe('unmount method', () => {
    test('is a function', () => {
      const rendered = render(document.createElement('div'));
      expect(rendered).toHaveProperty('unmount');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(rendered.unmount).toBeInstanceOf(Function);
    });

    test('removes supplied element from container', () => {
      const rendered = render(document.createElement('div'));
      expect(rendered.container.firstChild).toBeTruthy();
      rendered.unmount();
      expect(rendered.container).toBeTruthy();
      expect(rendered.container.firstChild).toBeNull();
    });
  });

  describe('debug method', () => {
    test('is a function', () => {
      const rendered = render(document.createElement('div'));
      expect(rendered).toHaveProperty('debug');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(rendered.debug).toBeInstanceOf(Function);
    });

    test('prints to console2', async () => {
      const spy = spyOn(console2, 'log').mockImplementation(() => {});
      const rendered = render(document.createElement('div'));
      await rendered.debug();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('DEBUG:\n<div></div>\n');
      spy.mockRestore();
    });

    test('does not print to console, only console2', async () => {
      const spy = spyOn(console, 'log').mockImplementation(() => {});
      const spy2 = spyOn(console2, 'log').mockImplementation(() => {});
      const rendered = render(document.createElement('div'));
      await rendered.debug();
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledTimes(1);
      spy.mockRestore();
      spy2.mockRestore();
    });

    test('prints prettified container DOM to console', async () => {
      const spy = spyOn(console2, 'log').mockImplementation(() => {});
      const main = document.createElement('main');
      main.append(
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      );
      const rendered = render(main);
      await rendered.debug();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        'DEBUG:\n<main>\n  <div></div>\n  <div></div>\n  <div></div>\n</main>\n',
      );
      spy.mockRestore();
    });
  });
});

describe('cleanup', () => {
  test('is a function', () => {
    expect(cleanup).toBeInstanceOf(Function);
  });

  test('takes no arguments', () => {
    expect(cleanup).toHaveLength(0);
  });

  test('throws when there are no rendered components', () => {
    expect(() => cleanup()).toThrow();
  });

  test('removes mounted container from document body', () => {
    render(document.createElement('div'));
    expect(document.body.firstChild).toBeTruthy();
    cleanup();
    expect(document.body.firstChild).toBeNull();
  });

  test('removes multiple mounted containers from document body', () => {
    render(document.createElement('div'));
    render(document.createElement('div'));
    render(document.createElement('div'));
    expect(document.body.childNodes).toHaveLength(3);
    cleanup();
    expect(document.body.childNodes).toHaveLength(0);
  });

  test('only removes mounted containers and not other DOM nodes', () => {
    document.body.append(document.createElement('span'));
    document.body.append(document.createElement('span'));
    render(document.createElement('a'));
    render(document.createElement('a'));
    document.body.append(document.createElement('span'));
    expect(document.body.childNodes).toHaveLength(5);
    cleanup();
    expect(document.body.childNodes).toHaveLength(3);
    for (const node of document.body.childNodes) {
      expect(node).toBeInstanceOf(window.HTMLSpanElement);
    }
    document.body.textContent = '';
  });
});

describe('performanceSpy', () => {
  test('is a function', () => {
    expect(performanceSpy).toBeInstanceOf(Function);
  });

  test('takes no arguments', () => {
    expect(performanceSpy).toHaveLength(0);
  });

  test('returns a function', () => {
    const check = performanceSpy();
    expect(check).toBeInstanceOf(Function);
    check();
  });

  test('returned function takes no arguments', () => {
    const check = performanceSpy();
    expect(check).toHaveLength(0);
    check();
  });

  test('passes when no performance methods are called', () => {
    const check = performanceSpy();
    check();
  });

  // TODO: Don't skip this once test.failing() is supported in bun. We need to
  // check that the expect() inside the performanceSpy() fails (meaning this
  // test should then be a pass).
  //  ↳ https://jestjs.io/docs/api#testfailingname-fn-timeout
  test.skip('fails when performance methods are called', () => {
    const check = performanceSpy();
    performance.mark('a');
    performance.measure('a', 'a');
    check();
  });
});
