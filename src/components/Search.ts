import h, { HNode } from 'stage0';
import type { UserStorageData } from '../types';
import { debounce, DEFAULT_ORDER } from '../utils';
import { SearchResult } from './SearchResult';

type SearchComponent = HNode<HTMLDivElement>;

interface RefNodes {
  input: HTMLInputElement;
}

// TODO: Implement search and list filtering
function doSearch(text: string) {
  console.log('## SEARCH TEXT', text);
}

const debouncedDoSearch = debounce(doSearch);

const view = h`
  <div class=container>
    <input id=search placeholder="Search browser..." autocomplete=off #input>
    <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" class=s-icon>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
  </div>
`;

export function Search(): SearchComponent {
  const root = view as SearchComponent;
  const { input } = view.collect(root) as RefNodes;

  const section: Record<string, ReturnType<typeof SearchResult>> = {};

  input.oninput = () => debouncedDoSearch(input.value);

  input.onkeyup = (event) => {
    if (event.key === 'Escape') {
      input.value = '';
    }
  };

  const update = () => {
    if (section['Open Tabs']) {
      chrome.tabs.query({}, (tabs) => {
        section['Open Tabs'].update(tabs);
      });
    }
  };

  // Get user settings
  chrome.storage.local.get(null, (settings: UserStorageData) => {
    const order = settings.o || DEFAULT_ORDER;

    order.forEach((name) => {
      section[name] = root.appendChild(SearchResult(name, []));
    });

    update();

    if (section['Top Sites']) {
      chrome.topSites.get((sites) => {
        section['Top Sites'].update(sites);
      });
    }
  });

  // Update tab list on tab events
  chrome.tabs.onUpdated.addListener(update);
  chrome.tabs.onRemoved.addListener(update);
  chrome.tabs.onMoved.addListener(update);

  return root;
}
