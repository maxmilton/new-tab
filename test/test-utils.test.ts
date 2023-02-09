import { spyOn } from 'nanospy';
import * as assert from 'uvu/assert';
import { Test } from './TestComponent';
import { cleanup, describe, render } from './utils';

describe('render', (test) => {
  test.after.each(cleanup);

  test('returns a container element', () => {
    const rendered = render(document.createElement('div'));
    assert.instance(rendered.container, window.Element);
  });

  test('mounts supplied element in container', () => {
    const el = document.createElement('span');
    const rendered = render(el);
    assert.is(rendered.container.firstChild, el);
  });

  test('mounts container div to document body', () => {
    assert.not.ok(document.body.firstChild);
    const rendered = render(document.createElement('div'));
    assert.is(document.body.firstChild, rendered.container);
    assert.type(document.body.firstChild, 'object');
    assert.instance(document.body.firstChild, window.HTMLDivElement);
  });

  test('mounts containers when other DOM elements exist on document body', () => {
    document.body.append(document.createElement('span'));
    document.body.append(document.createElement('span'));
    render(document.createElement('a'));
    render(document.createElement('a'));
    document.body.append(document.createElement('span'));
    assert.is(document.body.childNodes.length, 5);
    assert.snapshot(
      document.body.innerHTML,
      '<span></span><span></span><div><a></a></div><div><a></a></div><span></span>',
    );
    document.body.textContent = '';
  });

  test('returns an unmount function', () => {
    const rendered = render(document.createElement('div'));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    assert.type(rendered.unmount, 'function');
  });

  test('unmount removes supplied element from container', () => {
    const rendered = render(document.createElement('div'));
    assert.ok(rendered.container.firstChild);
    rendered.unmount();
    assert.ok(rendered.container);
    assert.is(rendered.container.firstChild, null);
  });

  test('returns a debug function', () => {
    const rendered = render(document.createElement('div'));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    assert.type(rendered.debug, 'function');
  });

  test('debug function prints to console', () => {
    const logSpy = spyOn(console, 'log', () => {});
    const rendered = render(document.createElement('div'));
    rendered.debug();
    assert.is(logSpy.callCount, 1);
    assert.equal(logSpy.calls[0], ['DEBUG:\n<div></div>\n']);
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
    assert.snapshot(rendered.container.innerHTML, '<div id="test">abc</div>');
  });
});

describe('cleanup', (test) => {
  test('throws when there are no rendered components', () => {
    assert.throws(() => cleanup());
  });

  test('removes mounted container from document body', () => {
    render(document.createElement('div'));
    assert.ok(document.body.firstChild);
    cleanup();
    assert.not.ok(document.body.firstChild);
  });

  test('removes multiple mounted containers from document body', () => {
    render(document.createElement('div'));
    render(document.createElement('div'));
    render(document.createElement('div'));
    assert.is(document.body.childNodes.length, 3);
    cleanup();
    assert.is(document.body.childNodes.length, 0);
  });

  test('only removes mounted containers and not other DOM nodes', () => {
    document.body.append(document.createElement('span'));
    document.body.append(document.createElement('span'));
    render(document.createElement('a'));
    render(document.createElement('a'));
    document.body.append(document.createElement('span'));
    assert.is(document.body.childNodes.length, 5);
    cleanup();
    assert.is(document.body.childNodes.length, 3);
    for (const node of document.body.childNodes) {
      assert.instance(node, window.HTMLSpanElement);
    }
    document.body.textContent = '';
  });
});
