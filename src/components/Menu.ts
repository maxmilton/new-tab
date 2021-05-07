import { h, S1Node } from 'stage1';

type MenuComponent = S1Node & HTMLDivElement;
type RefNodes = {
  s: HTMLAnchorElement;
};

// <div id=icon>☰</div>
const view = h`
  <div id=menu>
    <svg xmlns=http://www.w3.org/2000/svg width=30 height=30 viewBox="0 0 24 24" class=icon>
      <line x1=3 y1=12 x2=21 y2=12 />
      <line x1=3 y1=6 x2=21 y2=6 />
      <line x1=3 y1=18 x2=21 y2=18 />
    </svg>

    <div id=dropdown>
      <a href=chrome-search://local-ntp/local-ntp.html>Open Default Tab</a>
      <a href=chrome://bookmarks/>Bookmarks Manager</a>
      <a href=chrome://downloads/>Downloads</a>
      <a href=chrome://history/>History</a>
      <a href=chrome://settings/passwords>Passwords</a>

      <hr>

      <a #s>New Tab Settings</a>
      <a href=https://github.com/MaxMilton/new-tab/issues>Submit Bug</a>
    </div>
  </div>
`;

export function Menu(): MenuComponent {
  const root = view as MenuComponent;
  const { s } = view.collect<RefNodes>(root);

  s.__click = () => chrome.runtime.openOptionsPage();

  return root;
}
