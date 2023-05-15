import { afterEach, describe, expect, test } from 'bun:test';
import { spyOn } from 'nanospy';
import { Test } from '../TestComponent';
import { cleanup, render } from './utils';

describe('render', () => {
  afterEach(cleanup);

  test('returns a container element', () => {
    const rendered = render(document.createElement('div'));
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

  test('returns an unmount function', () => {
    const rendered = render(document.createElement('div'));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(rendered.unmount).toBeInstanceOf(Function);
  });

  test('unmount removes supplied element from container', () => {
    const rendered = render(document.createElement('div'));
    expect(rendered.container.firstChild).toBeTruthy();
    rendered.unmount();
    expect(rendered.container).toBeTruthy();
    expect(rendered.container.firstChild).toBeNull();
  });

  test('returns a debug function', () => {
    const rendered = render(document.createElement('div'));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(rendered.debug).toBeInstanceOf(Function);
  });

  test('debug function prints to console', () => {
    const logSpy = spyOn(console, 'log', () => {});
    const rendered = render(document.createElement('div'));
    rendered.debug();
    expect(logSpy.called).toBe(true);
    expect(logSpy.calls[0]).toEqual(['DEBUG:\n<div></div>\n']);
    logSpy.restore();
  });

  // TODO: Debug output pretty print using custom stringifier + XMLSerializer().serializeToString
  //  ↳ https://github.com/capricorn86/happy-dom/blob/master/packages/happy-dom/src/xml-serializer/XMLSerializer.ts
  //  ↳ https://github.com/capricorn86/happy-dom/blob/master/packages/happy-dom/src/nodes/element/Element.ts#L286
  // test('debug function prints prettified container DOM to console', () => {
  //   // const logSpy = spyOn(console, 'log', () => {});
  //   const logSpy = spyOn(console, 'log');
  //   const main = document.createElement('main');
  //   main.append(
  //     document.createElement('div'),
  //     document.createElement('div'),
  //     document.createElement('div'),
  //   );
  //   const rendered = render(main);
  //   rendered.debug();
  //   assert.is(logSpy.callCount, 1);
  //   assert.equal(logSpy.calls[0], [
  //     'DEBUG:\n',
  //     '<main>\n  <div></div>\n  <div></div>\n  <div></div>\n</main>',
  //   ]);
  //   logSpy.restore();
  // });

  test('renders TestComponent correctly', () => {
    const rendered = render(Test({ text: 'abc' }));
    expect(rendered.container.innerHTML).toBe('<div id="test">abc</div>');
  });
});

describe('cleanup', () => {
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
