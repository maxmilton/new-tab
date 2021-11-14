import { h, S1Node } from 'stage1';

type MenuComponent = S1Node & HTMLDivElement;
type RefNodes = {
  s: HTMLAnchorElement;
};

// https://github.com/tailwindlabs/heroicons/blob/master/optimized/outline/menu.svg
const view = h(`
  <div id=m>
    <svg id=im>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>

    <div id=d>
      <a href=chrome://new-tab-page>Open Default Tab</a>
      <a href=chrome://bookmarks>Bookmarks Manager</a>
      <a href=chrome://downloads>Downloads</a>
      <a href=chrome://history>History</a>
      <a href=chrome://settings/passwords>Passwords</a>

      <hr>

      <a #s>New Tab Settings</a>
      <a href=https://github.com/maxmilton/new-tab/issues>Submit Bug</a>
    </div>
  </div>
`);

export const Menu = (): MenuComponent => {
  const root = view as MenuComponent;
  const { s } = view.collect<RefNodes>(root);

  s.__click = () => chrome.runtime.openOptionsPage();

  return root;
};
