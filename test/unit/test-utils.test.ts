import { afterEach, describe, expect, spyOn, test } from 'bun:test';
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

  test('debug function prints to console', async () => {
    const logSpy = spyOn(console, 'log')
      // @ts-expect-error - noop mock
      .mockImplementation(() => {});
    const rendered = render(document.createElement('div'));
    await rendered.debug();
    expect(logSpy).toHaveBeenCalledTimes(1);
    // FIXME: Uncomment when bun:test supports toHaveBeenCalledWith !!!
    // expect(logSpy).toHaveBeenCalledWith('DEBUG:\n<div></div>\n');
    logSpy.mockRestore();
  });

  test('debug function prints prettified container DOM to console', async () => {
    const logSpy = spyOn(console, 'log')
      // @ts-expect-error - noop mock
      .mockImplementation(() => {});
    const main = document.createElement('main');
    main.append(
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    );
    const rendered = render(main);
    await rendered.debug();
    expect(logSpy).toHaveBeenCalledTimes(1);
    // FIXME: Uncomment when bun:test supports toHaveBeenCalledWith !!!
    // expect(logSpy).toHaveBeenCalledWith('DEBUG:\n<main>\n  <div></div>\n  <div></div>\n  <div></div>\n</main>\n');
    logSpy.mockRestore();
  });

  test('renders Test component correctly', () => {
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
