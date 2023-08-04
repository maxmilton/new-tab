import { compile } from 'stage1/macro' assert { type: 'macro' };
import { collect, h } from 'stage1/runtime';

type MenuComponent = HTMLDivElement;

type Refs = {
  s: HTMLAnchorElement;
};

// TODO: Remove the quotes around href values to save bytes. Currently our
// tests fail without them because happy-dom can't parse element attribute
// values correctly when they're not sourrounded by quotes. See:
// https://github.com/capricorn86/happy-dom/issues/999

// https://github.com/tailwindlabs/heroicons/blob/master/optimized/outline/menu.svg
const meta = compile(`
  <div id=m>
    <svg id=im>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>

    <div id=d>
      <a href="chrome://new-tab-page">Open Default Tab</a>
      <a href="chrome://bookmarks">Bookmarks Manager</a>
      <a href="chrome://downloads">Downloads</a>
      <a href="chrome://history">History</a>
      <a href="chrome://settings/passwords">Passwords</a>

      <hr>

      <a @s>New Tab Settings</a>
      <a href="https://github.com/maxmilton/new-tab/issues">Report Bug</a>
    </div>
  </div>
`);
const view = h<MenuComponent>(meta.html);

export const Menu = (): MenuComponent => {
  const root = view;
  const refs = collect<Refs>(root, meta.k, meta.d);

  refs.s.__click = () => chrome.runtime.openOptionsPage();

  return root;
};
