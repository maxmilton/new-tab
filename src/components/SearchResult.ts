import h from 'stage0';
import reuseNodes from 'stage0/reuseNodes';
import { Link } from './Link';

const DEFAULT_RESULTS_COUNT = 10;
const MORE_RESULTS_COUNT = 50;

const view = h`
  <div style=display:none>
    <h2>#title</h2>

    <div #list></div>

    <button style=display:none #more>Show more ▾</button>
  </div>
`;

export function SearchResult(name, raw) {
  const root = view.cloneNode(true);
  const { list, more, title } = view.collect(root);

  const isOpenTabs = name === 'Open Tabs';

  title.nodeValue = name;

  let _raw = raw;
  let renderedData = [];

  const update = (raw, showCount = DEFAULT_RESULTS_COUNT) => {
    const partial = isOpenTabs ? raw : raw.slice(0, showCount);
    const rawLength = raw.length;

    reuseNodes(list, renderedData, partial, Link);

    _raw = raw;
    renderedData = partial;

    root.style.display = rawLength ? 'block' : 'none';
    more.style.display =
      isOpenTabs || showCount >= rawLength ? 'none' : 'block';
  };

  root.update = update;
  update(raw);

  more.__click = () => {
    update(_raw, renderedData.length + MORE_RESULTS_COUNT);
  };

  // /** @param {MouseEvent} obj - A link item mouse click event. */
  // const handleTabClick = ({ target }) => {
  //   const windowId = target.getAttribute('w');

  //   // Update current tab
  //   chrome.tabs.update(+target.id, { active: true });

  //   // Switch active window if the tab isn't in the current window
  //   chrome.windows.getCurrent({}, (currentWindow) => {
  //     if (currentWindow.id !== windowId) {
  //       chrome.windows.update(windowId, { focused: true });
  //     }
  //   });

  //   // Close this NTP
  //   chrome.tabs.getCurrent((currentTab) => {
  //     chrome.tabs.remove(currentTab.id);
  //   });
  // };
  root.__click = (event: MouseEvent) => {
    // x
  };

  return root;
}
