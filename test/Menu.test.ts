import { test } from 'uvu';
import * as assert from 'uvu/assert';
// import { Menu } from '../src/components/Menu';
import {
  setup, render, cleanup, teardown,
} from './utils';

type MenuComponent = typeof import('../src/components/Menu');

test.before(setup);
test.after(teardown);
test.after.each(cleanup);

test('renders correctly', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Menu } = require('../src/components/Menu') as MenuComponent;
  const rendered = render(Menu());
  assert.snapshot(
    rendered.container.innerHTML,
    `<div id="menu">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>

    <div id="dropdown">
      <a href="chrome-search://local-ntp/local-ntp.html">Open Default Tab</a>
      <a href="chrome://bookmarks/">Bookmarks Manager</a>
      <a href="chrome://downloads/">Downloads</a>
      <a href="chrome://history/">History</a>
      <a href="chrome://settings/passwords">Passwords</a>

      <hr>

      <a>New Tab Settings</a>
      <a href="https://github.com/MaxMilton/new-tab/issues">Submit Bug</a>
    </div>
  </div>`,
  );
});

test('has expected node refs', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Menu } = require('../src/components/Menu') as MenuComponent;
  const rendered = render(Menu());
  // @ts-expect-error - FIXME:
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  assert.is(rendered.container.firstChild._refs.length, 1);
  // @ts-expect-error - FIXME:
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  assert.type(rendered.container.firstChild._refs[0].ref, 'string');
});

// TODO: Test clicking the settings link calls openOptionsPage

test.run();
