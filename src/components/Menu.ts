import { collect, h, ONCLICK } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };

type MenuComponent = HTMLDivElement;

interface Refs {
  s: HTMLAnchorElement;
}

// https://github.com/tailwindlabs/heroicons/blob/master/optimized/outline/menu.svg
const meta = compile<Refs>(`
  <div id=m>
    <svg id=im>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>

    <div id=d>
      <a href=chrome://bookmarks>Bookmarks</a>
      <a href=chrome://password-manager>Passwords</a>
      <a href=chrome://downloads>Downloads</a>
      <a href=chrome://history>History</a>
      <a href=chrome://extensions>Extensions</a>

      <hr>

      <a @s>New Tab Settings</a>
      <a href=https://github.com/maxmilton/new-tab/issues>Report Bug</a>
    </div>
  </div>
`);
const view = h<MenuComponent>(meta.html);

export const Menu = (): MenuComponent => {
  const root = view;
  const refs = collect<Refs>(root, meta.d);

  refs[meta.ref.s][ONCLICK] = () => chrome.runtime.openOptionsPage();

  return root;
};
