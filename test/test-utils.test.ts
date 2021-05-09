import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  setup, render, cleanup, teardown,
} from './utils';
// import { Test } from './TestComponent';

type TestComponent = typeof import('./TestComponent');

const utilSetup = suite('setup');
const utilTeardown = suite('teardown');
const utilRender = suite('render');
const utilCleanup = suite('clean');

utilSetup.after.each(teardown);
utilTeardown.before.each(setup);
utilRender.before(setup);
utilRender.after(teardown);
utilRender.after.each(cleanup);
utilCleanup.before(setup);
utilCleanup.after(teardown);

utilSetup('adds DOM globals', () => {
  assert.not.ok(global.window);
  assert.not.ok(global.document);
  setup();
  assert.ok(global.window);
  assert.ok(global.document);
});

utilSetup('adds innerText mock', () => {
  setup();
  const el = document.createElement('div');
  assert.is('innerText' in el, true);
  assert.is(el.innerText, '');
  el.innerText = 'abc';
  assert.is(el.innerText, 'abc');
});

utilSetup('throws when teardown has not run', () => {
  setup();
  assert.throws(() => setup());
  assert.throws(
    () => setup(),
    (err: Error) => err instanceof Error,
  );
});

utilTeardown('removes DOM globals', () => {
  assert.ok(global.window);
  assert.ok(global.document);
  teardown();
  assert.not.ok(global.window);
  assert.not.ok(global.document);
});

utilTeardown('throws when setup has not run', () => {
  teardown();
  assert.throws(() => teardown());
  assert.throws(
    () => teardown(),
    (err: Error) => err instanceof Error,
  );
});

utilRender('returns a container element', () => {
  const rendered = render(document.createElement('div'));
  assert.instance(rendered.container, window.Element);
});

utilRender('returns a debug function', () => {
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

utilRender('mounts supplied element in container', () => {
  const el = document.createElement('span');
  const rendered = render(el);
  assert.is(rendered.container.firstChild, el);
});

utilRender('mounts container div to document body', () => {
  assert.not.ok(document.body.firstChild);
  const rendered = render(document.createElement('div'));
  assert.is(document.body.firstChild, rendered.container);
  assert.type(document.body.firstChild, 'object');
  assert.instance(document.body.firstChild, window.HTMLDivElement);
});

utilRender(
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

utilRender('renders TestComponent correctly', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Test } = require('./TestComponent') as TestComponent;
  const rendered = render(Test({ text: 'abc' }));
  assert.snapshot(rendered.container.innerHTML, '<div id="test">abc</div>');
});

utilCleanup('removes mounted container from document body', () => {
  render(document.createElement('div'));
  assert.ok(document.body.firstChild);
  cleanup();
  assert.not.ok(document.body.firstChild);
});

utilCleanup('removes multiple mounted containers from document body', () => {
  render(document.createElement('div'));
  render(document.createElement('div'));
  render(document.createElement('div'));
  assert.is(document.body.childNodes.length, 3);
  cleanup();
  assert.is(document.body.childNodes.length, 0);
});

utilCleanup('only removes mounted containers and not other DOM nodes', () => {
  document.body.append(document.createElement('span'));
  document.body.append(document.createElement('span'));
  render(document.createElement('a'));
  render(document.createElement('a'));
  document.body.append(document.createElement('span'));
  assert.is(document.body.childNodes.length, 5);
  cleanup();
  assert.is(document.body.childNodes.length, 3);
  [...document.body.childNodes].forEach((node) => {
    assert.instance(node, window.HTMLSpanElement);
  });
});

utilSetup.run();
utilTeardown.run();
utilRender.run();
utilCleanup.run();
