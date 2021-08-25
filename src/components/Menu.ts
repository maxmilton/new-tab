import { h, S1Node } from 'stage1';

type MenuComponent = S1Node & HTMLDivElement;
type RefNodes = {
  s: HTMLAnchorElement;
};

// https://github.com/feathericons/feather/blob/master/icons/menu.svg
const view = h`
  <div id=m>
    <svg viewBox="0 0 24 24" class=i>
      <line x1=3 y1=6 x2=21 y2=6 />
      <line x1=3 y1=12 x2=21 y2=12 />
      <line x1=3 y1=18 x2=21 y2=18 />
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
`;

export function Menu(): MenuComponent {
  const root = view as MenuComponent;
  const { s } = view.collect<RefNodes>(root);

  s.__click = () => chrome.runtime.openOptionsPage();

  return root;
}
