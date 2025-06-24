import { append, clone, collect, h, ONCLICK } from 'stage1/fast';
import { compile } from 'stage1/macro' with { type: 'macro' };
import { chromeTabs, DEFAULT_SECTION_ORDER } from '../utils.ts';
import { Link, type LinkComponent, type LinkProps } from './Link.ts';

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

// oxlint-disable-next-line func-style
const handleTabClick = function (this: OpenTabLink): false {
  chromeTabs.getCurrent((currentTab) => {
    if (currentTab!.id === this.$$data.id) return;

    // Switch to the clicked tab
    void chrome.windows.update(this.$$data.windowId, { focused: true });
    void chromeTabs.update(this.$$data.id, { active: true });

    // Close current "new-tab" page
    void chromeTabs.remove(currentTab!.id!);
  });

  // Prevent default behaviour; shorter than `event.preventDefault()`
  return false;
};

// oxlint-disable-next-line typescript/no-explicit-any
export type SearchResultComponent<T = any> = HTMLDivElement & {
  $$update: (newData: T[]) => void;
  $$filter: (text: string) => void;
};

interface Refs {
  title: Text;
  results: HTMLDivElement;
  more: HTMLButtonElement;
}

const meta = compile<Refs>(`
  <div hidden>
    <h2>@title</h2>

    <div @results></div>

    <button @more>Show more</button>
  </div>
`);
const view = h<SearchResultComponent>(meta.html);

export const SearchResult = <T extends LinkProps & TabItem>(
  sectionName: (typeof DEFAULT_SECTION_ORDER)[number],
): SearchResultComponent<T> => {
  const root = clone<SearchResultComponent<T>>(view);
  const refs = collect<Refs>(root, meta.d);
  const title = refs[meta.ref.title];
  const results = refs[meta.ref.results];
  const more = refs[meta.ref.more];
  const isOpenTabs = sectionName === DEFAULT_SECTION_ORDER[0];
  let rawData: T[];
  let renderedLength: number;

  const renderList = (listData: T[], showCount = DEFAULT_RESULTS_AMOUNT) => {
    performance.mark(sectionName);

    const list = isOpenTabs ? listData : listData.slice(0, showCount);
    let index = 0;
    let link: LinkComponent;

    renderedLength = list.length;
    root.hidden = !renderedLength;
    more.hidden = renderedLength === listData.length;
    results.textContent = '';

    for (; index < renderedLength; index++) {
      link = append(Link(list[index]), results);
      if (isOpenTabs) {
        (link as OpenTabLink).$$data = list[index];
        link[ONCLICK] = handleTabClick;
      }
    }

    performance.measure(sectionName, sectionName);
  };

  // eslint-disable-next-line no-return-assign
  root.$$update = (newData) => renderList((rawData = newData));

  root.$$filter = (text) =>
    renderList(
      rawData.filter((item) =>
        (item.title + item.url).toLowerCase().includes(text.toLowerCase()),
      ),
    );

  title.nodeValue = sectionName;

  more[ONCLICK] = () =>
    renderList(rawData, renderedLength + MORE_RESULTS_AMOUNT);

  return root;
};
