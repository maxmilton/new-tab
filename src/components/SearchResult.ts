import { append, createFragment, h } from 'stage1';
import { DEFAULT_SECTION_ORDER } from '../utils';
import { Link, type LinkProps } from './Link';

const DEFAULT_RESULTS_AMOUNT = 12; // chrome.topSites.get returns 12 items
const MORE_RESULTS_AMOUNT = 50;

interface TabItem {
  /** Tab ID. */
  id: number;
  windowId: number;
}

const handleTabClick = (item: TabItem) => {
  // Switch to the clicked tab
  void chrome.tabs.update(item.id, { active: true });

  // Switch active window if the tab isn't in the current window
  chrome.windows.getCurrent({}, (currentWindow) => {
    if (currentWindow.id !== item.windowId) {
      void chrome.windows.update(item.windowId, { focused: true });
    }
  });

  // Close current "new-tab" page
  chrome.tabs.getCurrent((currentTab) => {
    void chrome.tabs.remove(currentTab!.id!);
  });
};

export type SearchResultComponent<T = any> = HTMLDivElement & {
  update: (this: void, newData: T[]) => void;
  filter: (this: void, text: string) => void;
};
type Refs = {
  t: Text;
  l: HTMLDivElement;
  m: HTMLButtonElement;
};

const view = h(`
  <div hidden>
    <h2 #t></h2>

    <div #l></div>

    <button #m>Show more</button>
  </div>
`);

export const SearchResult = <T extends LinkProps & TabItem>(
  sectionName: (typeof DEFAULT_SECTION_ORDER)[number],
): SearchResultComponent<T> => {
  const root = view.cloneNode(true) as SearchResultComponent<T>;
  const nodes = view.collect<Refs>(root);
  const isOpenTabs = sectionName === DEFAULT_SECTION_ORDER[0];
  let rawData: T[];
  let renderedLength: number;

  const renderList = (listData: T[], showCount = DEFAULT_RESULTS_AMOUNT) => {
    performance.mark(sectionName);

    const partial = isOpenTabs ? listData : listData.slice(0, showCount);
    const frag = createFragment();
    let link;

    partial.forEach((item) => {
      link = append(Link(item), frag);
      if (isOpenTabs) {
        link.__click = () => handleTabClick(item);
      }
    });

    nodes.l.replaceChildren(frag);

    renderedLength = partial.length;
    root.hidden = !renderedLength;
    nodes.m.hidden = renderedLength >= listData.length;

    performance.measure(sectionName, sectionName);
  };

  const update = (newData: T[]) => {
    renderList(newData);
    rawData = newData;
  };

  root.update = update;

  root.filter = (text) =>
    renderList(
      rawData.filter(
        (item) =>
          (item.title + '+' + item.url)
            .toLowerCase()
            .indexOf(text.toLowerCase()) > -1,
      ),
    );

  nodes.t.textContent = sectionName;

  nodes.m.__click = () =>
    renderList(rawData, renderedLength + MORE_RESULTS_AMOUNT);

  return root;
};
