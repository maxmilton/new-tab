import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { Test } from '../TestComponent';
import * as utilsExports from './utils';
import { cleanup, performanceSpy, render } from './utils';

describe('exports', () => {
  const exports = ['cleanup', 'performanceSpy', 'render'];

  test.each(exports)('has "%s" named export', (exportName) => {
    expect.assertions(1);
    expect(utilsExports).toHaveProperty(exportName);
  });

  test('does not have a default export', () => {
    expect.assertions(1);
    expect(utilsExports).not.toHaveProperty('default');
  });

  test('does not export anything else', () => {
    expect.assertions(1);
    expect(Object.keys(utilsExports)).toHaveLength(exports.length);
  });
});

describe('render <no call>', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(render).toBeFunction();
    expect(render).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(render).toHaveParameters(1, 0);
  });
});

describe('render', () => {
  afterEach(cleanup);

  test('returns a container element', () => {
    expect.assertions(2);
    const rendered = render(document.createElement('div'));
    expect(rendered).toHaveProperty('container');
    expect(rendered.container).toBeInstanceOf(window.Element);
  });

  test('mounts supplied element in container', () => {
    expect.assertions(1);
    const el = document.createElement('span');
    const rendered = render(el);
    expect(rendered.container.firstChild).toBe(el);
  });

  test('mounts container div to document body', () => {
    expect.assertions(3);
    expect(document.body.firstChild).toBeNull();
    const rendered = render(document.createElement('div'));
    expect(document.body.firstChild).toBe(rendered.container);
    expect(document.body.firstChild).toBeInstanceOf(window.HTMLDivElement);
  });

  test('mounts containers when other DOM elements exist on document body', () => {
    expect.assertions(2);
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
    expect.assertions(1);
    const rendered = render(Test({ text: 'abc' }));
    expect(rendered.container.innerHTML).toBe('<div id="test">abc</div>');
  });

  describe('unmount method', () => {
    test('is a function', () => {
      expect.assertions(3);
      const rendered = render(document.createElement('div'));
      expect(rendered).toHaveProperty('unmount');
      expect(rendered.unmount).toBeFunction();
      expect(rendered.unmount).not.toBeClass();
    });

    test('expects no parameters', () => {
      expect.assertions(1);
      const rendered = render(document.createElement('div'));
      expect(rendered.unmount).toHaveParameters(0, 0);
    });

    test('removes supplied element from container', () => {
      expect.assertions(3);
      const rendered = render(document.createElement('div'));
      expect(rendered.container.firstChild).toBeTruthy();
      rendered.unmount();
      expect(rendered.container).toBeTruthy();
      expect(rendered.container.firstChild).toBeNull();
    });
  });

  describe('debug method', () => {
    test('is a function', () => {
      expect.assertions(3);
      const rendered = render(document.createElement('div'));
      expect(rendered).toHaveProperty('debug');
      expect(rendered.debug).toBeFunction();
      expect(rendered.debug).not.toBeClass();
    });

    test('expects 1 optional parameter', () => {
      expect.assertions(1);
      const rendered = render(document.createElement('div'));
      expect(rendered.debug).toHaveParameters(0, 1);
    });

    test('prints to $console', () => {
      expect.assertions(1);
      const spy = spyOn($console, 'log').mockImplementation(() => {});
      const rendered = render(document.createElement('div'));
      rendered.debug();
      expect(spy).toHaveBeenCalledTimes(1);
      // TODO: Uncomment once biome has a HTML parser.
      // expect(spy).toHaveBeenCalledWith('DEBUG:\n<div></div>\n');
      spy.mockRestore();
    });

    test('does not print to console, only $console', () => {
      expect.assertions(2);
      const spy = spyOn(console, 'log').mockImplementation(() => {});
      const spy2 = spyOn($console, 'log').mockImplementation(() => {});
      const rendered = render(document.createElement('div'));
      rendered.debug();
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledTimes(1);
      spy.mockRestore();
      spy2.mockRestore();
    });

    // TODO: Don't skip once biome has a HTML parser.
    test.skip('prints prettified container DOM to console', () => {
      expect.assertions(2);
      const spy = spyOn($console, 'log').mockImplementation(() => {});
      const main = document.createElement('main');
      main.append(
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      );
      const rendered = render(main);
      rendered.debug();
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
    expect.assertions(2);
    expect(cleanup).toBeFunction();
    expect(cleanup).not.toBeClass();
  });

  test('expects no parameters', () => {
    expect.assertions(1);
    expect(cleanup).toHaveParameters(0, 0);
  });

  test('throws when there are no rendered components', () => {
    expect.assertions(1);
    expect(() => {
      cleanup();
    }).toThrow();
  });

  test('removes mounted container from document body', () => {
    expect.assertions(2);
    render(document.createElement('div'));
    expect(document.body.firstChild).toBeTruthy();
    cleanup();
    expect(document.body.firstChild).toBeNull();
  });

  test('removes multiple mounted containers from document body', () => {
    expect.assertions(2);
    render(document.createElement('div'));
    render(document.createElement('div'));
    render(document.createElement('div'));
    expect(document.body.childNodes).toHaveLength(3);
    cleanup();
    expect(document.body.childNodes).toHaveLength(0);
  });

  test('only removes mounted containers and not other DOM nodes', () => {
    expect.assertions(5);
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
    expect.assertions(2);
    expect(performanceSpy).toBeFunction();
    expect(performanceSpy).not.toBeClass();
  });

  test('expects no parameters', () => {
    expect.assertions(1);
    expect(performanceSpy).toHaveParameters(0, 0);
  });

  test('returns a function', () => {
    expect.hasAssertions(); // variable number of assertions
    const check = performanceSpy();
    expect(check).toBeFunction();
    expect(check).not.toBeClass();
    check();
  });

  test('returned function expects no parameters', () => {
    expect.hasAssertions(); // variable number of assertions
    const check = performanceSpy();
    expect(check).toHaveParameters(0, 0);
    check();
  });

  test('passes when no performance methods are called', () => {
    expect.hasAssertions(); // variable number of assertions
    const check = performanceSpy();
    check();
  });

  // TODO: Don't skip this once test.failing() is supported in bun. We need to
  // check that the expect() inside the performanceSpy() fails (meaning this
  // test should then be a pass).
  //  ↳ https://jestjs.io/docs/api#testfailingname-fn-timeout
  test.skip('fails when performance methods are called', () => {
    expect.hasAssertions(); // variable number of assertions
    const check = performanceSpy();
    performance.mark('a');
    performance.measure('a', 'a');
    check();
  });
});
