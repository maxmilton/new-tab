import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  cleanup, mockFn, render, setup, teardown,
} from './utils';
// import { Test } from './TestComponent';

// TODO: Migrate to "describe" with nested "test"?
// // https://github.com/lukeed/uvu/issues/43#issuecomment-740817223
// function describe(name: string, fn: (test: ReturnType<typeof suite>) => void) {
//   const testSuite = suite(name);
//   fn(testSuite);
//   testSuite.run();
// }
//
// describe('thing', (test) => {
//   test.before(setup);
//   test.after(teardown);
//   test('does the thing', () => {});
// });

type TestComponent = typeof import('./TestComponent');

const setupUtil = suite('setup');
const teardownUtil = suite('teardown');
const renderUtil = suite('render');
const cleanupUtil = suite('clean');
const mockFnUtil = suite('mockFn');

setupUtil.after.each(teardown);
teardownUtil.before.each(setup);
renderUtil.before(setup);
renderUtil.after(teardown);
renderUtil.after.each(cleanup);
cleanupUtil.before(setup);
cleanupUtil.after(teardown);

setupUtil('adds DOM globals', () => {
  assert.not.ok(global.window);
  assert.not.ok(global.document);
  setup();
  assert.ok(global.window);
  assert.ok(global.document);
});

// setupUtil('adds innerText mock', () => {
//   setup();
//   const el = document.createElement('div');
//   assert.is('innerText' in el, true);
//   // eslint-disable-next-line unicorn/prefer-dom-node-text-content
//   assert.is(el.innerText, '');
//   // eslint-disable-next-line unicorn/prefer-dom-node-text-content
//   el.innerText = 'abc';
//   // eslint-disable-next-line unicorn/prefer-dom-node-text-content
//   assert.is(el.innerText, 'abc');
// });

setupUtil('throws when teardown has not run', () => {
  setup();
  assert.throws(() => setup());
  assert.throws(
    () => setup(),
    (err: Error) => err instanceof Error,
  );
});

teardownUtil('removes DOM globals', () => {
  assert.ok(global.window);
  assert.ok(global.document);
  teardown();
  assert.not.ok(global.window);
  assert.not.ok(global.document);
});

teardownUtil('throws when setup has not run', () => {
  teardown();
  assert.throws(() => teardown());
  assert.throws(
    () => teardown(),
    (err: Error) => err instanceof Error,
  );
});

renderUtil('returns a container element', () => {
  const rendered = render(document.createElement('div'));
  assert.instance(rendered.container, window.Element);
});

renderUtil('returns a debug function', () => {
  const rendered = render(document.createElement('div'));
  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert.type(rendered.debug, 'function');
});

// TODO:
// utilRender('debug function prints to console', () => {
//   const rendered = render(document.createElement('div'));
// });

// TODO:
// utilRender('debug function prints prettified container DOM to console', () => {
//   const el = document.createElement('main');
//   el.append(
//     document.createElement('div'),
//     document.createElement('div'),
//     document.createElement('div'),
//   );
//   const rendered = render(el);
// });

renderUtil('mounts supplied element in container', () => {
  const el = document.createElement('span');
  const rendered = render(el);
  assert.is(rendered.container.firstChild, el);
});

renderUtil('mounts container div to document body', () => {
  assert.not.ok(document.body.firstChild);
  const rendered = render(document.createElement('div'));
  assert.is(document.body.firstChild, rendered.container);
  assert.type(document.body.firstChild, 'object');
  assert.instance(document.body.firstChild, window.HTMLDivElement);
});

renderUtil(
  'mounts containers when other DOM elements exist on document body',
  () => {
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
  },
);

renderUtil('renders TestComponent correctly', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Test } = require('./TestComponent') as TestComponent;
  const rendered = render(Test({ text: 'abc' }));
  assert.snapshot(rendered.container.innerHTML, '<div id="test">abc</div>');
});

cleanupUtil('removes mounted container from document body', () => {
  render(document.createElement('div'));
  assert.ok(document.body.firstChild);
  cleanup();
  assert.not.ok(document.body.firstChild);
});

cleanupUtil('removes multiple mounted containers from document body', () => {
  render(document.createElement('div'));
  render(document.createElement('div'));
  render(document.createElement('div'));
  assert.is(document.body.childNodes.length, 3);
  cleanup();
  assert.is(document.body.childNodes.length, 0);
});

cleanupUtil('only removes mounted containers and not other DOM nodes', () => {
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
});

mockFnUtil('proxy target is the passed impl argument', () => {
  const ref = 'abc';
  function fn() {
    return ref;
  }
  const mocked = mockFn(fn);
  assert.is(mocked(), ref);
});

mockFnUtil('increments calledTimes() counter on each call', () => {
  const mocked = mockFn();
  assert.is(mocked.calledTimes(), 0);
  mocked();
  assert.is(mocked.calledTimes(), 1);
  mocked();
  assert.is(mocked.calledTimes(), 2);
  mocked();
  assert.is(mocked.calledTimes(), 3);
});

setupUtil.run();
teardownUtil.run();
renderUtil.run();
cleanupUtil.run();
mockFnUtil.run();
