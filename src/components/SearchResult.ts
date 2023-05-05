import { append, createFragment, h } from 'stage1';
import { DEFAULT_SECTION_ORDER } from '../utils';
import { Link, type LinkProps } from './Link';
import { TabLink } from './TabLink';

export type SearchResultComponent = HTMLDivElement & {
  update: (this: void, newData: any[]) => void;
  filter: (this: void, text: string) => void;
};
type Refs = {
  t: Text;
  l: HTMLDivElement;
  m: HTMLButtonElement;
};

const DEFAULT_RESULTS_AMOUNT = 12; // chrome.topSites.get returns 12 items
const MORE_RESULTS_AMOUNT = 50;

const view = h(`
  <div hidden>
    <h2 #t></h2>

    <div #l></div>

    <button #m>Show more</button>
  </div>
`);

export const SearchResult = <T extends LinkProps>(
  sectionName: string,
): SearchResultComponent => {
  const root = view.cloneNode(true) as SearchResultComponent;
  const nodes = view.collect<Refs>(root);
  const isOpenTabs = sectionName === DEFAULT_SECTION_ORDER[0];
  let rawData: T[];
  let renderedLength: number;

  const renderList = (listData: T[], showCount = DEFAULT_RESULTS_AMOUNT) => {
    performance.mark(sectionName);

    const partial = isOpenTabs ? listData : listData.slice(0, showCount);
    const frag = createFragment();
    renderedLength = partial.length;

    partial.forEach((item) => {
      // @ts-expect-error - FIXME:!
      append((isOpenTabs ? TabLink : Link)(item), frag);
    });

    nodes.l.replaceChildren(frag);

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
