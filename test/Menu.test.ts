import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Menu } from '../src/components/Menu';
import { cleanup, render } from './utils';

test.after.each(cleanup);

test('renders correctly', () => {
  const rendered = render(Menu());
  assert.ok(rendered.container.querySelector('#m'));
  assert.ok(rendered.container.querySelector('svg#im'));
  assert.ok(rendered.container.querySelector('#d'));
  assert.ok(rendered.container.querySelector('a[href="chrome://new-tab-page"]'));
  assert.ok(rendered.container.querySelector('a[href="chrome://bookmarks"]'));
  assert.ok(rendered.container.querySelector('a[href="chrome://downloads"]'));
  assert.ok(rendered.container.querySelector('a[href="chrome://history"]'));
  assert.ok(rendered.container.querySelector('a[href="chrome://settings/passwords"]'));
  assert.ok(
    rendered.container.querySelector('a[href="https://github.com/maxmilton/new-tab/issues"]'),
  );
  assert.fixture(
    rendered.container.innerHTML,
    `<div id="m">
<svg id="im">
<path d="M4 6h16M4 12h16M4 18h16"></path>
</svg>
<div id="d">
<a href="chrome://new-tab-page">Open Default Tab</a>
<a href="chrome://bookmarks">Bookmarks Manager</a>
<a href="chrome://downloads">Downloads</a>
<a href="chrome://history">History</a>
<a href="chrome://settings/passwords">Passwords</a>
<hr>
<a>New Tab Settings</a>
<a href="https://github.com/maxmilton/new-tab/issues">Report Bug</a>
</div>
</div>`,
  );
});

test('has expected node refs', () => {
  const rendered = render(Menu());
  // @ts-expect-error - FIXME:!
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  assert.is(rendered.container.firstChild._refs.length, 1);
  // @ts-expect-error - FIXME:!
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  assert.type(rendered.container.firstChild._refs[0].ref, 'string');
});

// TODO: Test clicking the settings link calls openOptionsPage

test.run();
