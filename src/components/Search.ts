import h from 'stage0';
import { SearchResult } from './SearchResult';
import { debounce, DEFAULT_ORDER } from '../utils';

type SearchComponent = HTMLDivElement;

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

  const state: Record<string, ReturnType<typeof SearchResult>> = {};

  input.oninput = (event) => {
    debouncedDoSearch(input.value);
  };

  input.onkeyup = (event) => {
    if (event.key === 'Escape') {
      input.value = '';
    }
  };

  const update = () => {
    chrome.tabs.query({}, (tabs) => {
      state['Open Tabs'].update(tabs);
    });
  };

  // Get user settings
  chrome.storage.local.get(null, (settings) => {
    const order = settings.o || DEFAULT_ORDER;

    order.forEach((name) => {
      state[name] = root.appendChild(SearchResult(name, []));
    });

    update();

    if (state['Top Sites']) {
      chrome.topSites.get((sites) => {
        state['Top Sites'].update(sites);
      });
    }
  });

  // Update tab list on tab events
  chrome.tabs.onUpdated.addListener(update);
  chrome.tabs.onRemoved.addListener(update);
  chrome.tabs.onMoved.addListener(update);

  return root;
}
