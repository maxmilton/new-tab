import h from 'stage0';
import reuseNodes from 'stage0/reuseNodes';
import { Link } from './Link';
import { TabLink } from './TabLink';

interface SearchResultComponent extends HTMLDivElement {
  update(raw: any[]): void;
}

interface RefNodes {
  list: HTMLDivElement;
  more: HTMLButtonElement;
  title: Text;
}

const DEFAULT_RESULTS_COUNT = 10;
const MORE_RESULTS_COUNT = 50;

const view = h`
  <div style=display:none>
    <h2>#title</h2>

    <div #list></div>

    <button style=display:none #more>Show more ▾</button>
  </div>
`;

export function SearchResult(name: string, raw: any[]): SearchResultComponent {
  const root = view.cloneNode(true) as SearchResultComponent;
  const { title, list, more } = view.collect(root) as RefNodes;

  const isOpenTabs = name === 'Open Tabs';

  title.nodeValue = name;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  let _raw = raw;
  let renderedData: any[] = [];

  const update = (newRaw: any[], showCount = DEFAULT_RESULTS_COUNT) => {
    const partial = isOpenTabs ? newRaw : newRaw.slice(0, showCount);
    const rawLength = newRaw.length;

    reuseNodes(list, renderedData, partial, isOpenTabs ? TabLink : Link);

    _raw = newRaw;
    renderedData = partial;

    root.style.display = rawLength ? 'block' : 'none';
    more.style.display = isOpenTabs || showCount >= rawLength ? 'none' : 'block';
  };

  root.update = update;
  update(raw);

  more.__click = () => {
    update(_raw, renderedData.length + MORE_RESULTS_COUNT);
  };

  return root;
}
