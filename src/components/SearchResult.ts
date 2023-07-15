import { compile } from 'stage1/macro' assert { type: 'macro' };
import { append, clone, collect, h } from 'stage1/runtime';
import { DEFAULT_SECTION_ORDER } from '../utils';
import { Link, type LinkComponent, type LinkProps } from './Link';

const DEFAULT_RESULTS_AMOUNT = 12; // chrome.topSites.get returns 12 items
const MORE_RESULTS_AMOUNT = 50;

interface TabItem {
  /** Tab ID. */
  id: number;
  windowId: number;
}

interface OpenTabLink extends LinkComponent {
  $$data: TabItem;
}

// eslint-disable-next-line func-names
const handleTabClick = function (this: OpenTabLink) {
  const { id, windowId } = this.$$data;

  // Switch to the clicked tab
  void chrome.tabs.update(id, { active: true });

  // Switch active window if the tab isn't in the current window
  chrome.windows.getCurrent({}, (currentWindow) => {
    if (currentWindow.id !== windowId) {
      void chrome.windows.update(windowId, { focused: true });
    }
  });

  // Close current "new-tab" page
  chrome.tabs.getCurrent((currentTab) => {
    void chrome.tabs.remove(currentTab!.id!);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SearchResultComponent<T = any> = HTMLDivElement & {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  update: (this: void, newData: T[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  filter: (this: void, text: string) => void;
};

type Refs = {
  t: Text;
  l: HTMLDivElement;
  m: HTMLButtonElement;
};

const meta = compile(`
  <div hidden>
    <h2 @t></h2>

    <div @l></div>

    <button @m>Show more</button>
  </div>
`);
const view = h<SearchResultComponent>(meta.html);

export const SearchResult = <T extends LinkProps & TabItem>(
  sectionName: (typeof DEFAULT_SECTION_ORDER)[number],
): SearchResultComponent<T> => {
  const root = clone<SearchResultComponent<T>>(view);
  const refs = collect<Refs>(root, meta.k, meta.d);
  const list = refs.l;
  const isOpenTabs = sectionName === DEFAULT_SECTION_ORDER[0];
  let rawData: T[];
  let renderedLength: number;

  const renderList = (listData: T[], showCount = DEFAULT_RESULTS_AMOUNT) => {
    performance.mark(sectionName);

    const partial = isOpenTabs ? listData : listData.slice(0, showCount);
    let index = 0;
    let link;

    renderedLength = partial.length;
    root.hidden = !renderedLength;
    refs.m.hidden = renderedLength === listData.length;
    list.textContent = '';

    for (; index < renderedLength; index++) {
      link = append(Link(partial[index]), list);
      if (isOpenTabs) {
        (link as OpenTabLink).$$data = partial[index];
        link.__click = handleTabClick;
      }
    }

    performance.measure(sectionName, sectionName);
  };

  root.update = (newData) => {
    renderList(newData);
    rawData = newData;
  };

  root.filter = (text) =>
    renderList(
      rawData.filter((item) =>
        (item.title + '[' + item.url)
          .toLowerCase()
          .includes(text.toLowerCase()),
      ),
    );

  refs.t.textContent = sectionName;

  refs.m.__click = () =>
    renderList(rawData, renderedLength + MORE_RESULTS_AMOUNT);

  return root;
};
