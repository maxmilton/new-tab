import { afterEach, expect, test } from 'bun:test';
import { Menu } from '../../src/components/Menu';
import { cleanup, render } from './utils';

afterEach(cleanup);

// TODO: Test clicking the settings link calls openOptionsPage

// FIXME: Don't skip this test. Currently happy-dom can't parse hrefs correctly
// when they're not sourrounded by quotes. This is a bug in happy-dom.
test.skip('renders correctly', () => {
  const rendered = render(Menu());

  // FIXME: REMOVE!!!!!!!!!!!!!
  // rendered.debug();

  expect(rendered.container.querySelector('#m')).toBeTruthy();
  expect(rendered.container.querySelector('svg#im')).toBeTruthy();
  expect(rendered.container.querySelector('#d')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://new-tab-page"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://bookmarks"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://downloads"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://history"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://settings/passwords"]')).toBeTruthy();
  expect(
    rendered.container.querySelector('a[href="https://github.com/maxmilton/new-tab/issues"]'),
  ).toBeTruthy();
  //   expect(rendered.container.innerHTML).toMatchInlineSnapshot(`<div id="m">
  // <svg id="im">
  // <path d="M4 6h16M4 12h16M4 18h16"></path>
  // </svg>
  // <div id="d">
  // <a href="chrome://new-tab-page">Open Default Tab</a>
  // <a href="chrome://bookmarks">Bookmarks Manager</a>
  // <a href="chrome://downloads">Downloads</a>
  // <a href="chrome://history">History</a>
  // <a href="chrome://settings/passwords">Passwords</a>
  // <hr>
  // <a>New Tab Settings</a>
  // <a href="https://github.com/maxmilton/new-tab/issues">Report Bug</a>
  // </div>
  // </div>`);
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
