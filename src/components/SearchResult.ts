import h from 'stage0';
import { Link, LinkProps } from './Link';
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

export function SearchResult<T extends LinkProps>(
  sectionName: string,
  raw: T[],
): SearchResultComponent {
  const root = view.cloneNode(true) as SearchResultComponent;
  const { name, list, more } = view.collect(root) as RefNodes;
  const isOpenTabs = sectionName === 'Open Tabs';

  // eslint-disable-next-line @typescript-eslint/naming-convention
  let _raw: T[];
  let renderedLength: number;

  const renderList = (data: T[], showCount = DEFAULT_RESULTS_COUNT) => {
    const partial = isOpenTabs ? data : data.slice(0, showCount);
    renderedLength = partial.length;

    // Remove all child nodes
    list.textContent = '';

    // eslint-disable-next-line no-restricted-syntax
    for (const item of partial) {
      list.appendChild((isOpenTabs ? TabLink : Link)(item));
    }

    root.style.display = renderedLength ? 'block' : 'none';
    more.style.display = isOpenTabs || renderedLength >= data.length ? 'none' : 'block';
  };

  const update = (newRaw: T[]) => {
    renderList(newRaw);

    _raw = newRaw;
  };

  root.update = update;

  root.filter = (text) => renderList(
    _raw.filter(
      ({ title, url }) => `${url}/${title}`.toLowerCase().indexOf(text.toLowerCase()) > -1,
    ),
  );

  more.__click = () => renderList(_raw, renderedLength + MORE_RESULTS_COUNT);

  name.textContent = sectionName;

  update(raw);

  return root;
}
