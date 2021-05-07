import { h, S1Node } from 'stage1';
import { append } from '../utils';
import { Link, LinkProps } from './Link';
import { TabLink } from './TabLink';

export type SearchResultComponent = S1Node &
HTMLDivElement & {
  update: (this: void, newData: any[]) => void;
  filter: (text: string) => void;
};
type RefNodes = {
  name: Text;
  list: HTMLDivElement;
  more: HTMLButtonElement;
};

const DEFAULT_RESULTS_COUNT = 10;
const MORE_RESULTS_COUNT = 50;

const view = h`
  <div>
    <h2 #name></h2>

    <div #list></div>

    <button #more>Show more ▾</button>
  </div>
`;

export function SearchResult<T extends LinkProps>(
  sectionName: string,
  data: T[],
): SearchResultComponent {
  const root = view.cloneNode(true) as SearchResultComponent;
  const { name, list, more } = view.collect<RefNodes>(root);
  const isOpenTabs = sectionName === 'Open Tabs';
  let rawData: T[];
  let renderedLength: number;

  const renderList = (listData: T[], showCount = DEFAULT_RESULTS_COUNT) => {
    const partial = isOpenTabs ? listData : listData.slice(0, showCount);
    renderedLength = partial.length;

    // Remove all child nodes
    list.textContent = '';

    // eslint-disable-next-line no-restricted-syntax
    for (const item of partial) {
      // @ts-expect-error - FIXME
      append((isOpenTabs ? TabLink : Link)(item), list);
    }

    root.hidden = !renderedLength;
    more.hidden = isOpenTabs || renderedLength >= listData.length;
  };

  const update = (newData: T[]) => {
    renderList(newData);
    rawData = newData;
  };

  root.update = update;

  root.filter = (text) => renderList(
    rawData.filter(
      ({ title, url }) => `${url}/${title}`.toLowerCase().indexOf(text.toLowerCase()) > -1,
    ),
  );

  name.textContent = sectionName;

  more.__click = () => renderList(rawData, renderedLength + MORE_RESULTS_COUNT);

  update(data);

  return root;
}
