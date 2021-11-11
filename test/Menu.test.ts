import { test } from 'uvu';
import * as assert from 'uvu/assert';
// import { Menu } from '../src/components/Menu';
import {
  cleanup, render, setup, teardown,
} from './utils';

type MenuComponent = typeof import('../src/components/Menu');

test.before(setup);
test.after(teardown);
test.after.each(cleanup);

test('renders correctly', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Menu } = require('../src/components/Menu') as MenuComponent;
  const rendered = render(Menu());
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
<a href="https://github.com/maxmilton/new-tab/issues">Submit Bug</a>
</div>
</div>`,
  );
});

test('has expected node refs', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Menu } = require('../src/components/Menu') as MenuComponent;
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
