import { h, S1Node } from 'stage1';
import { append, createFragment } from '../utils';
import { Link, LinkProps } from './Link';
import { TabLink } from './TabLink';

export type SearchResultComponent = S1Node &
HTMLDivElement & {
  update: (this: void, newData: any[]) => void;
  filter: (text: string) => void;
};
type RefNodes = {
  t: Text;
  l: HTMLDivElement;
  m: HTMLButtonElement;
};

const DEFAULT_RESULTS_AMOUNT = 10;
const MORE_RESULTS_AMOUNT = 50;

const view = h`
  <div>
    <h2 #t></h2>

    <div #l></div>

    <button #m>Show more ▾</button>
  </div>
`;

export function SearchResult<T extends LinkProps>(
  sectionName: string,
  data: T[],
): SearchResultComponent {
  const root = view.cloneNode(true) as SearchResultComponent;
  const { t, l, m } = view.collect<RefNodes>(root);
  const isOpenTabs = sectionName === 'Open Tabs';
  let rawData: T[];
  let renderedLength: number;

  const renderList = (listData: T[], showCount = DEFAULT_RESULTS_AMOUNT) => {
    const partial = isOpenTabs ? listData : listData.slice(0, showCount);
    const frag = createFragment();
    renderedLength = partial.length;

    partial.forEach((item) => {
      // @ts-expect-error - FIXME:!
      append((isOpenTabs ? TabLink : Link)(item), frag);
    });

    // remove all child nodes
    l.textContent = '';

    append(frag, l);

    root.hidden = !renderedLength;
    m.hidden = isOpenTabs || renderedLength >= listData.length;
  };

  const update = (newData: T[]) => {
    renderList(newData);
    rawData = newData;
  };

  root.update = update;

  root.filter = (text) => renderList(
    rawData.filter(
      ({ title, url }) => (url + '+' + title).toLowerCase().indexOf(text.toLowerCase()) > -1,
    ),
  );

  t.textContent = sectionName;

  m.__click = () => renderList(rawData, renderedLength + MORE_RESULTS_AMOUNT);

  update(data);

  return root;
}
