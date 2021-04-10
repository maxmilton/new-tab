import h from 'stage0';
import reuseNodes from 'stage0/reuseNodes';
import { Link } from './Link';
import { TabLink } from './TabLink';

interface SearchResultComponent extends HTMLDivElement {
  update: (this: void, data: any[]) => void;
  filter: (text: string) => void;
}

interface RefNodes {
  name: Text;
  list: HTMLDivElement;
  more: HTMLButtonElement;
}

const DEFAULT_RESULTS_COUNT = 10;
const MORE_RESULTS_COUNT = 50;

const view = h`
  <div style=display:none>
    <h2 #name></h2>

    <div #list></div>

    <button style=display:none #more>Show more ▾</button>
  </div>
`;

export function SearchResult<T extends { title: string; url: string }>(
  sectionName: string,
  raw: T[],
): SearchResultComponent {
  const root = view.cloneNode(true) as SearchResultComponent;
  const { name, list, more } = view.collect(root) as RefNodes;
  const isOpenTabs = sectionName === 'Open Tabs';

  name.textContent = sectionName;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  let _raw = raw;
  let renderedData: T[] = [];

  const renderList = (data: T[], showCount = DEFAULT_RESULTS_COUNT) => {
    const partial = isOpenTabs ? data : data.slice(0, showCount);
    const rawLength = data.length;

    reuseNodes(list, renderedData, partial, isOpenTabs ? TabLink : Link);

    renderedData = partial;

    root.style.display = rawLength ? 'block' : 'none';
    more.style.display = isOpenTabs || showCount >= rawLength ? 'none' : 'block';
  };

  const update = (newRaw: T[]) => {
    renderList(newRaw);

    _raw = newRaw;
  };

  root.update = update;

  root.filter = (text) => renderList(
    _raw.filter(
      ({ title, url }) => `${url.slice(url.indexOf('://'))}/${title}`
        .toLowerCase()
        .indexOf(text.toLowerCase()) > -1,
    ),
  );

  more.__click = () => renderList(_raw, renderedData.length + MORE_RESULTS_COUNT);

  update(raw);

  return root;
}
